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
	retainedReadingQuery,
	samePartition,
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
export class LoginRequired extends Error {}

export const supportsBackgroundRefresh = (): boolean =>
	"periodicSync" in (globalThis.ServiceWorkerRegistration?.prototype ?? {});

export async function syncBackgroundRefresh(
	partition: Partition,
	sessionUrl?: string,
) {
	if (!sessionUrl || !supportsBackgroundRefresh()) return;
	const permission = await navigator.permissions.query({
		name: "periodic-background-sync" as PermissionName,
	});
	if (permission.state !== "granted") return;
	const { periodicSync } = await navigator.serviceWorker.ready;
	if (!periodicSync) return;
	await commitOffline(partition, async () => {
		if ((await offlineRecord<Refresh>("refresh"))?.off) return;
		await writeOfflineRecord("refresh", {
			off: false,
			apiUrl: getRuntimeConfig().apiUrl,
			sessionUrl,
			stamp: crypto.randomUUID(),
		} satisfies Refresh);
		await periodicSync.register(REFRESH_TAG, {
			minInterval: 24 * 60 * 60 * 1000,
		});
	});
}

export async function unregisterBackgroundRefresh() {
	const registration = await navigator.serviceWorker?.getRegistration();
	await registration?.periodicSync?.unregister(REFRESH_TAG);
}

export const disableBackgroundRefresh = (sessionUrl: string): Promise<void> =>
	commitOffline(undefined, async () => {
		const current = await offlineRecord<Refresh>("refresh");
		await writeOfflineRecord("refresh", {
			apiUrl: getRuntimeConfig().apiUrl,
			sessionUrl,
			stamp: crypto.randomUUID(),
			...current,
			off: true,
		} satisfies Refresh);
		await unregisterBackgroundRefresh();
	});

interface ObservedRefresh {
	partition: Partition;
	refresh: Refresh;
}

export const unregisterIfCurrent = (
	registration: ServiceWorkerRegistration,
	observed: ObservedRefresh,
): Promise<void> =>
	commitOffline(undefined, async () => {
		if (
			samePartition(
				await offlineRecord<Partition>("partition"),
				observed.partition,
			) &&
			(await offlineRecord<Refresh>("refresh"))?.stamp ===
				observed.refresh.stamp
		)
			await registration.periodicSync?.unregister(REFRESH_TAG);
	});

export async function refreshInBackground(
	observe: (state: ObservedRefresh) => void,
) {
	const { partition, refresh } = await commitOffline(undefined, async () => ({
		partition: await offlineRecord<Partition>("partition"),
		refresh: await offlineRecord<Refresh>("refresh"),
	}));
	if (!partition || !refresh || refresh.off) return;
	observe({ partition, refresh });
	const session = await taggedFetch(refresh.sessionUrl, { cache: "no-store" });
	if (
		session.status === 401 ||
		session.status === 403 ||
		session.type === "opaqueredirect"
	)
		throw new LoginRequired();
	if (
		session.status !== 200 ||
		session.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
			"application/json"
	)
		throw new Error("Expected a 200 JSON session response");
	const { partitionKey } = await session.json();
	if (typeof partitionKey !== "string" || !partitionKey)
		throw new Error("Session partition key is empty");
	if (partitionKey !== partition.key) throw new LoginRequired();

	const client = createClient({
		baseUrl: refresh.apiUrl,
		throwOnError: true,
		fetch: async (input, init) => {
			const response = await taggedFetch(input, init);
			if (response.status === 401 || response.status === 403)
				throw new LoginRequired();
			await validateNetworkPartition(response, partition);
			return response;
		},
	});
	const options = { client, throwOnError: true } as const;
	const { data: config } = await configOperationsGetConfig(options);
	const messages = [];
	for (const account of config.accounts) {
		const inbox = account.folderAppointments.find((a) => a.role === "Inbox");
		if (!inbox?.mailboxId) continue;
		const { data } = await threadOperationsListThreads({
			...options,
			path: { mailboxId: inbox.mailboxId },
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
	const guard = async () => {
		if ((await offlineRecord<Refresh>("refresh"))?.off)
			throw new Error("Background refresh is off");
	};
	await persistQueries(
		partition,
		{
			buster: PERSIST_BUSTER,
			timestamp: Date.now(),
			clientState: dehydrate(queryClient, {
				shouldDehydrateQuery: retainedReadingQuery,
			}),
		},
		guard,
	);
	for (const { contentUrl, kind } of bodies) {
		const mime = kind === "html" ? "text/html" : "text/plain";
		if (await readContent(partition, contentCacheKey(contentUrl), mime))
			continue;
		const response = await taggedFetch(contentUrl);
		if (
			response.status === 202 ||
			(response.status === 403 &&
				response.headers.get("x-remit-403-reason") === "expired")
		)
			continue;
		if (response.status === 401) throw new LoginRequired();
		if (
			response.status !== 200 ||
			!(await admitContent(response, mime, partition))
		)
			throw new Error(`Background body was not admitted (${response.status})`);
		await storeContent(partition, contentUrl, mime, response, guard);
	}
}
