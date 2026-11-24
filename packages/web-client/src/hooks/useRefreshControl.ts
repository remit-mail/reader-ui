import {
	mailboxOperationsListMailboxesQueryKey,
	syncOperationsGetSyncStatusOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { syncOperationsTriggerSync } from "@remit/api-http-client/sdk.gen.ts";
import type { RemitImapSyncPhase } from "@remit/api-http-client/types.gen.ts";
import type { RefreshControlState } from "@remit/ui";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { escalate } from "../lib/escalate";
import { startHotSyncWindow } from "../lib/hot-sync-window";
import { useMailFreshness } from "../lib/mail-freshness";
import { useTelemetry } from "../lib/telemetry-context";
import { isSyncingPhase } from "./useInitialSyncProgress";

export type { RefreshControlState };

/** How often the wait reads status after the sync is enqueued. */
export const REFRESH_POLL_MS = 2000;

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

const messageFor = (error: unknown): string =>
	error instanceof Error && error.message
		? error.message
		: "Something went wrong";

// The user pulled to refresh and is watching the spinner: a 401 raises the
// signed-out notice rather than a spinner that stops for no stated reason.
const escalateIfFatal = (error: unknown): void => {
	escalate(error);
};

/**
 * `getSyncStatus` for one account, always as a real network read: `staleTime:
 * 0` means even a reading `MailFreshnessProvider` fetched a moment ago is
 * treated as stale. Sharing the query key means every fetch here also lands
 * in the same cache `MailFreshnessProvider` reads, so acknowledging a refresh
 * (see `useMailFreshness().acknowledge`) re-baselines from data this wait
 * itself just fetched — never a round-old cached reading.
 *
 * Routed through `queryClient.fetchQuery` rather than the raw SDK call, so a
 * failure here already reaches the global `QueryCache` error sink
 * (`main.tsx` wires `escalate`) on the same terms as every other
 * query — a manual `escalateIfFatal` on top would double-report the same
 * error. `syncOperationsTriggerSync` below is the one call in this file that
 * genuinely needs it: it's a raw SDK call outside React Query, so nothing
 * else escalates it.
 */
const fetchStatus = (queryClient: QueryClient, accountId: string) =>
	queryClient.fetchQuery({
		...syncOperationsGetSyncStatusOptions({ path: { accountId } }),
		staleTime: 0,
	});

/** The fields of `getSyncStatus` this wait reads, named so it can be driven
 * from a scripted sequence of readings. */
export interface SyncStatusReading {
	syncPhase?: RemitImapSyncPhase;
	lastSyncAt?: number;
	mailboxes?: readonly { fullPath?: string; lastSyncedAt?: number }[];
}

/**
 * The account's INBOX stamp, or 0 when the account has no INBOX or has never
 * synced one. `getSyncStatus` reports `lastSyncedAt` per mailbox, which is what
 * lets the wait answer "the inbox is current" ahead of "the round is done".
 */
export const inboxSyncedAt = (reading: SyncStatusReading): number =>
	reading.mailboxes?.find(
		(mailbox) => mailbox.fullPath?.toUpperCase() === "INBOX",
	)?.lastSyncedAt ?? 0;

export interface WaitForSettledOptions {
	readStatus: () => Promise<SyncStatusReading>;
	/** `lastSyncAt` as it read immediately before this refresh triggered. */
	baselineLastSyncAt: number;
	/** The INBOX `lastSyncedAt` from that same pre-trigger reading. */
	baselineInboxSyncedAt?: number;
	/** Called at most once, the moment INBOX's own stamp passes the baseline
	 * while the round is still running — never after the round has settled,
	 * which the caller already treats as the confirmed state. */
	onInboxSynced?: () => void;
	signal?: AbortSignal;
	pollMs?: number;
}

/**
 * Poll one account's sync status until a round that started at or after this
 * refresh triggered has settled, failed, or been cancelled.
 *
 * `account.lastSyncAt` is the worker's own once-per-round stamp, and it is the
 * only thing here that tells one round from another. A phase seen mid-flight
 * does not: the tab's background poll, another tab, and every `GET /config`
 * trigger rounds nobody clicked for, so a click landing while one of those is
 * in flight used to confirm on it — a checkmark and an invalidated list with
 * the clicked round still unrun, and the new mail it would have fetched unseen
 * until the next poll (#953). Requiring the stamp to pass the reading taken
 * before the trigger admits only a round that started after it.
 *
 * Discovery can fail before the worker advances the stamp. An error phase
 * ends the wait even when the stamp is unchanged.
 *
 * A round is the whole account — every folder, in queue order — but the mail
 * a person pressed refresh for is in their inbox. `onInboxSynced` fires the
 * moment that one mailbox's own stamp passes the baseline, so the list on
 * screen reloads then rather than after Junk and Trash have also gone by. The
 * round-level stamp still decides the button's confirmed state.
 *
 * Waiting reads only sync status.
 */
export const waitForSettled = async ({
	readStatus,
	baselineLastSyncAt,
	baselineInboxSyncedAt = 0,
	onInboxSynced,
	signal,
	pollMs = REFRESH_POLL_MS,
}: WaitForSettledOptions): Promise<boolean> => {
	const poll = async (): Promise<boolean> => {
		let inboxAnnounced = false;
		while (!signal?.aborted) {
			const reading = await readStatus();
			if (signal?.aborted) return false;
			const { syncPhase, lastSyncAt } = reading;
			if (syncPhase === "error")
				throw new Error("Sync failed for this account");
			if ((lastSyncAt ?? 0) > baselineLastSyncAt && !isSyncingPhase(syncPhase))
				return true;
			if (!inboxAnnounced && inboxSyncedAt(reading) > baselineInboxSyncedAt) {
				inboxAnnounced = true;
				onInboxSynced?.();
			}
			await sleep(pollMs);
		}
		return false;
	};
	if (!signal) return poll();
	if (signal.aborted) return false;
	let complete: (settled: boolean) => void;
	const cancelled = new Promise<boolean>((resolve) => {
		complete = resolve;
	});
	const cancel = () => complete(false);
	signal.addEventListener("abort", cancel, { once: true });
	try {
		return await Promise.race([poll(), cancelled]);
	} finally {
		signal.removeEventListener("abort", cancel);
	}
};

interface AccountResult {
	accountId: string;
	/** The trigger itself was accepted — the mailbox-list invalidation and
	 * `onSettled`/`acknowledge` calls run for every enqueued account,
	 * independent of whether its own round then succeeded. */
	enqueued: boolean;
	ok: boolean;
	message?: string;
}

const refreshOneAccount = async (
	queryClient: QueryClient,
	telemetry: { recordEvent: (name: string) => void },
	accountId: string,
	signal: AbortSignal,
	onInboxSynced: (accountId: string) => void,
): Promise<AccountResult> => {
	const baseline = await fetchStatus(queryClient, accountId)
		.then((data) => ({
			ok: true as const,
			lastSyncAt: data.lastSyncAt ?? 0,
			inboxSyncedAt: inboxSyncedAt(data),
		}))
		.catch((error: unknown) => ({ ok: false as const, error }));
	if (!baseline.ok) {
		return {
			accountId,
			enqueued: false,
			ok: false,
			message: messageFor(baseline.error),
		};
	}

	if (signal.aborted) return { accountId, enqueued: false, ok: false };
	const triggered = await syncOperationsTriggerSync({
		path: { accountId },
		signal,
		throwOnError: true,
	})
		.then(() => ({ ok: true as const }))
		.catch((error: unknown) => ({ ok: false as const, error }));
	if (!triggered.ok) {
		if (!signal.aborted) escalateIfFatal(triggered.error);
		return {
			accountId,
			enqueued: false,
			ok: false,
			message: messageFor(triggered.error),
		};
	}
	telemetry.recordEvent("sync.triggered");

	return waitForSettled({
		readStatus: () => fetchStatus(queryClient, accountId),
		baselineLastSyncAt: baseline.lastSyncAt,
		baselineInboxSyncedAt: baseline.inboxSyncedAt,
		onInboxSynced: () => onInboxSynced(accountId),
		signal,
	})
		.then((ok) => ({ accountId, enqueued: true, ok }))
		.catch((error: unknown) => ({
			accountId,
			enqueued: true,
			ok: false,
			message: messageFor(error),
		}));
};

export interface UseRefreshControlOptions {
	/** The caller's chance to invalidate whatever view-specific query (a
	 * mailbox's thread list, the brief's unified list) the sync may have
	 * changed, alongside the invalidation of the account's own mailbox-list
	 * query.
	 *
	 * Called more than once per press: once per account the moment its INBOX
	 * is current, and again once its whole round has settled. It must
	 * therefore be idempotent — an invalidation is. */
	onSettled?: () => void;
}

export interface UseRefreshControlResult {
	state: RefreshControlState;
	errorMessage?: string;
	refresh: () => void;
}

/**
 * Drives the shared `RefreshButton` for one or more accounts: triggers a sync
 * for each, waits for the server's own sync-status to settle — not just the
 * enqueue ack — then invalidates the queries the caller names.
 */
export const useRefreshControl = (
	accountIds: readonly string[],
	options: UseRefreshControlOptions = {},
): UseRefreshControlResult => {
	const queryClient = useQueryClient();
	const telemetry = useTelemetry();
	const { acknowledge } = useMailFreshness();
	const [state, setState] = useState<RefreshControlState>("idle");
	const [errorMessage, setErrorMessage] = useState<string>();
	const runRef = useRef<AbortController>(null);
	useEffect(() => () => runRef.current?.abort(), []);
	const accountIdsRef = useRef(accountIds);
	accountIdsRef.current = accountIds;
	const optionsRef = useRef(options);
	optionsRef.current = options;

	// A success confirmation is a beat, not a permanent state — it hands the
	// button back to idle on its own so a stale checkmark never lingers.
	useEffect(() => {
		if (state !== "success") return;
		const timer = setTimeout(() => setState("idle"), 2000);
		return () => clearTimeout(timer);
	}, [state]);

	const refresh = useCallback(() => {
		runRef.current?.abort();
		const ids = accountIdsRef.current;
		if (ids.length === 0) {
			// Reachable before the owning account resolves (a fresh mailbox
			// route) or when every account is muted (the brief) — a click here
			// must say why it did nothing, never sit as a dead button.
			setState("error");
			setErrorMessage("Nothing to refresh yet");
			return;
		}
		const run = new AbortController();
		runRef.current = run;
		setState("refreshing");
		setErrorMessage(undefined);

		startHotSyncWindow();

		// The account's own lists, reloaded. Called once as soon as that
		// account's INBOX is current and again when its round confirms: the
		// first is what puts the new mail on screen without waiting for Junk
		// and Trash, the second is the settled state.
		const showAccount = (accountId: string): void => {
			if (run.signal.aborted) return;
			queryClient.invalidateQueries({
				queryKey: mailboxOperationsListMailboxesQueryKey({
					path: { accountId },
				}),
			});
			optionsRef.current.onSettled?.();
		};

		void (async () => {
			const results = await Promise.all(
				ids.map((accountId) =>
					refreshOneAccount(
						queryClient,
						telemetry,
						accountId,
						run.signal,
						showAccount,
					),
				),
			);
			if (run.signal.aborted) return;

			const enqueued = results
				.filter((result) => result.enqueued)
				.map((result) => result.accountId);
			for (const accountId of enqueued) showAccount(accountId);
			if (enqueued.length > 0) {
				acknowledge(enqueued);
			}

			const failures = results.filter((result) => !result.ok);
			if (failures.length === 0) {
				setState("success");
			} else {
				setState("error");
				setErrorMessage(failures[0]?.message);
			}
		})();
	}, [acknowledge, queryClient, telemetry]);

	return { state, errorMessage, refresh };
};
