import {
	mailboxOperationsListMailboxesQueryKey,
	syncOperationsGetSyncStatusQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { syncOperationsTriggerSync } from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapAccountResponse,
	RemitImapAccountSyncStatusResponse,
} from "@remit/api-http-client/types.gen.ts";
import { useQueryClient } from "@tanstack/react-query";
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
 * Accounts already triggered by a background poll in this browser tab.
 * Survives layout remounts so the stale-on-mount pass doesn't enqueue
 * another round for them.
 */
const polledAccountIds = new Set<string>();

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
	polledAccountIds.clear();
};
export const __peekStaleAccountSyncGuard = (): ReadonlySet<string> =>
	polledAccountIds;

/** Release the per-account guard and preserve confirmed authentication refusals. */
export const handleBackgroundSyncFailure = (
	accountId: string,
	error: unknown,
): void => {
	polledAccountIds.delete(accountId);
	if (isUnauthenticated(error)) {
		escalate(error);
		return;
	}
	console.warn("[remit] background mailbox sync failed", {
		accountId,
		error,
	});
};

interface BackgroundRound {
	// Retain the first request so a later POST cannot hide a slow round.
	requestedAt: number;
	lastHandledAt?: number;
}

/**
 * Auto-trigger a background mailbox-list sync for every stale account the
 * first time MailLayout mounts in a session, then keep it fresh with a
 * recurring online poll for as long as the mail app stays open (#1251) —
 * the client-side replacement for the server's removed "online" sync tier.
 * The poll runs on the ambient interval, or the hot one for the few minutes
 * after somebody presses refresh, and only while the tab is visible.
 * The poll keeps at most one POST in flight per account.
 */
export const useStaleAccountSync = (accounts: RemitImapAccountResponse[]) => {
	const queryClient = useQueryClient();
	const { pushError } = useErrorBanners();
	// Hold the latest accounts in a ref so the polling effect can read them without
	// re-running on every render; it re-runs only when the joined accountId
	// list actually changes (account added / removed).
	const accountsRef = useRef(accounts);
	accountsRef.current = accounts;
	const rounds = useRef(new Map<string, BackgroundRound>());
	const stableKey = accounts.map((a) => a.accountId).join(",");
	const onFailure = useCallback(
		(accountId: string, error: unknown) => {
			if (isAbortError(error)) return;
			handleBackgroundSyncFailure(accountId, error);
			if (isUnauthenticated(error)) return;
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

	const onSyncStatus = useCallback(
		(accountId: string, status: RemitImapAccountSyncStatusResponse) => {
			const round = rounds.current.get(accountId);
			const { syncRequestedAt, syncPhase } = status;
			if (
				!round ||
				syncRequestedAt === undefined ||
				syncRequestedAt < round.requestedAt ||
				(round.lastHandledAt !== undefined &&
					syncRequestedAt <= round.lastHandledAt) ||
				(syncPhase !== "error" && syncPhase !== "complete")
			)
				return;

			round.lastHandledAt = syncRequestedAt;
			if (syncPhase === "error") {
				onFailure(accountId, new Error("Sync failed for this account"));
			} else {
				void getOfflineRuntime()?.refreshReading();
			}
		},
		[onFailure],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: stableKey re-runs the poll loop when the account list changes; accountsRef supplies the live list each tick
	useEffect(() => {
		let lastPollAt = Date.now();
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const inFlight = new Set<string>();
		const controller = new AbortController();
		const { signal } = controller;
		const runPoll = (accountIds: string[]) => {
			const runtime = getOfflineRuntime();
			if (
				signal.aborted ||
				!navigator.onLine ||
				(runtime && !runtime.state.verified)
			)
				return;
			lastPollAt = Date.now();
			const ids = selectPollableAccountIds(accountIds, inFlight);
			if (ids.length === 0) return;
			for (const accountId of ids) inFlight.add(accountId);
			void pMap(
				ids,
				async (accountId) => {
					if (signal.aborted) return;
					polledAccountIds.add(accountId);
					const result = await syncOperationsTriggerSync({
						path: { accountId },
						throwOnError: true,
						signal,
					})
						.finally(() => inFlight.delete(accountId))
						.catch((error: unknown) => {
							if (!signal.aborted) onFailure(accountId, error);
						});
					if (!result || signal.aborted) return;
					void queryClient.invalidateQueries({
						queryKey: mailboxOperationsListMailboxesQueryKey({
							path: { accountId },
						}),
					});
					if (!rounds.current.has(accountId)) {
						rounds.current.set(accountId, {
							requestedAt: result.data.requestedAt,
						});
					}
					// The shared query can receive the outcome before the POST returns.
					const status =
						queryClient.getQueryData<RemitImapAccountSyncStatusResponse>(
							syncOperationsGetSyncStatusQueryKey({ path: { accountId } }),
						);
					if (status) onSyncStatus(accountId, status);
				},
				{ concurrency: POLL_CONCURRENCY },
			);
		};

		runPoll(
			selectStaleAccountIds(accountsRef.current, lastPollAt).filter(
				(id) => !polledAccountIds.has(id),
			),
		);

		const poll = () => {
			runPoll(accountsRef.current.map((a) => a.accountId));
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
			if (signal.aborted || document.visibilityState !== "visible") return;
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
			controller.abort();
			if (timeoutId !== undefined) clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("online", handleReconnect);
			window.removeEventListener("remit:session-verified", handleVerified);
			unsubscribeHotWindow();
		};
	}, [stableKey, queryClient, onFailure, onSyncStatus]);

	return onSyncStatus;
};
