import { syncOperationsTriggerSync } from "@remit/api-http-client/sdk.gen.ts";
import type { RefreshControlState } from "@remit/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { escalate } from "../lib/escalate";
import { startHotSyncWindow } from "../lib/hot-sync-window";
import { useMailFreshness } from "../lib/mail-freshness";
import {
	SYNC_ROUND_ERROR,
	type SyncRoundTracker,
} from "../lib/sync-round-tracker";
import { useTelemetry } from "../lib/telemetry-context";

export type { RefreshControlState };

const messageFor = (error: unknown): string =>
	error instanceof Error && error.message
		? error.message
		: "Something went wrong";

interface AccountResult {
	accountId: string;
	enqueued: boolean;
	ok: boolean;
	message?: string;
}

const refreshOneAccount = async (
	beginPress: SyncRoundTracker["beginPress"],
	telemetry: { recordEvent: (name: string) => void },
	accountId: string,
	signal: AbortSignal,
	onInbox: () => void,
): Promise<AccountResult> => {
	if (signal.aborted) return { accountId, enqueued: false, ok: false };
	const press = beginPress(accountId, onInbox, signal);
	const triggered = await syncOperationsTriggerSync({
		path: { accountId },
		signal,
		throwOnError: true,
	})
		.then(({ data }) => ({ ok: true as const, requestedAt: data.requestedAt }))
		.catch((error: unknown) => ({ ok: false as const, error }));
	if (!triggered.ok) {
		press.cancel();
		if (!signal.aborted) escalate(triggered.error);
		return {
			accountId,
			enqueued: false,
			ok: false,
			message: messageFor(triggered.error),
		};
	}
	if (signal.aborted) return { accountId, enqueued: false, ok: false };
	telemetry.recordEvent("sync.triggered");
	press.accept(triggered.requestedAt);
	const outcome = await press.outcome;
	return {
		accountId,
		enqueued: true,
		ok: outcome === "complete",
		message: outcome === "error" ? SYNC_ROUND_ERROR : undefined,
	};
};

export interface UseRefreshControlOptions {
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
	const telemetry = useTelemetry();
	const { acknowledge, beginPress } = useMailFreshness();
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

		const showAccount = (): void => {
			if (!run.signal.aborted) optionsRef.current.onSettled?.();
		};

		void (async () => {
			const results = await Promise.all(
				ids.map((accountId) =>
					refreshOneAccount(
						beginPress,
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
			enqueued.forEach(showAccount);
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
	}, [acknowledge, beginPress, telemetry]);

	return { state, errorMessage, refresh };
};
