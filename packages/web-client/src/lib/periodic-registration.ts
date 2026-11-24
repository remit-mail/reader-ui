import {
	commitOffline,
	type Partition,
	storageLock,
	writeOfflineRecord,
} from "./offline-store";

export const PERIODIC_TAG = "remit-refresh-downloads";
export const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
export interface PeriodicRefreshOptions {
	/** Same-origin authenticated endpoint returning { partitionKey }. */
	sessionEndpoint: string;
}
export interface PeriodicRegistration extends ServiceWorkerRegistration {
	periodicSync: {
		register(tag: string, options: { minInterval: number }): Promise<void>;
		unregister(tag: string): Promise<void>;
	};
}
/** Browser eligibility is optional; every refusal, including registration, is silent. */
export async function registerPeriodicRefresh(
	partition: Partition,
	options: PeriodicRefreshOptions,
	apiBaseUrl: string,
): Promise<void> {
	try {
		if (
			typeof ServiceWorkerRegistration === "undefined" ||
			!("periodicSync" in ServiceWorkerRegistration.prototype) ||
			!window.matchMedia("(display-mode: standalone)").matches ||
			!navigator.permissions
		)
			return;
		const permission = await navigator.permissions.query({
			name: "periodic-background-sync" as PermissionName,
		});
		if (permission.state !== "granted") return;
		const session = new URL(options.sessionEndpoint, location.origin);
		const api = new URL(apiBaseUrl, location.origin);
		if (session.origin !== location.origin || api.origin !== location.origin)
			return;
		const registration = (await navigator.serviceWorker
			.ready) as PeriodicRegistration;
		await commitOffline(partition, async () => {
			await writeOfflineRecord("periodic:config", {
				partition,
				runId: crypto.randomUUID(),
				sessionEndpoint: session.href,
				apiBaseUrl,
			});
			await writeOfflineRecord(
				`periodic:status:${partition.generation}`,
				undefined,
			);
			await registration.periodicSync.register(PERIODIC_TAG, {
				minInterval: DAILY_INTERVAL,
			});
		});
	} catch {
		// Unsupported, uninstalled, denied and failed registrations have no UI/reporting.
	}
}
export async function unregisterPeriodicRefresh(): Promise<void> {
	try {
		const registration = (await navigator.serviceWorker?.getRegistration()) as
			| PeriodicRegistration
			| undefined;
		await registration?.periodicSync?.unregister(PERIODIC_TAG);
	} catch {
		// Registration is best effort, including its removal.
	}
}

/** A foreground host opt-out also removes an earlier installation's registration. */
export async function disablePeriodicRefresh(): Promise<void> {
	if (
		typeof ServiceWorkerRegistration === "undefined" ||
		!("periodicSync" in ServiceWorkerRegistration.prototype)
	)
		return;
	await storageLock(async () => {
		await writeOfflineRecord("periodic:config", undefined);
		await unregisterPeriodicRefresh();
	}).catch(() => {});
}
