import type { RemitImapThreadSearchResponse } from "@remit/api-http-client/types.gen.ts";
import { hashKey } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { mergePersistedQueries } from "./offline-queries";
import {
	offlineRecord,
	type Partition,
	samePartition,
	writeOfflineRecord,
} from "./offline-store";

export interface PeriodicBatch {
	partition: Partition;
	client: PersistedClient;
}
export const stagingKey = (partition: Partition): string =>
	`periodic:batch:${partition.generation}`;
/** Caller holds the partition lock. Save before deleting so interrupted hydration is safe. */
export async function mergePeriodicBatch(
	partition: Partition,
): Promise<PersistedClient | undefined> {
	const key = `queries:${partition.generation}`;
	const previous = await offlineRecord<PersistedClient>(key);
	const batch = await offlineRecord<PeriodicBatch>(stagingKey(partition));
	if (!batch) return previous;
	const merged = samePartition(batch.partition, partition)
		? reconcilePeriodicBatch(previous, batch.client)
		: previous;
	if (merged) await writeOfflineRecord(key, merged);
	await writeOfflineRecord(stagingKey(partition), undefined);
	return merged;
}

/** A background head extends retained pages without replacing their cursors. */
export function reconcilePeriodicBatch(
	previous: PersistedClient | undefined,
	batch: PersistedClient,
): PersistedClient {
	const queries = batch.clientState.queries.map((query) => {
		const first = query.queryKey[0] as { _periodicHead?: boolean };
		if (!first._periodicHead) return query;
		const { _periodicHead, ...params } = first;
		const queryKey = [params];
		const queryHash = hashKey(queryKey);
		const saved = previous?.clientState.queries.find(
			(q) => q.queryHash === queryHash,
		);
		const head = query.state.data as {
			pages: RemitImapThreadSearchResponse[];
			pageParams: unknown[];
		};
		const old = saved?.state.data as typeof head | undefined;
		if (saved && saved.state.dataUpdatedAt > query.state.dataUpdatedAt)
			return saved;
		const seen = new Set<string>();
		const rows = (items: NonNullable<RemitImapThreadSearchResponse["items"]>) =>
			items.filter((row) => {
				if (seen.has(row.messageId)) return false;
				seen.add(row.messageId);
				return true;
			});
		const newest = rows(head.pages[0].items ?? []);
		const pages = old?.pages.map((page, index) => ({
			...page,
			items: [...(index === 0 ? newest : []), ...rows(page.items ?? [])],
		}));
		return {
			...query,
			queryKey,
			queryHash,
			state: { ...query.state, data: pages ? { ...old, pages } : head },
		};
	});
	return mergePersistedQueries(previous, {
		...batch,
		clientState: { mutations: [], queries },
	});
}
