/**
 * A collection listing — `GET /threads?starred=true`, served by the
 * `byStarred` index, or `GET /threads?labelId=…`, one label's folder in every
 * account — as one hook, so a collection pane's list and its selection resolve
 * from the same query.
 *
 * The two are the same cache entry, not two requests: they share a query key,
 * so `threads` here is exactly the set of rows the list rendered. Resolving a
 * selection from any other listing reintroduces issue #70 — the INBOX-scoped
 * unified listing cannot see a starred thread filed elsewhere, so its row is
 * clickable but resolves to nothing and no reading pane opens.
 *
 * The filters travel as query parameters rather than as a pass over the pages
 * loaded so far. A starred collection is paged, so a category whose mail sits
 * below the newest page rendered an empty list however much of it the
 * collection held (#308); the server answers the predicate over the whole
 * collection instead, and a page comes back full of matches.
 *
 * Free text is one of those parameters, so a search is this same paginated
 * query rather than a second, single-page one beside it. The separate one had
 * no error state of its own — an expired session read as "nothing matched" —
 * no continuation, so "Load more" was a dead button under a query, and its own
 * loading state, so a cached listing flashed the empty state while it was in
 * flight.
 */
import { unifiedThreadOperationsListAllThreadsQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { unifiedThreadOperationsListAllThreads } from "@remit/api-http-client/sdk.gen.ts";
import type { RemitImapThreadMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ThreadCollection } from "../lib/collection-criteria";
import type { ThreadSearchTokenParams } from "../lib/thread-search-tokens";

/** The criteria a collection view narrows its listing by, all server-applied. */
export interface CollectionCriteria extends ThreadSearchTokenParams {
	/**
	 * Free text, matched against subject, From and the body preview over the
	 * whole collection.
	 */
	query?: string;
}

// The collection and `order` are the view itself, not a criterion, so they are
// set last: no chip can widen the listing past the collection or reorder it.
const collectionQuery = (
	collection: ThreadCollection,
	criteria: CollectionCriteria,
) => ({
	...criteria,
	...collection,
	order: "desc" as const,
});

export const collectionThreadsQueryKey = (
	collection: ThreadCollection,
	criteria: CollectionCriteria = {},
) =>
	unifiedThreadOperationsListAllThreadsQueryKey({
		query: collectionQuery(collection, criteria),
	});

interface CollectionThreads {
	/** Every matching thread across the pages loaded so far, newest first. */
	threads: RemitImapThreadMessageResponse[];
	isLoading: boolean;
	isError: boolean;
	error: unknown;
	refetch: () => void;
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
}

export function useCollectionThreads(
	collection: ThreadCollection,
	criteria: CollectionCriteria = {},
): CollectionThreads {
	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: collectionThreadsQueryKey(collection, criteria),
		queryFn: async ({ pageParam }) => {
			const { data: page } = await unifiedThreadOperationsListAllThreads({
				query: {
					...collectionQuery(collection, criteria),
					continuationToken: pageParam,
				},
				throwOnError: true,
			});
			return page;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.continuationToken,
		staleTime: 60_000,
	});

	const threads = useMemo(
		() => (data?.pages ?? []).flatMap((page) => page.items ?? []),
		[data],
	);

	return {
		threads,
		isLoading,
		isError,
		error,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	};
}

/**
 * How many of the collection's matching messages are unread, counted by the
 * server.
 *
 * Its own request, so no cursor enters the key and pressing "load more" cannot
 * move the number — the count is over the whole collection under the active
 * criteria, which is what the header claims it is. A page-length count grows
 * with every press and reads as a total, which is the defect this replaces
 * (#308). `results: false` reads the count alone: no rows are fetched or
 * enriched to answer it.
 *
 * Undefined until the server answers, and undefined when it cannot. The header
 * shows no number rather than a made-up one.
 */
export function useCollectionUnreadCount(
	collection: ThreadCollection,
	criteria: CollectionCriteria = {},
): number | undefined {
	const query = {
		...collectionQuery(collection, criteria),
		unread: true,
		count: true,
		results: false,
	};
	const { data } = useQuery({
		queryKey: unifiedThreadOperationsListAllThreadsQueryKey({ query }),
		queryFn: async () => {
			const { data: page } = await unifiedThreadOperationsListAllThreads({
				query,
				throwOnError: true,
			});
			return page;
		},
		staleTime: 60_000,
	});
	return data?.count;
}
