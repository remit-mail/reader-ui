import { getRuntimeConfig } from "../runtime-config";
import {
	commitOffline,
	offlineRecord,
	type Partition,
	type Refresh,
	storageLock,
	writeOfflineRecord,
} from "./offline-store";

declare global {
	interface ServiceWorkerRegistration {
		readonly periodicSync?: {
			register(tag: string, options: { minInterval: number }): Promise<void>;
			unregister(tag: string): Promise<void>;
			getTags(): Promise<string[]>;
		};
	}
}

export const REFRESH_TAG = "remit-refresh";

export const supportsBackgroundRefresh = (): boolean =>
	"periodicSync" in (globalThis.ServiceWorkerRegistration?.prototype ?? {});

export async function syncBackgroundRefresh(
	partition: Partition,
	sessionUrl: string,
) {
	if (!supportsBackgroundRefresh()) return;
	const permission = await navigator.permissions.query({
		name: "periodic-background-sync" as PermissionName,
	});
	if (permission.state !== "granted") return;
	const periodicSync = (await navigator.serviceWorker.ready).periodicSync!;
	await commitOffline(partition, async () => {
		if (await offlineRecord<boolean>("refresh-off")) return;
		await writeOfflineRecord("refresh", {
			apiUrl: getRuntimeConfig().apiUrl,
			sessionUrl,
		} satisfies Refresh);
		await periodicSync.register(REFRESH_TAG, { minInterval: 86_400_000 });
	});
}

export async function unregisterBackgroundRefresh() {
	const registration = await navigator.serviceWorker?.getRegistration();
	await registration?.periodicSync?.unregister(REFRESH_TAG);
}

export async function disableBackgroundRefresh() {
	await storageLock(() => writeOfflineRecord("refresh-off", true));
	await unregisterBackgroundRefresh();
}
