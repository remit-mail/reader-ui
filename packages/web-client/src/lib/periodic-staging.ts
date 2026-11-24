import { hashKey } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { mergePersistedQueries } from "./offline-queries";
import {
	offlineRecord,
	type Partition,
	samePartition,
	writeOfflineRecord,
} from "./offline-store";
import { type InboxHead, reconcileInboxHeads } from "./thread-list-cache";

export interface PeriodicBatch {
	partition: Partition;
	client: PersistedClient;
	inboxHeads: InboxHead[];
}
export const stagingKey = (partition: Partition): string =>
	`periodic:batch:${partition.generation}`;

/** Caller holds the partition lock. */
export async function stagePeriodicBatch(batch: PeriodicBatch): Promise<void> {
	const key = stagingKey(batch.partition);
	const stored = await offlineRecord<PeriodicBatch>(key);
	const prior =
		stored && samePartition(stored.partition, batch.partition)
			? stored
			: undefined;
	const heads = new Map(
		prior?.inboxHeads?.map((head) => [hashKey(head.key), head]),
	);
	for (const head of batch.inboxHeads) {
		const key = hashKey(head.key);
		const saved = heads.get(key);
		if (!saved || saved.updatedAt <= head.updatedAt) heads.set(key, head);
	}
	await writeOfflineRecord(key, {
		...batch,
		client: mergePersistedQueries(prior?.client, batch.client),
		inboxHeads: [...heads.values()],
	} satisfies PeriodicBatch);
}

/** Caller holds the partition lock. Save before deleting so interrupted hydration is safe. */
export async function mergePeriodicBatch(
	partition: Partition,
): Promise<PersistedClient | undefined> {
	const key = `queries:${partition.generation}`;
	const previous = await offlineRecord<PersistedClient>(key);
	const batchKey = stagingKey(partition);
	const batch = await offlineRecord<PeriodicBatch>(batchKey);
	if (!batch) return previous;
	if (!samePartition(batch.partition, partition)) {
		await writeOfflineRecord(batchKey, undefined);
		return previous;
	}

	const { queries: heads, pending } = reconcileInboxHeads(
		previous?.clientState.queries,
		batch.inboxHeads ?? [],
	);

	// Earlier workers also dehydrate their private head key. Only the typed
	// inboxHeads field can supply a list to hydrate.
	const staged = batch.client.clientState.queries.filter(
		({ queryKey: [key] }) =>
			!(
				key &&
				typeof key === "object" &&
				"_id" in key &&
				key._id === "threadOperationsListThreads"
			),
	);
	let merged = previous;
	if (staged.length || heads.length) {
		merged = mergePersistedQueries(previous, {
			...batch.client,
			clientState: { mutations: [], queries: [...staged, ...heads] },
		});
		await writeOfflineRecord(key, merged);
	}
	if (!pending.length) await writeOfflineRecord(batchKey, undefined);
	else if (
		batch.client.clientState.queries.length ||
		pending.length !== batch.inboxHeads.length
	) {
		await writeOfflineRecord(batchKey, {
			...batch,
			client: { ...batch.client, clientState: { mutations: [], queries: [] } },
			inboxHeads: pending,
		} satisfies PeriodicBatch);
	}
	return merged;
}
