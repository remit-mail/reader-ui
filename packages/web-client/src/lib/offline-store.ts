import type { Query } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { OfflineUnavailableError } from "./offline-error";
/** Independent of shell/build versions. Changing this requires an explicit wipe. */
export const OFFLINE_FORMAT = 2;
export const PERSIST_BUSTER = String(OFFLINE_FORMAT);
export const OFFLINE_LOCK = "remit-offline-storage";
export const PARTITION_HEADER = "x-remit-partition";
export interface Partition {
	key: string;
	generation: string;
	format: number;
	epoch: string;
}
export interface Refresh {
	off: boolean;
	apiUrl: string;
	sessionUrl: string;
	stamp: string;
}
type Guard = () => Promise<void>;
const database = (): Promise<IDBDatabase> =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open("remit-offline", 1);
		request.onupgradeneeded = () => {
			request.result.createObjectStore("data");
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
export const offlineRecord = async <T>(key: string): Promise<T | undefined> => {
	const db = await database();
	try {
		return await new Promise<T | undefined>((resolve, reject) => {
			const request = db.transaction("data").objectStore("data").get(key);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
};
export const writeOfflineRecord = async (
	key: string,
	value: unknown,
): Promise<void> => {
	const db = await database();
	try {
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction("data", "readwrite");
			const store = tx.objectStore("data");
			if (value === undefined) store.delete(key);
			else store.put(value, key);
			tx.oncomplete = () => resolve();
			tx.onabort = () => reject(tx.error);
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
};
export const contentCacheName = (partition: Partition): string =>
	`remit-content-v${OFFLINE_FORMAT}-${encodeURIComponent(partition.key)}-${partition.generation}`;
export const samePartition = (
	a: Partition | undefined,
	b: Partition,
): boolean =>
	a?.key === b.key &&
	a.generation === b.generation &&
	a.epoch === b.epoch &&
	a.format === OFFLINE_FORMAT;
export const requirePartition = async (partition: Partition): Promise<void> => {
	if (
		!samePartition(await offlineRecord<Partition>("partition"), partition) ||
		(await offlineRecord<string>("epoch")) !== partition.epoch
	)
		throw new OfflineUnavailableError(
			"Downloads were removed in another tab. Reopen the app.",
		);
};
/** Lifecycle operations pass undefined. Partition-bound writes cannot pass a wipe. */
export const commitOffline = async <T>(
	partition: Partition | undefined,
	work: () => Promise<T>,
	guard?: Guard,
): Promise<T> =>
	await navigator.locks.request(OFFLINE_LOCK, async () => {
		if (partition) await requirePartition(partition);
		await guard?.();
		return work();
	});
export const wipeOffline = async (): Promise<void> =>
	commitOffline(undefined, async () => {
		const refresh = await offlineRecord<Refresh>("refresh");
		// Revoke first, durably, including identity checks already in flight.
		const epoch = crypto.randomUUID();
		await writeOfflineRecord("epoch", epoch);
		await writeOfflineRecord("partition", undefined);
		for (const name of await caches.keys()) {
			if (name.startsWith("remit-content-")) await caches.delete(name);
		}
		const db = await database();
		try {
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction("data", "readwrite");
				tx.objectStore("data").clear();
				tx.objectStore("data").put(epoch, "epoch");
				if (refresh) tx.objectStore("data").put(refresh, "refresh");
				tx.oncomplete = () => resolve();
				tx.onabort = () => reject(tx.error);
				tx.onerror = () => reject(tx.error);
			});
		} finally {
			db.close();
		}
	});

export const admitContent = async (
	response: Response,
	mime: string,
	partition?: Partition,
): Promise<boolean> => {
	if (
		response.status !== 200 ||
		response.redirected ||
		!["basic", "cors", "default"].includes(response.type) ||
		(partition && response.headers.get(PARTITION_HEADER) !== partition.key) ||
		/(?:^|,)\s*no-store\b/i.test(response.headers.get("cache-control") ?? "") ||
		response.headers
			.get("content-type")
			?.split(";")[0]
			?.trim()
			.toLowerCase() !== mime.toLowerCase()
	)
		return false;
	if (mime === "text/html") {
		const html = await response.clone().text();
		if (
			/<div\s+id=["']root["']|<form[^>]*(?:login|sign.?in)|cloudflare access/i.test(
				html,
			)
		)
			return false;
	}
	return true;
};

export const contentCacheKey = (url: string): string => {
	const target = new URL(url, location.origin);
	if (
		target.origin !== location.origin ||
		!target.pathname.startsWith("/content/") ||
		/\/exports?(?:\/|$)/i.test(target.pathname)
	)
		throw new Error("Only same-origin mail parts can be downloaded");
	return `${target.origin}${target.pathname}`;
};

export const readContent = async (
	partition: Partition,
	cacheKey: string,
	mime: string,
): Promise<Response | undefined> => {
	const saved = await offlineRecord<{ mime: string }>(
		`part:${partition.generation}:${cacheKey}`,
	);
	return saved?.mime === mime
		? caches.match(cacheKey, { cacheName: contentCacheName(partition) })
		: undefined;
};

export const storeContent = (
	partition: Partition,
	url: string,
	mime: string,
	response: Response,
	guard?: Guard,
): Promise<void> =>
	commitOffline(
		partition,
		async () => {
			const cacheKey = contentCacheKey(url);
			await (await caches.open(contentCacheName(partition))).put(
				cacheKey,
				response.clone(),
			);
			await writeOfflineRecord(`part:${partition.generation}:${cacheKey}`, {
				mime,
				savedAt: Date.now(),
			});
		},
		guard,
	);

/** Explicit reading allowlist; settings, auth, drafts and mutations never persist. */
export const retainedReadingQuery = (
	query: Pick<Query, "queryKey">,
): boolean => {
	const first = query.queryKey[0];
	if (!first || typeof first !== "object" || !("_id" in first)) return false;
	if ("headers" in first || "body" in first) return false;
	return new Set([
		"mailboxOperationsListMailboxes",
		"messageOperationsDescribeMessage",
		"threadDetailOperationsListThreadMessages",
		"threadOperationsListThreads",
		"threadOperationsSearchThreads",
		"unifiedThreadOperationsListAllThreads",
	]).has(String(first._id));
};

/** Preserve the last successful descriptor even when a list page or error replaces it. */
export const mergePersistedQueries = (
	previous: PersistedClient | undefined,
	client: PersistedClient,
): PersistedClient => {
	const queries = new Map(
		previous?.clientState.queries.map((query) => [query.queryHash, query]),
	);
	for (const query of client.clientState.queries) {
		const existing = queries.get(query.queryHash);
		if (!existing || query.state.dataUpdatedAt >= existing.state.dataUpdatedAt)
			queries.set(query.queryHash, query);
	}
	return {
		...client,
		clientState: { mutations: [], queries: [...queries.values()] },
	};
};

export const persistQueries = (
	partition: Partition,
	client: PersistedClient,
	guard?: Guard,
): Promise<void> =>
	commitOffline(
		partition,
		async () => {
			const key = `queries:${partition.generation}`;
			const previous = await offlineRecord<PersistedClient>(key);
			await writeOfflineRecord(key, mergePersistedQueries(previous, client));
		},
		guard,
	);

export const validateNetworkPartition = async (
	response: Response,
	partition: Partition,
): Promise<void> => {
	await requirePartition(partition);
	if (response.ok && response.headers.get(PARTITION_HEADER) !== partition.key)
		throw new Error(
			"Response tenant provenance is missing or changed; nothing was saved",
		);
};
