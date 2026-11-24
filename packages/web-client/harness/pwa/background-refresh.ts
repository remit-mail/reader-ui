/// <reference lib="webworker" />
import { messageOperationsDescribeMessageQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { createClient } from "@remit/api-http-client/client/index.ts";
import {
	configOperationsGetConfig,
	messageOperationsDescribeMessage,
	threadOperationsListThreads,
} from "@remit/api-http-client/sdk.gen.ts";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { REFRESH_TAG } from "../../src/lib/background-refresh";
import {
	classifyBodyFetchFailure,
	type PickedBodyPart,
	pickRenderablePart,
} from "../../src/lib/message-body-source";
import { taggedFetch } from "../../src/lib/network-error";
import {
	commitOffline,
	downloadPart,
	fetchInPartition,
	offlineRecord,
	type Partition,
	PERSIST_BUSTER,
	persistQueries,
	type Refresh,
	readSession,
	retainedReadingQuery,
	storageLock,
} from "../../src/lib/offline-store";

export async function refreshInBackground() {
	const { partition, refresh, off } = await storageLock(async () => ({
		partition: await offlineRecord<Partition>("partition"),
		refresh: await offlineRecord<Refresh>("refresh"),
		off: await offlineRecord<boolean>("refresh-off"),
	}));
	if (!partition || !refresh || off) return;
	const scope = globalThis as typeof globalThis & ServiceWorkerGlobalScope;
	const unregister = () =>
		scope.registration.periodicSync?.unregister(REFRESH_TAG);
	const session = await readSession(refresh.sessionUrl);
	if (session?.partitionKey !== partition.key) {
		await unregister();
		return;
	}

	const client = createClient({
		baseUrl: refresh.apiUrl,
		throwOnError: true,
		fetch: async (input, init) => {
			const response = await fetchInPartition(partition, input, init);
			if (response.status === 401 || response.status === 403) {
				await unregister();
				throw new Error(`Background refresh was refused (${response.status})`);
			}
			return response;
		},
	});
	const options = { client, throwOnError: true } as const;
	const { data: config } = await configOperationsGetConfig(options);
	const queryClient = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const bodies: PickedBodyPart[] = [];
	for (const account of config.accounts) {
		const mailboxId = account.folderAppointments.find(
			(a) => a.role === "Inbox",
		)?.mailboxId;
		if (!mailboxId) continue;
		const { data: page } = await threadOperationsListThreads({
			...options,
			path: { mailboxId },
			query: { order: "desc" },
		});
		for (const { messageId } of page.items) {
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
	}
	const write = <T>(partition: Partition, work: () => Promise<T>) =>
		commitOffline(partition, async () => {
			if (await offlineRecord<boolean>("refresh-off"))
				throw new Error("Background refresh is off");
			return work();
		});
	await write(partition, () =>
		persistQueries(partition, {
			buster: PERSIST_BUSTER,
			timestamp: Date.now(),
			clientState: dehydrate(queryClient, {
				shouldDehydrateQuery: retainedReadingQuery,
			}),
		}),
	);
	for (const { contentUrl, kind } of bodies) {
		const { response } = await downloadPart(
			partition,
			contentUrl,
			kind === "html" ? "text/html" : "text/plain",
			() => taggedFetch(contentUrl),
			{ commit: commitOffline, write },
		);
		if (
			!response.ok &&
			classifyBodyFetchFailure(
				response.status,
				response.headers.get("x-remit-403-reason"),
			) === "auth"
		) {
			await unregister();
			throw new Error(`Background body was refused (${response.status})`);
		}
	}
}
