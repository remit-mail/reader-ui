import {
	threadOperationsListThreadsQueryKey,
	threadOperationsSearchThreadsQueryKey,
	unifiedThreadOperationsListAllThreadsQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { isInfiniteThreadData, isThreadItemsPage } from "../lib/thread-cache";

/**
 * Subjects of the selected messages, read off the thread rows already in the
 * query cache — the rows the list rendered to let the user select them in the
 * first place. No round-trip, and nothing to plumb through every surface that
 * opens Organize.
 *
 * A message whose row is not cached contributes nothing; the prefill that
 * consumes this treats missing subjects as an absence of evidence, not as an
 * empty subject.
 */

/** Match every cached thread listing by operation, whatever mailbox, page, or
 *  sort options it was fetched with — React Query matches keys partially. */
const listingPrefixes = (): ReadonlyArray<readonly unknown[]> =>
	[
		threadOperationsListThreadsQueryKey({ path: { mailboxId: "" } }),
		threadOperationsSearchThreadsQueryKey({ path: { mailboxId: "" } }),
		unifiedThreadOperationsListAllThreadsQueryKey(),
	].map((key) => [{ _id: key[0]._id }]);

const pagesOf = (data: unknown): { items: unknown[] }[] => {
	if (isInfiniteThreadData(data)) return data.pages;
	if (isThreadItemsPage(data)) return [data];
	return [];
};

const isSubjectRow = (
	row: unknown,
): row is { messageId: string; subject?: string } =>
	typeof row === "object" &&
	row !== null &&
	typeof (row as { messageId?: unknown }).messageId === "string";

/**
 * Subjects for `messageIds`, in the order the ids were given, skipping ids with
 * no cached row and rows with no subject.
 */
export const collectSubjects = (
	caches: readonly unknown[],
	messageIds: readonly string[],
): string[] => {
	const wanted = new Set(messageIds);
	const bySubject = new Map<string, string>();
	for (const cache of caches) {
		for (const page of pagesOf(cache)) {
			for (const row of page.items) {
				if (!isSubjectRow(row) || !wanted.has(row.messageId)) continue;
				const subject = row.subject?.trim();
				if (subject) bySubject.set(row.messageId, subject);
			}
		}
	}
	return messageIds
		.map((messageId) => bySubject.get(messageId))
		.filter((subject): subject is string => subject !== undefined);
};

export const useSelectedSubjects = (
	messageIds: readonly string[],
): string[] => {
	const queryClient = useQueryClient();
	const key = messageIds.join("\u0000");
	// biome-ignore lint/correctness/useExhaustiveDependencies: the id list is compared by value through `key`; the cache is read once per selection, not subscribed to
	return useMemo(() => {
		const caches = listingPrefixes().flatMap((queryKey) =>
			queryClient.getQueriesData({ queryKey }).map(([, data]) => data),
		);
		return collectSubjects(caches, messageIds);
	}, [queryClient, key]);
};
