import {
	configOperationsGetConfigOptions,
	mailboxOperationsListMailboxesOptions,
	threadDetailOperationsListThreadMessagesQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { accountMessageOperationsRescanMessages } from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapRescanFailureCode,
	RemitImapRescanResult,
	RemitImapThreadMessageResponse,
} from "@remit/api-http-client/types.gen.ts";
import {
	CHECK_AGAIN_FAILURE_SENTENCES,
	type CheckAgainFailure,
	CheckAgainPanel,
	type CheckAgainPanelProps,
	type CheckAgainSummary,
	type ThreadRowData,
} from "@remit/ui";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { ApiError } from "../../lib/api";
import {
	applyRescanResult,
	type BatchOutcome,
	type CheckAgainTarget,
	EMPTY_SUMMARY,
	type RescanBatch,
	refusedBatch,
	rescanBatches,
} from "../../lib/check-again";
import { escalate } from "../../lib/escalate";
import { reportSignedOut } from "../../lib/signed-out";
import { spamReportHref, spamRowMark } from "../../lib/spam";
import {
	invalidateThreadListQueries,
	threadListCacheKeys,
} from "../../lib/thread-list-cache";
import { useErrorBanners } from "../ui/error-banner-context";

export type CheckAgainRequest = Omit<CheckAgainTarget, "accountId"> & {
	accountId: string | undefined;
};

export interface CheckAgainContextValue {
	/**
	 * Checks the messages again. A list shows the progress panel; a single
	 * message shows its new verdict in its own banner instead.
	 */
	checkAgain: (
		requests: readonly CheckAgainRequest[],
		options: { panel: boolean },
	) => void;
	/** Ids in the batch in flight. */
	pendingIds: ReadonlySet<string>;
	/** Why the last run left a message unchecked. */
	failures: ReadonlyMap<string, RemitImapRescanFailureCode>;
}

const CheckAgainContext = createContext<CheckAgainContextValue | undefined>(
	undefined,
);

/** Absent outside the app shell, where nothing can run a check. */
export const useCheckAgain = (): CheckAgainContextValue | undefined =>
	useContext(CheckAgainContext);

type PanelRun =
	| { state: "Running"; checked: number; total: number }
	| { state: "Done"; total: number; summary: CheckAgainSummary }
	| {
			state: "PartialFailure";
			checked: number;
			total: number;
			failures: CheckAgainFailure[];
			retry: CheckAgainTarget[];
	  };

const accountsByMailbox = async (
	queryClient: QueryClient,
): Promise<Map<string, string>> => {
	const config = await queryClient.ensureQueryData(
		configOperationsGetConfigOptions(),
	);
	const lists = await Promise.all(
		config.accounts.map(async (account) => {
			const mailboxes = await queryClient.ensureQueryData(
				mailboxOperationsListMailboxesOptions({
					path: { accountId: account.accountId },
				}),
			);
			return mailboxes.items.map(
				(mailbox) => [mailbox.mailboxId, account.accountId] as const,
			);
		}),
	);
	return new Map(lists.flat());
};

const resolveTargets = async (
	queryClient: QueryClient,
	requests: readonly CheckAgainRequest[],
): Promise<CheckAgainTarget[]> => {
	const unresolved = requests.some((request) => !request.accountId);
	const index = unresolved
		? await accountsByMailbox(queryClient)
		: new Map<string, string>();
	return requests.flatMap((request) => {
		const accountId = request.accountId ?? index.get(request.mailboxId);
		return accountId ? [{ ...request, accountId }] : [];
	});
};

const sendBatch = async (
	batch: RescanBatch,
): Promise<RemitImapRescanResult | "SignedOut"> => {
	const response = await accountMessageOperationsRescanMessages({
		path: { accountId: batch.accountId },
		body: { messageIds: batch.targets.map((target) => target.messageId) },
	});
	if (response.data) return response.data;
	if (!response.response) throw response.error;
	const status = response.response.status;
	if (status === 401) return "SignedOut";
	if (status === 403) return refusedBatch(batch, "NotPermitted");
	if (status === 404) return refusedBatch(batch, "NotFound");
	throw new ApiError(
		`Check again failed with ${status}`,
		status,
		response.error,
	);
};

/**
 * Owns every Check again run: it sends ten ids per call, one call at a time,
 * so the panel can count each batch as it lands and Stop can end the run after
 * the batch in flight. The run lives in memory and ends with the page.
 */
export function CheckAgainProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const { pushError } = useErrorBanners();
	const [panel, setPanel] = useState<PanelRun | undefined>(undefined);
	const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
	const [failures, setFailures] = useState<
		ReadonlyMap<string, RemitImapRescanFailureCode>
	>(new Map());
	const runningRef = useRef(false);
	const stopRef = useRef(false);

	const settle = useCallback(
		(targets: readonly CheckAgainTarget[]) => {
			invalidateThreadListQueries(
				queryClient,
				threadListCacheKeys(targets.map((target) => target.mailboxId)),
			);
			for (const threadId of new Set(targets.map((t) => t.threadId))) {
				if (!threadId) continue;
				queryClient.invalidateQueries({
					queryKey: threadDetailOperationsListThreadMessagesQueryKey({
						path: { threadId },
					}),
				});
			}
		},
		[queryClient],
	);

	const run = useCallback(
		async (targets: CheckAgainTarget[], showPanel: boolean) => {
			const total = targets.length;
			let outcome: BatchOutcome = {
				summary: EMPTY_SUMMARY,
				failures: [],
			};
			let checked = 0;
			if (showPanel) setPanel({ state: "Running", checked, total });
			for (const batch of rescanBatches(targets)) {
				if (stopRef.current) break;
				setPendingIds(new Set(batch.targets.map((t) => t.messageId)));
				const result = await sendBatch(batch);
				if (result === "SignedOut") {
					reportSignedOut();
					setPendingIds(new Set());
					return;
				}
				outcome = applyRescanResult(outcome, batch, result);
				checked += batch.targets.length;
				setFailures((current) => {
					const next = new Map(current);
					for (const success of result.successful) {
						next.delete(success.messageId);
					}
					for (const failure of result.failed) {
						next.set(failure.messageId, failure.code);
					}
					return next;
				});
				if (showPanel) setPanel({ state: "Running", checked, total });
			}
			setPendingIds(new Set());
			settle(targets);
			if (stopRef.current) {
				setPanel(undefined);
				return;
			}
			if (!showPanel) {
				for (const failure of outcome.failures) {
					pushError({
						title: "Couldn't check this message again",
						detail: `${failure.subject}: ${CHECK_AGAIN_FAILURE_SENTENCES[failure.code]}`,
					});
				}
				return;
			}
			if (outcome.failures.length === 0) {
				setPanel({ state: "Done", total, summary: outcome.summary });
				return;
			}
			const retryIds = new Set(
				outcome.failures.filter((f) => f.retryable).map((f) => f.messageId),
			);
			setPanel({
				state: "PartialFailure",
				checked,
				total,
				failures: outcome.failures,
				retry: targets.filter((target) => retryIds.has(target.messageId)),
			});
		},
		[pushError, settle],
	);

	const start = useCallback(
		(targets: CheckAgainTarget[], showPanel: boolean) => {
			if (targets.length === 0) return;
			if (runningRef.current) {
				pushError({
					severity: "info",
					title: "Check again is already running",
					detail: "Wait for the run in progress to finish, or stop it.",
				});
				return;
			}
			runningRef.current = true;
			stopRef.current = false;
			void run(targets, showPanel)
				.catch((error: unknown) => {
					setPendingIds(new Set());
					setPanel(undefined);
					escalate(error);
				})
				.finally(() => {
					runningRef.current = false;
				});
		},
		[run, pushError],
	);

	const checkAgain = useCallback<CheckAgainContextValue["checkAgain"]>(
		(requests, options) => {
			void resolveTargets(queryClient, requests).then((targets) =>
				start(targets, options.panel),
			);
		},
		[queryClient, start],
	);

	const value = useMemo<CheckAgainContextValue>(
		() => ({ checkAgain, pendingIds, failures }),
		[checkAgain, pendingIds, failures],
	);

	const panelProps = ((): CheckAgainPanelProps | undefined => {
		if (!panel) return undefined;
		if (panel.state === "Running") {
			return {
				...panel,
				onStop: () => {
					stopRef.current = true;
				},
			};
		}
		if (panel.state === "Done") {
			return { ...panel, onDone: () => setPanel(undefined) };
		}
		return {
			state: "PartialFailure",
			checked: panel.checked,
			total: panel.total,
			failures: panel.failures,
			reportIssueHref: spamReportHref(
				"Check again left messages unchecked",
				panel.failures
					.map((failure) => `${failure.messageId}: ${failure.code}`)
					.join(", "),
			),
			onRetry: () => start(panel.retry, true),
			onClose: () => setPanel(undefined),
		};
	})();

	return (
		<CheckAgainContext.Provider value={value}>
			{children}
			{panelProps && (
				<div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 flex justify-center">
					<div className="pointer-events-auto w-full max-w-md">
						<CheckAgainPanel {...panelProps} />
					</div>
				</div>
			)}
		</CheckAgainContext.Provider>
	);
}

export const checkAgainRequestOfThread = (
	thread: RemitImapThreadMessageResponse,
	junkMailboxIds: ReadonlySet<string>,
): CheckAgainRequest => ({
	messageId: thread.messageId,
	accountId: thread.accountId,
	mailboxId: thread.mailboxId,
	threadId: thread.threadId,
	subject: thread.subject ?? "(No subject)",
	before: spamRowMark(thread, junkMailboxIds),
});

export const checkAgainRequestOfRow = (
	row: ThreadRowData,
): CheckAgainRequest | undefined =>
	row.mailboxId
		? {
				messageId: row.id,
				accountId: row.accountId,
				mailboxId: row.mailboxId,
				threadId: row.threadId,
				subject: row.subject,
				before: row.spam,
			}
		: undefined;
