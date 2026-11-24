import { messageOperationsDescribeMessageQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { createClient } from "@remit/api-http-client/client/index.ts";
import {
	configOperationsGetConfig,
	messageOperationsDescribeMessage,
	threadOperationsListThreads,
} from "@remit/api-http-client/sdk.gen.ts";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { getRuntimeConfig } from "../runtime-config";
import { pickRenderablePart } from "./message-body-source";
import { taggedFetch } from "./network-error";
import {
	admitContent,
	commitOffline,
	contentCacheKey,
	offlineRecord,
	type Partition,
	PERSIST_BUSTER,
	persistQueries,
	type Refresh,
	readContent,
	readSession,
	retainedReadingQuery,
	storageLock,
	storeContent,
	validateNetworkPartition,
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
declare const self: { registration: ServiceWorkerRegistration };

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
	const { periodicSync } = await navigator.serviceWorker.ready;
	if (!periodicSync) return;
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

export async function refreshInBackground() {
	const { partition, refresh, off } = await storageLock(async () => ({
		partition: await offlineRecord<Partition>("partition"),
		refresh: await offlineRecord<Refresh>("refresh"),
		off: await offlineRecord<boolean>("refresh-off"),
	}));
	if (!partition || !refresh || off) return;
	const unregister = () =>
		self.registration.periodicSync?.unregister(REFRESH_TAG);
	const session = await readSession(refresh.sessionUrl);
	if (session?.partitionKey !== partition.key) {
		await unregister();
		return;
	}

	const client = createClient({
		baseUrl: refresh.apiUrl,
		throwOnError: true,
		fetch: async (input, init) => {
			const response = await taggedFetch(input, init);
			if (response.status === 401 || response.status === 403) {
				await unregister();
				throw new Error(`Background refresh was refused (${response.status})`);
			}
			await validateNetworkPartition(response, partition);
			return response;
		},
	});
	const options = { client, throwOnError: true } as const;
	const { data: config } = await configOperationsGetConfig(options);
	const messages = [];
	for (const account of config.accounts) {
		const mailboxId = account.folderAppointments.find(
			(a) => a.role === "Inbox",
		)?.mailboxId;
		if (!mailboxId) continue;
		const { data } = await threadOperationsListThreads({
			...options,
			path: { mailboxId },
			query: { order: "desc" },
		});
		messages.push(...data.items);
	}
	const queryClient = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const bodies = [];
	for (const { messageId } of messages.sort(
		(a, b) => b.sentDate - a.sentDate,
	)) {
		const path = { messageId };
		const { data } = await messageOperationsDescribeMessage({
			...options,
			path,
		});
		queryClient.setQueryData(
			messageOperationsDescribeMessageQueryKey({ client, path }),
			data,
		);
		const body = pickRenderablePart(data.bodyParts);
		if (body) bodies.push(body);
	}
	const write = (work: () => Promise<void>) =>
		commitOffline(partition, async () => {
			if (await offlineRecord<boolean>("refresh-off")) return false;
			await work();
			return true;
		});
	if (
		!(await write(() =>
			persistQueries(partition, {
				buster: PERSIST_BUSTER,
				timestamp: Date.now(),
				clientState: dehydrate(queryClient, {
					shouldDehydrateQuery: retainedReadingQuery,
				}),
			}),
		))
	)
		return;
	for (const { contentUrl, kind } of bodies) {
		const mime = kind === "html" ? "text/html" : "text/plain";
		const cacheKey = contentCacheKey(contentUrl);
		if (
			await commitOffline(partition, () =>
				readContent(partition, cacheKey, mime),
			)
		)
			continue;
		const response = await taggedFetch(contentUrl);
		if (
			response.status === 202 ||
			(response.status === 403 &&
				response.headers.get("x-remit-403-reason") === "expired")
		)
			continue;
		if (response.status === 401) {
			await unregister();
			throw new Error("Background body was refused (401)");
		}
		if (!(await admitContent(response, mime, partition)))
			throw new Error(`Background body was not admitted (${response.status})`);
		if (!(await write(() => storeContent(partition, cacheKey, mime, response))))
			return;
	}
}
