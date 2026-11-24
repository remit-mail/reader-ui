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
		? mergePersistedQueries(previous, batch.client)
		: previous;
	if (merged) await writeOfflineRecord(key, merged);
	await writeOfflineRecord(stagingKey(partition), undefined);
	return merged;
}
