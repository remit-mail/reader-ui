import {
	configOperationsGetConfigQueryKey,
	mailboxOperationsListMailboxesQueryKey,
	threadDetailOperationsListThreadMessagesQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { messageBulkOperationsDeleteMessages } from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapConfigDescriptionResponse,
	RemitImapThreadMessageResponse,
} from "@remit/api-http-client/types.gen.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useRoleAppointmentPrompt } from "../components/mail/RoleAppointmentPromptProvider";
import { useErrorBanners } from "../components/ui/error-banner-context";
import { formatErrorDetail } from "../components/ui/error-banners";
import { isFolderRoleRefusal } from "../components/ui/folder-role-refusal";
import {
	isPlacementRefusal,
	placementRefusalBanner,
} from "../components/ui/placement-refusal";
import { runChunkedMutation } from "../lib/bulk-actions";
import {
	cancelThreadListQueries,
	invalidateThreadListQueries,
	patchThreadListQueries,
	restoreThreadListQueries,
	snapshotThreadListQueries,
	type ThreadMessagesData,
	type ThreadMutationContext,
	threadListCacheKeys,
} from "../lib/thread-list-cache";
import { useEscalatedActions } from "./useEscalatedActions";

export interface DeleteMessageTarget {
	id: string;
	mailboxId: string;
	accountId: string;
}

interface UseDeleteMessagesOptions {
	mailboxId: string;
	threadId?: string;
	/**
	 * Called once the optimistic removal has been applied. Use this to
	 * navigate away from a now-empty thread (e.g. clear `selectedMessageId`)
	 * before the server response arrives.
	 */
	onAfterOptimisticRemove?: (messageIds: string[]) => void;
}

/**
 * Pure helper: drop the messages in `messageIds` from a single page's items.
 *
 * Exported so the optimistic-removal math can be exercised without rendering
 * React. Other identity is preserved — only items whose `messageId` is in
 * the set are removed.
 */
export const removeMessagesFromItems = (
	items: RemitImapThreadMessageResponse[],
	messageIds: Set<string>,
): RemitImapThreadMessageResponse[] =>
	items.filter((item) => !messageIds.has(item.messageId));

export const useDeleteMessages = ({
	mailboxId,
	threadId,
	onAfterOptimisticRemove,
}: UseDeleteMessagesOptions) => {
	const queryClient = useQueryClient();
	const { pushError, dismissError } = useErrorBanners();
	const { runAction } = useEscalatedActions({
		mailboxId,
		enabled: false,
		predicateKey: "delete-undo",
		searchQuery: {},
	});
	const { requestAppointment } = useRoleAppointmentPrompt();

	// The refused chunk is not what the user asked for. The whole selection is
	// held here so the appointment's confirm replays all of it (#887).
	const selectionRef = useRef<DeleteMessageTarget[]>([]);
	const runRef = useRef<(targets: DeleteMessageTarget[]) => Promise<void>>(
		async () => {},
	);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (targets: DeleteMessageTarget[]) =>
			(
				await messageBulkOperationsDeleteMessages({
					body: { messageIds: targets.map((target) => target.id) },
					throwOnError: true,
				})
			).data,
		onMutate: async (variables): Promise<ThreadMutationContext> => {
			const messageIds = new Set(variables.map((target) => target.id));

			const threadMessagesPrefix = threadId
				? threadDetailOperationsListThreadMessagesQueryKey({
						path: { threadId },
					})
				: [];
			// Every mailbox the deleted messages live in, plus the unified
			// cross-account listing that backs the daily brief — deleting from the
			// brief has to remove the row there too, not only from the per-mailbox
			// lists (#140, part of #149).
			const listPrefixes = threadListCacheKeys(
				variables.map((target) => target.mailboxId),
			);

			await Promise.all([
				queryClient.cancelQueries({ queryKey: threadMessagesPrefix }),
				cancelThreadListQueries(queryClient, listPrefixes),
			]);

			const previousThreadMessages = threadId
				? queryClient
						.getQueriesData<ThreadMessagesData>({
							queryKey: threadMessagesPrefix,
						})
						.filter(
							(entry): entry is [readonly unknown[], ThreadMessagesData] =>
								entry[1] !== undefined,
						)
						.map(([queryKey, data]) => ({ queryKey, data }))
				: [];

			const previousThreadsList = snapshotThreadListQueries(
				queryClient,
				listPrefixes,
			);

			if (threadId) {
				queryClient.setQueriesData<ThreadMessagesData>(
					{ queryKey: threadMessagesPrefix },
					(old) => {
						if (!old) return old;
						return {
							...old,
							items: removeMessagesFromItems(old.items, messageIds),
						};
					},
				);
			}

			patchThreadListQueries(queryClient, listPrefixes, (items) =>
				removeMessagesFromItems(items, messageIds),
			);

			onAfterOptimisticRemove?.(Array.from(messageIds));

			return {
				threadMessagesPrefix,
				listPrefixes,
				previousThreadMessages,
				previousThreadsList,
			};
		},
		// A batch that partly applied answers 200 with a non-zero `failureCount`:
		// the rows whose placement changed under it were never claimed
		// (imap-mutations R3). `onSettled` invalidates, so those rows come back on
		// their own — this is what stops them coming back unexplained, which is
		// the dead-button failure wearing a different face (#1229).
		onSuccess: (data, vars) => {
			const refused = data?.failureCount ?? 0;
			if (refused === 0) return;
			const asked = vars.length;
			pushError({
				severity: "warning",
				title:
					refused > 1
						? `Couldn't delete ${refused} of ${asked} messages yet`
						: "Couldn't delete this message yet",
				detail:
					"Something else moved it while the delete was being prepared. It is back where it now sits — try again.",
			});
		},
		onError: (err, vars, context) => {
			if (context) {
				for (const entry of context.previousThreadMessages) {
					queryClient.setQueryData(entry.queryKey, entry.data);
				}
				restoreThreadListQueries(queryClient, context.previousThreadsList);
			}
			// A provenance refusal is answered by the prompt, not by a banner: the
			// generic banner is suppressed for this one error, and every other
			// failure keeps today's.
			const refusal = isFolderRoleRefusal(err);
			if (refusal) {
				const replay = selectionRef.current;
				requestAppointment({
					accountId: refusal.accountId,
					role: refusal.role,
					reason: refusal.reason,
					action: { kind: "delete", count: replay.length },
					onAppointed: () => runRef.current(replay),
				});
				return;
			}
			const count = vars.length;
			const placement = isPlacementRefusal(err);
			if (placement) {
				pushError(placementRefusalBanner(placement, count, "delete"));
				return;
			}
			pushError({
				title:
					count > 1
						? `Couldn't delete ${count} messages`
						: "Couldn't delete this message",
				detail: formatErrorDetail(err),
				error: err,
			});
		},
		onSettled: (_data, _err, vars, context) => {
			if (!context) return;
			if (threadId) {
				queryClient.invalidateQueries({
					queryKey: context.threadMessagesPrefix,
				});
			}
			invalidateThreadListQueries(queryClient, context.listPrefixes);
			for (const accountId of new Set(vars.map((target) => target.accountId))) {
				queryClient.invalidateQueries({
					queryKey: mailboxOperationsListMailboxesQueryKey({
						path: { accountId },
					}),
				});
			}
		},
	});

	const runSelection = useCallback(
		async (targets: DeleteMessageTarget[]): Promise<void> => {
			const config =
				queryClient.getQueryData<RemitImapConfigDescriptionResponse>(
					configOperationsGetConfigQueryKey(),
				);
			const byId = new Map(targets.map((target) => [target.id, target]));
			const groups = new Map<string, DeleteMessageTarget[]>();
			await runChunkedMutation(targets, async (ids) => {
				const chunk = ids.map((id) => {
					const target = byId.get(id);
					if (!target) throw new Error("Missing original delete target");
					return target;
				});
				const data = await mutateAsync(chunk);
				if (data.failureCount > 0) return;
				for (const target of chunk) {
					const trash = config?.accounts
						.find((account) => account.accountId === target.accountId)
						?.folderAppointments.find(
							(appointment) => appointment.role === "Trash",
						)?.mailboxId;
					if (target.mailboxId === trash) continue;
					groups.set(target.mailboxId, [
						...(groups.get(target.mailboxId) ?? []),
						{ ...target, mailboxId: trash ?? target.mailboxId },
					]);
				}
			});
			if (groups.size === 0) return;
			const id = pushError({
				severity: "info",
				title: "Moved to Trash",
				action: {
					label: "Undo",
					onClick: async () => {
						for (const [destinationMailboxId, targets] of groups) {
							const result = await runAction(
								{ kind: "move", destinationMailboxId },
								targets,
							);
							if (result.kind === "refused") {
								pushError({
									title: "Couldn't undo delete",
									detail: result.reason,
								});
								return;
							}
							dismissError(id);
							if (
								result.outcome.cancelled ||
								result.outcome.failedIds.length ||
								result.outcome.refused
							)
								return;
						}
					},
				},
			});
		},
		[mutateAsync, queryClient, pushError, dismissError, runAction],
	);

	useEffect(() => {
		runRef.current = runSelection;
	}, [runSelection]);

	const deleteMessages = useCallback(
		(targets: DeleteMessageTarget[]) => {
			if (targets.length === 0) return;
			selectionRef.current = targets;
			void runSelection(targets);
		},
		[runSelection],
	);

	return { deleteMessages, isPending };
};
