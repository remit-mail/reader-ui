import {
	mailboxOperationsListMailboxesQueryKey,
	threadDetailOperationsListThreadMessagesQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	messageBulkOperationsNotSpam,
	messageBulkOperationsReportSpam,
} from "@remit/api-http-client/sdk.gen.ts";
import type { RemitImapSpamReportBulkResult } from "@remit/api-http-client/types.gen.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useErrorBanners } from "../components/ui/error-banner-context";
import { formatErrorDetail } from "../components/ui/error-banners";
import { ApiError } from "../lib/api";
import { runChunkedMutation } from "../lib/bulk-actions";
import {
	invalidateThreadListQueries,
	threadListCacheKeys,
} from "../lib/thread-list-cache";

interface UseReportSpamOptions {
	/** The mailbox the message currently sits in — scopes which list caches settle-time invalidation reaches. */
	mailboxId: string;
	threadId?: string;
	accountId?: string;
	/**
	 * Called once a report or undo succeeds, with the message ids it acted on
	 * — the same shape as `useMoveMessages`/`useDeleteMessages`'s option of the
	 * same name, so a host wires the identical `handleDeselectIfRemoved` it
	 * already has. Fires on SUCCESS here, not optimistically like those two:
	 * neither endpoint tells the client whether the message actually left
	 * `mailboxId` (reporting or undoing a message already in Junk is a real
	 * no-op-move, and the client has no way to predict it — see
	 * `throwOnBulkFailure`'s neighbour below), so this fires for every success,
	 * no-op included — a no-op report/undo still deselects even though the row
	 * never actually left the list the host is watching. That trades an
	 * occasional unnecessary pane-close for never leaving a reported message
	 * rendering a pre-report snapshot forever, which is the bug this exists to
	 * fix (issue #648 review).
	 */
	onAfterOptimisticRemove?: (messageIds: string[]) => void;
}

/**
 * The one designed, allowlisted reason returned by the server as-is (e.g.
 * `notSpam`'s move-not-settled-yet message) is safe to show verbatim; an
 * unexpected failure is already flattened server-side to this same generic
 * text (`GENERIC_FAILURE_REASON` in `packages/backend/src/handlers/message.ts`)
 * before it reaches the client. Used only as a fallback for the case neither
 * hits: a `failures` entry missing its `reason`, or no `failures` array at all
 * despite a non-zero `failureCount`.
 */
export const GENERIC_SPAM_ACTION_FAILURE =
	"This message could not be processed. Please try again. If it keeps failing, report it.";

/**
 * The server's designed failure text names the message by putting its raw
 * id as a possessive subject — e.g. "Message 4kv0xxyfhg4dhzqvxd105v840's move
 * to Junk has not settled yet; try again in a moment." (message ids here are
 * 25-char base36, `translator.generate()` in `packages/data-ports/src/id.ts`
 * — not a dashed UUID). Accurate, but not something to put in front of a
 * person. `messageId` is the exact id the failure names — `SpamReportFailure`
 * pairs it with `reason` for precisely this — so this strips that literal
 * substring rather than pattern-matching an id shape that could change under
 * it. Not a parse of the reason's meaning (the field is documented "not
 * intended to be parsed programmatically"): removing a known, opaque
 * identifier from where it renders reads nothing into what the sentence says.
 */
export const humanizeSpamFailureReason = (
	reason: string,
	messageId: string,
): string => reason.replace(`Message ${messageId}'s`, "This message's");

/**
 * `settleSpamReportBulk` (backend) runs the batch with `Promise.allSettled`
 * and always answers 200, folding per-message outcomes into
 * `successCount`/`failureCount`/`failures` rather than rejecting the HTTP
 * call — a partial (or total) failure is not a thrown error on the wire. The
 * generated mutation helpers only ever reject on a non-2xx response, so
 * without this the hook would report success for a message whose report or
 * undo never actually happened. The thrown error carries the batch's
 * `failureCount` for the banner title and the first failure's reason as its
 * message.
 *
 * Throws `ApiError` — not a bare `Error` — carrying a 4xx status. The
 * client's fail-fast contract (`lib/error-classifier.ts`'s `shouldEscalate`,
 * wired globally on the `MutationCache` in `lib/query-error-handler.ts`)
 * escalates anything that isn't a 5xx by default UNLESS the call site opts
 * out via `meta.softError` — a statusless `Error` escalates too, as a client
 * bug. Either way, without both the status AND `meta.softError` (set on the
 * `useMutation` calls below) this would crash to the full-screen fatal
 * overlay for a designed, expected, retryable outcome the backend wrote
 * user-facing copy for. Every other call site in this app forwards a
 * status-carrying error the generated client already threw and never needs
 * the opt-out because none of them are a routine, expected-failure signal
 * like this one; this is the one place synthesizing a failure from a 200
 * body, so it has to synthesize both.
 */
export class SpamBulkFailureError extends ApiError {
	constructor(
		message: string,
		readonly failureCount: number,
	) {
		super(message, 422);
	}
}

export const throwOnBulkFailure = (
	data: RemitImapSpamReportBulkResult,
): void => {
	if (data.failureCount === 0) return;
	const failure = data.failures?.[0];
	const reason = failure?.reason ?? GENERIC_SPAM_ACTION_FAILURE;
	const message = failure
		? humanizeSpamFailureReason(reason, failure.messageId)
		: reason;
	throw new SpamBulkFailureError(message, data.failureCount);
};

/**
 * Composes `POST /messages/report-spam` and `POST /messages/not-spam`. Both
 * fold the sender-flag write, the mailbox move and the `$Junk` keyword marker
 * into one server-side operation (`SpamReportService`); the client only sends
 * `messageIds` and reflects the result. `notSpam` undoes a spam report;
 * `moveOutOfSpam` sends the same request for unreported Junk messages and
 * differs only in its failure copy.
 *
 * No optimistic cache patch, unlike `useMoveMessages`/`useDeleteMessages`:
 * neither endpoint's response says whether the message actually changed
 * mailboxes (a report or undo against a message already in Junk is a real,
 * silent no-op), so predicting the row should vanish would flicker it back
 * on invalidation for a no-op — worst on `notSpam`, whose R2 wait can run
 * several seconds before the row "pops back". The list settles from
 * `onSettled`'s invalidation instead, which also runs on a partial failure so
 * the messages that did move leave the list. `isReporting`/
 * `isRestoring` below exist to pay for the UX this trades away: without them
 * a press produces no visible change at all until the request lands — the
 * caller wires them into the quick action's pending state.
 */
export function useReportSpam({
	mailboxId,
	threadId,
	accountId,
	onAfterOptimisticRemove,
}: UseReportSpamOptions) {
	const queryClient = useQueryClient();
	const { pushError } = useErrorBanners();

	const listPrefixes = threadListCacheKeys([mailboxId]);
	const threadMessagesPrefix = threadId
		? threadDetailOperationsListThreadMessagesQueryKey({ path: { threadId } })
		: [];

	const invalidateAffectedQueries = () => {
		if (threadId) {
			queryClient.invalidateQueries({ queryKey: threadMessagesPrefix });
		}
		invalidateThreadListQueries(queryClient, listPrefixes);
		if (accountId) {
			queryClient.invalidateQueries({
				queryKey: mailboxOperationsListMailboxesQueryKey({
					path: { accountId },
				}),
			});
		}
	};

	const onSuccess = (
		_data: unknown,
		variables: { body: { messageIds: string[] } },
	) => {
		onAfterOptimisticRemove?.(variables.body.messageIds);
	};

	const buildOnError =
		(failureTitle: (count: number) => string) =>
		(err: unknown, vars: { body: { messageIds: string[] } }) => {
			const count =
				err instanceof SpamBulkFailureError
					? err.failureCount
					: vars.body.messageIds.length;
			pushError({
				title: failureTitle(count),
				detail: formatErrorDetail(err),
				error: err,
			});
		};

	const sendNotSpam = async (variables: { body: { messageIds: string[] } }) => {
		const { data } = await messageBulkOperationsNotSpam({
			...variables,
			throwOnError: true,
		});
		throwOnBulkFailure(data);
		return data;
	};

	const report = useMutation({
		mutationFn: async (variables: { body: { messageIds: string[] } }) => {
			const { data } = await messageBulkOperationsReportSpam({
				...variables,
				throwOnError: true,
			});
			throwOnBulkFailure(data);
			return data;
		},
		// A per-message report failure is a routine, expected, retryable outcome
		// with backend-written user-facing copy — never the fatal overlay. See
		// `throwOnBulkFailure`'s doc for why the thrown ApiError's status alone
		// isn't enough: `shouldEscalate` defaults to escalate for a non-5xx that
		// doesn't opt out here.
		meta: { softError: true },
		onSuccess,
		onSettled: invalidateAffectedQueries,
		onError: buildOnError((count) =>
			count > 1
				? `Couldn't report ${count} messages as spam`
				: "Couldn't report this message as spam",
		),
	});

	const restore = useMutation({
		mutationFn: sendNotSpam,
		meta: { softError: true },
		onSuccess,
		onSettled: invalidateAffectedQueries,
		onError: buildOnError((count) =>
			count > 1
				? `Couldn't undo the spam report for ${count} messages`
				: "Couldn't undo the spam report",
		),
	});

	const moveOut = useMutation({
		mutationFn: sendNotSpam,
		meta: { softError: true },
		onSuccess,
		onSettled: invalidateAffectedQueries,
		onError: buildOnError((count) =>
			count > 1
				? `Couldn't move ${count} messages out of Spam`
				: "Couldn't move this message out of Spam",
		),
	});

	const reportSpam = useCallback(
		(messageIds: string[]) => {
			if (messageIds.length === 0) return;
			void runChunkedMutation(messageIds, (chunk) =>
				report.mutateAsync({ body: { messageIds: chunk } }),
			);
		},
		[report.mutateAsync],
	);

	const notSpam = useCallback(
		(messageIds: string[]) => {
			if (messageIds.length === 0) return;
			void runChunkedMutation(messageIds, (chunk) =>
				restore.mutateAsync({ body: { messageIds: chunk } }),
			);
		},
		[restore.mutateAsync],
	);

	const moveOutOfSpam = useCallback(
		(messageIds: string[]) => {
			if (messageIds.length === 0) return;
			void runChunkedMutation(messageIds, (chunk) =>
				moveOut.mutateAsync({ body: { messageIds: chunk } }),
			);
		},
		[moveOut.mutateAsync],
	);

	return {
		reportSpam,
		notSpam,
		moveOutOfSpam,
		/** True while a report is in flight — wire into the "Report spam" quick action's pending state; a press with no visible response is the dead-button failure mode. */
		isReporting: report.isPending,
		/** True while an undo is in flight — wire into the "Not spam" quick action's pending state. */
		isRestoring: restore.isPending || moveOut.isPending,
	};
}
