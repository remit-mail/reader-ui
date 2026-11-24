import { OfflineUnavailableError } from "./offline-error";
/** Independent of shell/build versions. Changing this requires an explicit wipe. */
export const OFFLINE_FORMAT = 2;
export const OFFLINE_LOCK = "remit-offline-storage";
export const PARTITION_HEADER = "x-remit-partition";
export interface Partition {
	key: string;
	generation: string;
	format: number;
	epoch: string;
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
export const storageLock = async <T>(work: () => Promise<T>): Promise<T> =>
	await navigator.locks.request(OFFLINE_LOCK, work);
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
/** Lock covers both Cache Storage and IDB: no stale completion can pass a wipe. */
export const commitOffline = <T>(
	partition: Partition,
	work: () => Promise<T>,
): Promise<T> =>
	storageLock(async () => {
		await requirePartition(partition);
		return work();
	});
export const wipeOffline = async (): Promise<void> =>
	storageLock(async () => {
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

export const mailPartCacheKey = (url: string): string => {
	const target = new URL(url, location.origin);
	if (
		target.origin !== location.origin ||
		!target.pathname.startsWith("/content/") ||
		/\/exports?(?:\/|$)/i.test(target.pathname)
	)
		throw new Error("Only same-origin mail parts can be downloaded");
	return target.origin + target.pathname;
};
/** Both foreground and worker callers supply their own generation/run guard. */
export async function saveMailPart(
	partition: Partition,
	url: string,
	mime: string,
	response: Response,
	commit: (work: () => Promise<void>) => Promise<void>,
): Promise<boolean> {
	const key = mailPartCacheKey(url);
	if (!(await admitContent(response, mime, partition))) return false;
	await commit(async () => {
		await (await caches.open(contentCacheName(partition))).put(
			key,
			response.clone(),
		);
		await writeOfflineRecord(`part:${partition.generation}:${key}`, {
			mime,
			savedAt: Date.now(),
		});
	});
	return true;
}
