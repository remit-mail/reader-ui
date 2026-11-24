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
	kind: "bound";
	optOut: string | undefined;
	revision: string;
	verification: string;
	status: PeriodicStatus;
	partition: Partition;
	sessionEndpoint: string;
	apiBaseUrl: string;
}
export type PeriodicStatus =
	| { kind: "ready" }
	| { kind: "login-required" }
	| { kind: "retry"; attempts: number; nextAttempt: number };
export const periodicWarningKey = (partition: Partition): string =>
	`periodic:warning:${partition.generation}`;
export const writePeriodicStatus = (
	binding: PeriodicConfig,
	status: PeriodicStatus,
): Promise<void> => writeOfflineRecord(CONFIG_KEY, { ...binding, status });

type PeriodicRecord =
	| PeriodicConfig
	| {
			kind: "disabled";
			revision: string;
			optOut: string | undefined;
	  };

const readConfigRecord = () => offlineRecord<PeriodicRecord>(CONFIG_KEY);

export const periodicOptOutRevision = async (): Promise<string | undefined> =>
	(await readConfigRecord())?.optOut;

const isPeriodicConfig = (
	record: PeriodicRecord | undefined,
): record is PeriodicConfig =>
	record?.kind === "bound" && record.partition.format === OFFLINE_FORMAT;

export async function readPeriodicConfig(): Promise<
	PeriodicConfig | undefined
> {
	const config = await readConfigRecord();
	return isPeriodicConfig(config) ? config : undefined;
}

export const commitPeriodicRefresh = <T>(
	config: PeriodicConfig,
	work: (binding: PeriodicConfig) => Promise<T>,
): Promise<T> =>
	commitOffline(config.partition, async () => {
		const current = await readPeriodicConfig();
		if (current?.revision !== config.revision)
			throw new OfflineUnavailableError("Periodic refresh was disabled");
		return work(current);
	});

/** Browser eligibility is optional; every refusal, including registration, is silent. */
export async function registerPeriodicRefresh(
	partition: Partition,
	options: PeriodicRefreshOptions,
	apiBaseUrl: string,
	optOut: string | undefined,
	reportWarning: (reason: string) => void,
): Promise<void> {
	await (async () => {
		if (
			typeof ServiceWorkerRegistration === "undefined" ||
			!("periodicSync" in ServiceWorkerRegistration.prototype) ||
			!window.matchMedia("(display-mode: standalone)").matches ||
			!navigator.permissions
		)
			return;
		const revision = (await readConfigRecord())?.revision;
		const permission = await navigator.permissions
			.query({
				name: "periodic-background-sync" as PermissionName,
			})
			.catch(() => undefined);
		if (permission?.state !== "granted") return;
		const session = new URL(options.sessionEndpoint, location.origin);
		const api = new URL(apiBaseUrl, location.origin);
		if (session.origin !== location.origin || api.origin !== location.origin)
			return;
		const registration = (await navigator.serviceWorker?.ready.catch(
			() => undefined,
		)) as PeriodicRegistration | undefined;
		if (!registration) return;
		await commitOffline(partition, async () => {
			const current = await readConfigRecord();
			if (current?.revision !== revision || current?.optOut !== optOut) return;
			const registered = await registration.periodicSync
				.register(PERIODIC_TAG, {
					minInterval: DAILY_INTERVAL,
				})
				.then(
					() => true,
					() => false,
				);
			if (!registered) return;
			const sameBinding =
				isPeriodicConfig(current) &&
				samePartition(current.partition, partition) &&
				current.sessionEndpoint === session.href &&
				current.apiBaseUrl === apiBaseUrl;
			await writeOfflineRecord(CONFIG_KEY, {
				kind: "bound",
				partition,
				revision: sameBinding ? current.revision : crypto.randomUUID(),
				verification: crypto.randomUUID(),
				status: { kind: "ready" },
				optOut,
				sessionEndpoint: session.href,
				apiBaseUrl,
			} satisfies PeriodicConfig);
		});
	})().catch((error: unknown) => {
		if (!(error instanceof OfflineUnavailableError))
			reportWarning("Periodic refresh could not save its browser binding");
	});
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
	if (revoke) await revokeConfig(await periodicOptOutRevision());
	try {
		await unregisterTag(registration);
	} catch (cause) {
		throw new PeriodicUnregisterError(
			"Periodic refresh could not unregister the browser tag",
			{ cause },
		);
	}
}

const revokeConfig = (optOut: string | undefined) =>
	writeOfflineRecord(CONFIG_KEY, {
		kind: "disabled",
		revision: crypto.randomUUID(),
		optOut,
	} satisfies PeriodicRecord);

/** A foreground host opt-out also removes an earlier installation's registration. */
export async function disablePeriodicRefresh(
	reportWarning: (reason: string) => void,
): Promise<void> {
	if (
		typeof ServiceWorkerRegistration === "undefined" ||
		!("periodicSync" in ServiceWorkerRegistration.prototype)
	)
		return;
	let revoked = false;
	await storageLock(async () => {
		await revokeConfig(crypto.randomUUID());
		revoked = true;
		await unregisterBrowserTag();
	}).catch(() =>
		reportWarning(
			revoked
				? "Periodic refresh was revoked but could not unregister the browser tag"
				: "Periodic refresh could not be durably revoked",
		),
	);
}

export const wipePeriodicDownloads = (
	reportWarning: (reason: string) => void,
): Promise<void> =>
	wipeOffline(() =>
		unregisterBrowserTag().catch(() =>
			reportWarning(
				"Periodic downloads were removed but the browser tag could not be unregistered",
			),
		),
	);
