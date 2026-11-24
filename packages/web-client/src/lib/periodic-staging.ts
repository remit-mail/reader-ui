import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { mergePersistedQueries } from "./offline-queries";
import {
	offlineRecord,
	type Partition,
	writeOfflineRecord,
} from "./offline-store";
import { type InboxHead, reconcileInboxHeads } from "./thread-list-cache";

/** Caller holds the partition lock. A failed write keeps the saved snapshot. */
export async function savePeriodicDownloads(
	partition: Partition,
	client: PersistedClient,
	inboxHeads: InboxHead[],
): Promise<void> {
	const key = `queries:${partition.generation}`;
	const previous = await offlineRecord<PersistedClient>(key);
	const heads = reconcileInboxHeads(previous?.clientState.queries, inboxHeads);
	await writeOfflineRecord(
		key,
		mergePersistedQueries(previous, {
			...client,
			clientState: {
				mutations: [],
				queries: [...client.clientState.queries, ...heads],
			},
		}),
	);
}
