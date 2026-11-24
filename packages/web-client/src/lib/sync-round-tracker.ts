import type { RemitImapAccountSyncStatusResponse } from "@remit/api-http-client/types.gen.ts";
import type { QueryClient } from "@tanstack/react-query";
import { isSyncingPhase } from "../hooks/useInitialSyncProgress";

type Outcome = "complete" | "error";

interface Press {
	requestedAt?: number;
	onInbox?: () => void;
	finish: (outcome?: Outcome) => void;
}

export const SYNC_ROUND_ERROR = "Sync failed for this account";

class SyncRoundTracker {
	private handledAt = new Map<string, number>();
	private presses = new Map<string, Set<Press>>();
	check?: () => void;

	noteRequested(accountId: string, requestedAt: number): void {
		const baseline = requestedAt - 1;
		if (baseline > (this.handledAt.get(accountId) ?? -Infinity)) {
			this.handledAt.set(accountId, baseline);
		}
		this.check?.();
	}

	beginPress(accountId: string, onInbox: () => void, signal: AbortSignal) {
		const presses = this.presses.get(accountId) ?? new Set<Press>();
		this.presses.set(accountId, presses);
		const abort = () => {
			press.finish();
			this.check?.();
		};
		let resolveOutcome: (result: Outcome | undefined) => void;
		const outcome = new Promise<Outcome | undefined>((resolve) => {
			resolveOutcome = resolve;
		});
		const press: Press = {
			onInbox,
			finish: (result) => {
				if (!presses.delete(press)) return;
				signal.removeEventListener("abort", abort);
				if (presses.size === 0) this.presses.delete(accountId);
				resolveOutcome(result);
			},
		};
		// Hold the reading until the POST ack can identify this press's round.
		presses.add(press);
		signal.addEventListener("abort", abort, { once: true });

		return {
			outcome,
			cancel: abort,
			accept: (requestedAt: number) => {
				press.requestedAt = requestedAt;
				this.noteRequested(accountId, requestedAt);
			},
		};
	}

	observe(
		accountId: string,
		status: RemitImapAccountSyncStatusResponse,
		onComplete: () => void,
		onFailure: () => void,
	): void {
		const { syncRequestedAt: stamp, syncPhase } = status;
		const presses = this.presses.get(accountId);
		if (presses && isSyncingPhase(syncPhase)) {
			const inboxAt = status.mailboxes?.find(
				(mailbox) => mailbox.fullPath?.toUpperCase() === "INBOX",
			)?.lastSyncedAt;
			for (const press of presses) {
				if (
					press.requestedAt !== undefined &&
					inboxAt !== undefined &&
					inboxAt >= press.requestedAt
				) {
					const onInbox = press.onInbox;
					press.onInbox = undefined;
					onInbox?.();
				}
			}
			return;
		}
		const handledAt = this.handledAt.get(accountId);
		if (
			handledAt === undefined ||
			stamp === undefined ||
			!(stamp > handledAt) ||
			(syncPhase !== "complete" && syncPhase !== "error")
		)
			return;

		let claimed = false;
		for (const press of presses ?? []) {
			if (press.requestedAt !== undefined && press.requestedAt <= stamp) {
				press.finish(syncPhase);
				claimed = true;
				break;
			}
		}
		if (
			!claimed &&
			presses &&
			[...presses].some((press) => press.requestedAt === undefined)
		)
			return;

		this.handledAt.set(accountId, stamp);
		if (syncPhase === "complete") onComplete();
		else if (!claimed) onFailure();
	}
}

const trackers = new WeakMap<QueryClient, SyncRoundTracker>();

export const syncRoundTracker = (client: QueryClient): SyncRoundTracker => {
	let tracker = trackers.get(client);
	if (!tracker) {
		tracker = new SyncRoundTracker();
		trackers.set(client, tracker);
	}
	return tracker;
};
