import { OfflineUnavailableError } from "./offline-error";
import {
	commitOffline,
	OFFLINE_FORMAT,
	offlineRecord,
	type Partition,
	samePartition,
	storageLock,
	wipeOffline,
	writeOfflineRecord,
} from "./offline-store";

export const PERIODIC_TAG = "remit-refresh-downloads";
export const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
const CONFIG_KEY = "periodic:config";

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
export interface PeriodicConfig {
	revision: string;
	partition: Partition;
	sessionEndpoint: string;
	apiBaseUrl: string;
}
export interface PeriodicStatus {
	verification?: string;
	needsLogin?: boolean;
	attempts?: number;
	nextAttempt?: number;
}
export const periodicWarningKey = (partition: Partition): string =>
	`periodic:warning:${partition.generation}`;
export const periodicStatusKey = (partition: Partition): string =>
	`periodic:status:${partition.generation}`;

const readConfigRecord = () =>
	offlineRecord<Partial<PeriodicConfig>>(CONFIG_KEY);

const isPeriodicConfig = (
	config: Partial<PeriodicConfig> | undefined,
): config is PeriodicConfig =>
	typeof config?.revision === "string" &&
	config.revision.length > 0 &&
	config.partition?.format === OFFLINE_FORMAT &&
	typeof config.partition.key === "string" &&
	config.partition.key.length > 0 &&
	typeof config.partition.generation === "string" &&
	config.partition.generation.length > 0 &&
	typeof config.partition.epoch === "string" &&
	config.partition.epoch.length > 0 &&
	typeof config.sessionEndpoint === "string" &&
	config.sessionEndpoint.length > 0 &&
	typeof config.apiBaseUrl === "string" &&
	config.apiBaseUrl.length > 0;

export async function readPeriodicConfig(): Promise<
	PeriodicConfig | undefined
> {
	const config = await readConfigRecord();
	return isPeriodicConfig(config) ? config : undefined;
}

export const commitPeriodicRefresh = <T>(
	config: PeriodicConfig,
	work: () => Promise<T>,
): Promise<T> =>
	commitOffline(config.partition, async () => {
		const current = await readPeriodicConfig();
		if (current?.revision !== config.revision)
			throw new OfflineUnavailableError("Periodic refresh was disabled");
		return work();
	});

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
		const revision = (await readConfigRecord())?.revision;
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
			const current = await readConfigRecord();
			if (current?.revision !== revision) return;
			await registration.periodicSync.register(PERIODIC_TAG, {
				minInterval: DAILY_INTERVAL,
			});
			if (
				!isPeriodicConfig(current) ||
				!samePartition(current.partition, partition) ||
				current.sessionEndpoint !== session.href ||
				current.apiBaseUrl !== apiBaseUrl
			) {
				await writeOfflineRecord(CONFIG_KEY, {
					partition,
					revision: crypto.randomUUID(),
					sessionEndpoint: session.href,
					apiBaseUrl,
				} satisfies PeriodicConfig);
			}
			await writeOfflineRecord(periodicStatusKey(partition), {
				verification: crypto.randomUUID(),
			} satisfies PeriodicStatus);
		});
	} catch {
		// Unsupported, uninstalled, denied and failed registrations have no UI/reporting.
	}
}

const unregisterTag = (registration?: PeriodicRegistration) =>
	registration?.periodicSync?.unregister(PERIODIC_TAG);

async function unregisterBrowserTag(): Promise<void> {
	const registration = (await navigator.serviceWorker?.getRegistration()) as
		| PeriodicRegistration
		| undefined;
	await unregisterTag(registration);
}

export class PeriodicUnregisterError extends Error {}

/** Caller holds the storage lock and has checked the worker's revision. */
export async function stopPeriodicRefresh(
	registration: PeriodicRegistration,
	revoke: boolean,
): Promise<void> {
	if (revoke) await revokeConfig();
	try {
		await unregisterTag(registration);
	} catch (cause) {
		throw new PeriodicUnregisterError(
			"Periodic refresh could not unregister the browser tag",
			{ cause },
		);
	}
}

const revokeConfig = () =>
	writeOfflineRecord(CONFIG_KEY, { revision: crypto.randomUUID() });

/** A foreground host opt-out also removes an earlier installation's registration. */
export async function disablePeriodicRefresh(): Promise<void> {
	if (
		typeof ServiceWorkerRegistration === "undefined" ||
		!("periodicSync" in ServiceWorkerRegistration.prototype)
	)
		return;
	await storageLock(async () => {
		await revokeConfig();
		await unregisterBrowserTag();
	}).catch(() => {});
}

export const wipePeriodicDownloads = (): Promise<void> =>
	wipeOffline(() => unregisterBrowserTag().catch(() => {}));
