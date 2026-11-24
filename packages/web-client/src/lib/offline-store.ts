import type { Query } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { taggedFetch } from "./network-error";
import { OfflineUnavailableError } from "./offline-error";
/** Independent of shell/build versions. Changing this requires an explicit wipe. */
export const OFFLINE_FORMAT = 2;
export const PERSIST_BUSTER = String(OFFLINE_FORMAT);
export const PARTITION_HEADER = "x-remit-partition";
export interface Partition {
	key: string;
	generation: string;
	format: number;
	epoch: string;
}
export interface Refresh {
	apiUrl: string;
	sessionUrl: string;
}

export async function readSession(
	url: string,
): Promise<{ partitionKey: string } | null> {
	const response = await fetch(url, {
		cache: "no-store",
		credentials: "same-origin",
		redirect: "manual",
		headers: { "X-Requested-With": "XMLHttpRequest" },
	});
	if (
		response.status === 401 ||
		response.status === 403 ||
		response.type === "opaqueredirect"
	)
		return null;
	if (
		response.status !== 200 ||
		response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
			"application/json"
	)
		throw new Error(`Session verification failed: ${response.status}`);
	const session: { partitionKey?: unknown } | null = await response.json();
	const partitionKey = session?.partitionKey;
	if (typeof partitionKey !== "string" || !partitionKey)
		throw new Error("Session partition key is empty");
	return { partitionKey };
}

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
const contentCacheName = (partition: Partition): string =>
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
export const storageLock = async <T>(work: () => Promise<T>): Promise<T> =>
	await navigator.locks.request("remit-offline-storage", work);

export const commitOffline = async <T>(
	partition: Partition,
	work: () => Promise<T>,
): Promise<T> =>
	storageLock(async () => {
		await requirePartition(partition);
		return work();
	});
export const wipeOffline = async (): Promise<void> =>
	storageLock(async () => {
		const refreshOff = await offlineRecord<boolean>("refresh-off");
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
				if (refreshOff) tx.objectStore("data").put(true, "refresh-off");
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

const contentCacheKey = (url: string): string => {
	const target = new URL(url, location.origin);
	if (
		target.origin !== location.origin ||
		!target.pathname.startsWith("/content/") ||
		/\/exports?(?:\/|$)/i.test(target.pathname)
	)
		throw new Error("Only same-origin mail parts can be downloaded");
	return `${target.origin}${target.pathname}`;
};

async function readContent(partition: Partition, key: string, mime: string) {
	const saved = await offlineRecord<{ mime: string }>(
		`part:${partition.generation}:${key}`,
	);
	if (saved?.mime === mime)
		return caches.match(key, { cacheName: contentCacheName(partition) });
}

async function storeContent(
	partition: Partition,
	key: string,
	mime: string,
	response: Response,
) {
	const cache = await caches.open(contentCacheName(partition));
	await cache.put(key, response.clone());
	await writeOfflineRecord(`part:${partition.generation}:${key}`, { mime });
}

type ContentCommits = {
	commit<T>(partition: Partition, work: () => Promise<T>): Promise<T>;
	write<T>(partition: Partition, work: () => Promise<T>): Promise<T>;
};

export async function downloadPart(
	partition: Partition,
	url: string,
	mime: string,
	network: () => Promise<Response>,
	commits: ContentCommits,
): Promise<{ response: Response; saved: boolean }> {
	const key = contentCacheKey(url);
	const cached = await commits.commit(partition, () =>
		readContent(partition, key, mime),
	);
	if (cached) return { response: cached, saved: true };
	const response = await network();
	const saved = await admitContent(response, mime, partition);
	if (saved)
		await commits.write(partition, () =>
			storeContent(partition, key, mime, response),
		);
	await requirePartition(partition);
	return { response, saved };
}

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

export async function persistQueries(
	partition: Partition,
	client: PersistedClient,
) {
	const key = `queries:${partition.generation}`;
	const previous = await offlineRecord<PersistedClient>(key);
	await writeOfflineRecord(key, mergePersistedQueries(previous, client));
}

const validateNetworkPartition = async (
	response: Response,
	partition: Partition,
): Promise<void> => {
	await requirePartition(partition);
	if (response.ok && response.headers.get(PARTITION_HEADER) !== partition.key)
		throw new Error(
			"Response tenant provenance is missing or changed; nothing was saved",
		);
};

export async function fetchInPartition(
	partition: Partition,
	input: Parameters<typeof fetch>[0],
	init?: RequestInit,
): Promise<Response> {
	const response = await taggedFetch(input, init);
	await validateNetworkPartition(response, partition);
	return response;
}
