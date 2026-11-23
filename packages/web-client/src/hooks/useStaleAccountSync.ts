import { mailboxOperationsListMailboxesQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	syncOperationsGetSyncStatus,
	syncOperationsTriggerSync,
} from "@remit/api-http-client/sdk.gen.ts";
import type { RemitImapAccountResponse } from "@remit/api-http-client/types.gen.ts";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import pMap from "p-map";
import { useCallback, useEffect, useRef } from "react";
import { useErrorBanners } from "../components/ui/error-banner-context";
import { buildMutationErrorBanner } from "../components/ui/error-banners";
import { isAbortError, isUnauthenticated } from "../lib/error-classifier";
import { escalate } from "../lib/escalate";
import {
	HOT_POLL_INTERVAL_MS,
	isHotSyncWindowActive,
	subscribeHotSyncWindow,
} from "../lib/hot-sync-window";
import { getOfflineRuntime } from "../lib/offline-runtime";
import { getRuntimeConfig } from "../runtime-config";
import {
	inboxSyncedAt,
	REFRESH_TIMEOUT_MS,
	waitForSettled,
} from "./useRefreshControl";

/**
 * Mailboxes are considered stale 15 minutes after the last successful sync.
 * Exposed for unit tests and possible future tuning.
 */
export const STALENESS_THRESHOLD_MS = 15 * 60 * 1000;

const DEFAULT_POLL_INTERVAL_SECONDS = 30;

const parsePositiveIntSeconds = (
	raw: string | undefined,
	fallback: number,
): number => {
	if (!raw) return fallback;
	const parsed = Number.parseInt(raw, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Floor for the poll interval.
 *
 * This poll uses POST /sync, the same endpoint as a person pressing refresh,
 * and that endpoint's triggers skip the server's per-mailbox freshness gate
 * (`MAILBOX_FRESHNESS_MS`, 60s). A timer is not a person: every tick is a full
 * folder-by-folder re-enumeration for every open account, so the interval is
 * what bounds that work. Thirty seconds is the answer to how stale an open
 * tab's mail may be, and buys it at twice the fan-out the gate's own window
 * would allow. `mailboxPollIntervalSeconds` can lengthen the interval, never
 * shorten it past this.
 */
export const MIN_POLL_INTERVAL_MS = 30 * 1000;

/**
 * Resolve the configured poll interval, never returning less than
 * {@link MIN_POLL_INTERVAL_MS}.
 */
export const resolvePollIntervalMs = (
	configuredSeconds: string | undefined,
): number =>
	Math.max(
		parsePositiveIntSeconds(configuredSeconds, DEFAULT_POLL_INTERVAL_SECONDS) *
			1000,
		MIN_POLL_INTERVAL_MS,
	);

/**
 * Client-side online-poll interval (#1251): while an account's mail is open,
 * the tab re-triggers the same sync the pull-to-refresh path uses on this
 * cadence — the replacement for the server's removed "online tier".
 */
export const POLL_INTERVAL_MS = resolvePollIntervalMs(
	getRuntimeConfig().mailboxPollIntervalSeconds,
);

/**
 * The interval this tab is currently due on: the hot one while a refresh press
 * is still recent, the configured ambient one otherwise. A deployment that has
 * lengthened `mailboxPollIntervalSeconds` still gets the hot cadence for the
 * few minutes after a press, which is what makes a press mean "and keep
 * looking".
 */
export const currentPollIntervalMs = (
	now: number = Date.now(),
	ambientMs: number = POLL_INTERVAL_MS,
): number =>
	isHotSyncWindowActive(now)
		? Math.min(HOT_POLL_INTERVAL_MS, ambientMs)
		: ambientMs;

/**
 * Bounded concurrency for the per-poll fan-out across open accounts —
 * mirrors `SCHEDULER_ENQUEUE_CONCURRENCY` in
 * remit-imap-worker/src/scheduler/config.ts (never an unbounded
 * `Promise.all`, see doc/rules/coding-standards.md). A browser tab realistically
 * has a handful of accounts open at once, so this is a ceiling, not a tuned
 * throughput target.
 */
export const POLL_CONCURRENCY = 5;

/**
 * Module-level guard: which accounts have already had a background sync
 * fired in this browser tab's session. Survives layout re-mounts (route
 * changes) so re-mounting MailLayout does not spam SQS.
 */
const triggeredAccountIds = new Set<string>();

interface AccountLike {
	accountId: string;
	lastSyncAt?: number;
}

/**
 * Pure selector: given a list of accounts and the current time, return
 * the accountIds whose mailbox-list is stale and should be refreshed.
 * `null`/`undefined` `lastSyncAt` is treated as stale unconditionally.
 */
export const selectStaleAccountIds = (
	accounts: AccountLike[],
	now: number,
	thresholdMs: number = STALENESS_THRESHOLD_MS,
): string[] =>
	accounts
		.filter((account) => {
			const last = account.lastSyncAt;
			if (last === undefined || last === null) return true;
			return now - last > thresholdMs;
		})
		.map((account) => account.accountId);

/**
 * Pure predicate: has at least one full poll interval elapsed since the last
 * poll? Shared by the recurring timer and the visibility-regain catch-up
 * check so both use the exact same due-ness rule.
 */
export const hasPollIntervalElapsed = (
	now: number,
	lastPollAt: number,
	intervalMs: number = POLL_INTERVAL_MS,
): boolean => now - lastPollAt >= intervalMs;

/**
 * Pure selector: drop any accountId already mid-flight so a poll tick never
 * stacks a second request onto one still in progress.
 */
export const selectPollableAccountIds = (
	accountIds: string[],
	inFlight: ReadonlySet<string>,
): string[] => accountIds.filter((id) => !inFlight.has(id));

/**
 * Test-only helpers. Not exported from the public hook surface; consumers
 * should never reach into the module-level Set directly.
 */
export const __resetStaleAccountSyncGuard = (): void => {
	triggeredAccountIds.clear();
};
export const __peekStaleAccountSyncGuard = (): ReadonlySet<string> =>
	triggeredAccountIds;

/** Release the per-account guard and preserve confirmed authentication refusals. */
export const handleBackgroundSyncFailure = (
	accountId: string,
	error: unknown,
): void => {
	triggeredAccountIds.delete(accountId);
	if (isUnauthenticated(error)) {
		escalate(error);
		return;
	}
	console.warn("[remit] background mailbox sync failed", {
		accountId,
		error,
	});
};

/**
 * Trigger the same sync the pull-to-refresh path uses and invalidate the
 * mailbox-list query on success. `throwOnError: true` so a server failure
 * rejects instead of silently resolving with `{ error }` (the default),
 * which would let a 500 look like a successful sync and invalidate queries
 * anyway.
 */
const runBackgroundSync = async (
	accountId: string,
	queryClient: QueryClient,
): Promise<void> => {
	const runtime = getOfflineRuntime();
	if (runtime && !runtime.state.verified) return;
	const readStatus = async () =>
		(
			await syncOperationsGetSyncStatus({
				path: { accountId },
				throwOnError: true,
			})
		).data;
	const baseline = runtime ? await readStatus() : undefined;
	await syncOperationsTriggerSync({ path: { accountId }, throwOnError: true });
	if (runtime && baseline) {
		const outcome = await waitForSettled({
			accountId,
			readStatus,
			baselineLastSyncAt: baseline.lastSyncAt ?? 0,
			baselineInboxSyncedAt: inboxSyncedAt(baseline),
			deadline: Date.now() + REFRESH_TIMEOUT_MS,
		});
		if (outcome) {
			runtime.report(new Error(outcome.message));
			return;
		}
	}
	await queryClient.invalidateQueries({
		queryKey: mailboxOperationsListMailboxesQueryKey({ path: { accountId } }),
	});
};

/**
 * Auto-trigger a background mailbox-list sync for every stale account the
 * first time MailLayout mounts in a session, then keep it fresh with a
 * recurring online poll for as long as the mail app stays open (#1251) —
 * the client-side replacement for the server's removed "online" sync tier.
 * The poll runs on the ambient interval, or the hot one for the few minutes
 * after somebody presses refresh, and only while the tab is visible.
 * Fire-and-forget: does not block render, and silently logs failures (this
 * is a best-effort background refresh — the user-visible UI for triggering
 * is the "Refresh mailboxes" button in Settings).
 */
export const useStaleAccountSync = (
	accounts: RemitImapAccountResponse[],
): void => {
	const queryClient = useQueryClient();
	const { pushError } = useErrorBanners();
	// Hold the latest accounts in a ref so both effects can read them without
	// re-running on every render; they re-run only when the joined accountId
	// list actually changes (account added / removed).
	const accountsRef = useRef(accounts);
	accountsRef.current = accounts;
	const stableKey = accounts.map((a) => a.accountId).join(",");
	const onFailure = useCallback(
		(accountId: string, error: unknown) => {
			handleBackgroundSyncFailure(accountId, error);
			if (isUnauthenticated(error) || isAbortError(error)) return;
			const email = accountsRef.current.find(
				(account) => account.accountId === accountId,
			)?.email;
			pushError(
				buildMutationErrorBanner(
					email ? `Couldn't sync ${email}` : "Couldn't sync mail",
					"The background sync failed.",
					error,
				),
			);
		},
		[pushError],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stableKey is a serialized account list used to trigger re-sync on account changes; adding it would cause issues without also referencing accountsRef
	useEffect(() => {
		if (getOfflineRuntime() && !getOfflineRuntime()?.state.verified) return;
		const now = Date.now();
		const stale = selectStaleAccountIds(accountsRef.current, now);
		const fresh = stale.filter((id) => !triggeredAccountIds.has(id));
		if (fresh.length === 0) return;

		for (const accountId of fresh) triggeredAccountIds.add(accountId);
		void pMap(
			fresh,
			(accountId) =>
				runBackgroundSync(accountId, queryClient).catch((error: unknown) =>
					onFailure(accountId, error),
				),
			{ concurrency: POLL_CONCURRENCY },
		).then(() => getOfflineRuntime()?.refreshReading());
	}, [stableKey, queryClient, onFailure]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stableKey re-runs the poll loop when the account list changes; accountsRef supplies the live list each tick
	useEffect(() => {
		let lastPollAt = Date.now();
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const inFlight = new Set<string>();

		const poll = () => {
			if (
				!navigator.onLine ||
				(getOfflineRuntime() && !getOfflineRuntime()?.state.verified)
			)
				return;
			lastPollAt = Date.now();
			const ids = selectPollableAccountIds(
				accountsRef.current.map((a) => a.accountId),
				inFlight,
			);
			if (ids.length === 0) return;
			// Mark every selected id in flight before dispatch (not as pMap
			// starts each one) so a concurrency-queued id still counts as
			// "already polling" for the next tick's `selectPollableAccountIds`
			// check — no stacked requests even while waiting for a free slot.
			for (const accountId of ids) inFlight.add(accountId);
			void pMap(
				ids,
				(accountId) =>
					runBackgroundSync(accountId, queryClient)
						.catch((err: unknown) => {
							onFailure(accountId, err);
						})
						.finally(() => {
							inFlight.delete(accountId);
						}),
				{ concurrency: POLL_CONCURRENCY },
			).then(() => getOfflineRuntime()?.refreshReading());
		};

		const tick = () => {
			if (document.visibilityState === "visible") {
				poll();
				timeoutId = setTimeout(tick, currentPollIntervalMs());
				return;
			}
			// Hidden: don't reschedule. `handleVisibilityChange` resumes the loop
			// (with an immediate catch-up poll if one is due) once the tab is
			// visible again. A hot window running out while the tab is away costs
			// nothing — there is nobody watching a list to keep current.
		};

		// A tick that fired while the tab was hidden left no timer behind, so
		// coming back is the only thing that can re-arm the loop — it does so
		// unconditionally. Due-ness decides whether this tab polls *now*, never
		// whether a next tick exists: a tab that went to sleep on the hot cadence
		// and came back after the window lapsed is not due against a longer
		// ambient interval, and used to stop polling for good (#1031).
		const resumeVisible = () => {
			if (document.visibilityState !== "visible") return;
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			const now = Date.now();
			const intervalMs = currentPollIntervalMs(now);
			if (hasPollIntervalElapsed(now, lastPollAt, intervalMs)) {
				poll();
				timeoutId = setTimeout(tick, intervalMs);
				return;
			}
			timeoutId = setTimeout(tick, lastPollAt + intervalMs - now);
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState !== "visible") return;
			const runtime = getOfflineRuntime();
			if (runtime) {
				void runtime
					.verify()
					.then((verified) => {
						if (verified) resumeVisible();
					})
					.catch(runtime.report);
			} else resumeVisible();
		};

		// A press opens the hot window, but this loop may already be asleep on a
		// long ambient interval — reschedule onto the hot one rather than sit
		// out the rest of that wait. The press has just triggered its own sync,
		// so this only moves the *next* tick: never a poll on the press itself,
		// and never a tighter loop than the interval (POST /sync is deliberately
		// never coalesced, #37).
		const handleHotWindow = () => {
			if (document.visibilityState !== "visible") return;
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			lastPollAt = Date.now();
			timeoutId = setTimeout(tick, currentPollIntervalMs());
		};

		timeoutId = setTimeout(tick, currentPollIntervalMs());
		document.addEventListener("visibilitychange", handleVisibilityChange);
		const handleReconnect = () => {
			const runtime = getOfflineRuntime();
			if (runtime) {
				void runtime
					.verify()
					.then((verified) => {
						if (verified) {
							poll();
						}
					})
					.catch(runtime.report);
			} else poll();
		};
		const handleVerified = () => {
			poll();
		};
		window.addEventListener("online", handleReconnect);
		window.addEventListener("remit:session-verified", handleVerified);
		const unsubscribeHotWindow = subscribeHotSyncWindow(handleHotWindow);

		return () => {
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("online", handleReconnect);
			window.removeEventListener("remit:session-verified", handleVerified);
			unsubscribeHotWindow();
		};
	}, [stableKey, queryClient, onFailure]);
};
