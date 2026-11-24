import {
	mailboxOperationsListMailboxesQueryKey,
	messageOperationsDescribeMessageQueryKey,
	threadOperationsListThreadsQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapConfigDescriptionResponse,
	RemitImapDescribeMessageResponse,
	RemitImapMailboxListResponse,
	RemitImapThreadSearchResponse,
} from "@remit/api-http-client/types.gen.ts";
import { dehydrate, hashKey, QueryClient } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { pickRenderablePart } from "./message-body-source";
import { OfflineUnavailableError } from "./offline-error";
import { mergePersistedQueries } from "./offline-queries";
import {
	admitContent,
	commitOffline,
	contentCacheName,
	OFFLINE_FORMAT,
	offlineRecord,
	PARTITION_HEADER,
	type Partition,
	requirePartition,
	samePartition,
	writeOfflineRecord,
} from "./offline-store";
import {
	DAILY_INTERVAL,
	PERIODIC_TAG,
	type PeriodicRegistration,
} from "./periodic-registration";
import { type PeriodicBatch, stagingKey } from "./periodic-staging";

export const PERIODIC_MAX_BYTES = 10 * 1024 * 1024;
export const PERIODIC_MAX_MS = 30_000;
export const PERIODIC_MAX_MESSAGES = 20;
export interface PeriodicConfig {
	partition: Partition;
	sessionEndpoint: string;
	apiBaseUrl: string;
}
export interface PeriodicStatus {
	needsLogin?: boolean;
	attempts?: number;
	nextAttempt?: number;
	warning?: string;
}
export const periodicStatusKey = (partition: Partition): string =>
	`periodic:status:${partition.generation}`;
class RunLimit extends Error {}
class SessionRequired extends Error {}
class PartitionMismatch extends Error {}
class TransportFailure extends Error {}
/** Counts streamed bytes, including session and metadata, and aborts slow bodies. */
export class PeriodicBudget {
	readonly controller = new AbortController();
	private bytes = 0;
	private readonly started = Date.now();
	private readonly timer = setTimeout(
		() => this.controller.abort(),
		PERIODIC_MAX_MS,
	);
	check(): void {
		if (
			this.controller.signal.aborted ||
			Date.now() - this.started >= PERIODIC_MAX_MS
		)
			throw new RunLimit();
	}
	close(): void {
		clearTimeout(this.timer);
	}
	async fetch(url: string, session = false): Promise<Response> {
		this.check();
		const target = new URL(url, location.origin);
		if (target.origin !== location.origin)
			throw new Error("Background refresh requires same-origin URLs");
		const response = await fetch(target, {
			credentials: "same-origin",
			redirect: "manual",
			cache: "no-store",
			signal: session
				? AbortSignal.any([this.controller.signal, AbortSignal.timeout(5000)])
				: this.controller.signal,
		}).catch((cause: unknown) => {
			throw new TransportFailure("Background transport failed", { cause });
		});
		if (
			response.type === "opaqueredirect" ||
			response.redirected ||
			(response.status >= 300 && response.status < 400) ||
			response.status === 401 ||
			response.status === 403
		) {
			await response.body?.cancel();
			throw new SessionRequired();
		}
		if (
			response.status !== 200 ||
			!["basic", "cors", "default"].includes(response.type)
		)
			throw new Error(`Background refresh HTTP ${response.status}`);
		const reader = response.body?.getReader();
		const chunks: Uint8Array<ArrayBuffer>[] = [];
		try {
			while (reader) {
				const { value, done } = await reader.read().catch((cause: unknown) => {
					throw new TransportFailure("Background body transport failed", {
						cause,
					});
				});
				this.check();
				if (done) break;
				this.bytes += value.byteLength;
				if (this.bytes > PERIODIC_MAX_BYTES) throw new RunLimit();
				chunks.push(value);
			}
		} finally {
			await reader?.cancel();
		}
		return new Response(new Blob(chunks), {
			status: response.status,
			headers: response.headers,
		});
	}
}

/** No retries inside a run. Future browser events obey a durable exponential backoff. */
async function runPeriodicRefresh(
	registration: PeriodicRegistration,
): Promise<void> {
	const config = await offlineRecord<PeriodicConfig>("periodic:config");
	if (!config || config.partition.format !== OFFLINE_FORMAT) return;
	const { partition, apiBaseUrl } = config;
	const statusKey = periodicStatusKey(partition);
	const status = await offlineRecord<PeriodicStatus>(statusKey);
	if (
		status?.needsLogin ||
		(status?.attempts ?? 0) >= 10 ||
		(status?.nextAttempt ?? 0) > Date.now()
	)
		return;
	const budget = new PeriodicBudget();
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	let admitted = false;
	const apiUrl = (path: string) => `${apiBaseUrl.replace(/\/$/, "")}${path}`;
	const json = async <T>(path: string): Promise<T> => {
		const response = await budget.fetch(apiUrl(path));
		if (response.headers.get(PARTITION_HEADER) !== partition.key)
			throw new PartitionMismatch();
		if (
			!response.headers
				.get("content-type")
				?.split(";")[0]
				.trim()
				.endsWith("/json")
		)
			throw new Error("Background refresh expected JSON");
		return response.json() as Promise<T>;
	};
	const saveBatch = async () => {
		if (!admitted) return;
		budget.check();
		await commitOffline(partition, async () => {
			budget.check();
			const previous = await offlineRecord<PeriodicBatch>(
				stagingKey(partition),
			);
			const snapshot: PersistedClient = {
				timestamp: Date.now(),
				buster: String(OFFLINE_FORMAT),
				clientState: dehydrate(client),
			};
			await writeOfflineRecord(stagingKey(partition), {
				partition,
				client: mergePersistedQueries(
					previous && samePartition(previous.partition, partition)
						? previous.client
						: undefined,
					snapshot,
				),
			});
		});
	};
	try {
		await (async () => {
			await requirePartition(partition);
			const sessionResponse = await budget.fetch(config.sessionEndpoint, true);
			if (
				!sessionResponse.headers
					.get("content-type")
					?.startsWith("application/json")
			)
				throw new Error("Background session expected JSON");
			const session = await sessionResponse.json();
			if (typeof session.partitionKey !== "string" || !session.partitionKey)
				throw new Error("Invalid background session");
			if (session.partitionKey !== partition.key) throw new PartitionMismatch();
			const previous = await offlineRecord<PersistedClient>(
				`queries:${partition.generation}`,
			);
			const staged = await offlineRecord<PeriodicBatch>(stagingKey(partition));
			const known = new Set(
				[
					...(previous?.clientState.queries ?? []),
					...(staged && samePartition(staged.partition, partition)
						? staged.client.clientState.queries
						: []),
				]
					.filter((q) => q.state.status === "success")
					.map((q) => q.queryHash),
			);
			const configData =
				await json<RemitImapConfigDescriptionResponse>("/config");
			let count = 0;
			const seen = new Set<string>();
			for (const account of configData.accounts) {
				const path = { accountId: account.accountId };
				const mailboxes = await json<RemitImapMailboxListResponse>(
					`/accounts/${encodeURIComponent(path.accountId)}/mailboxes`,
				);
				client.setQueryData(
					mailboxOperationsListMailboxesQueryKey({ baseUrl: apiBaseUrl, path }),
					mailboxes,
				);
				admitted = true;
				const inbox = mailboxes.items.find(
					(mailbox) => mailbox.fullPath.toUpperCase() === "INBOX",
				);
				await saveBatch();
				if (!inbox) continue;
				const threadPath = { mailboxId: inbox.mailboxId };
				const threads = await json<RemitImapThreadSearchResponse>(
					`/mailboxes/${encodeURIComponent(inbox.mailboxId)}/threads?order=desc`,
				);
				client.setQueryData(
					threadOperationsListThreadsQueryKey({
						baseUrl: apiBaseUrl,
						path: threadPath,
						query: { order: "desc" },
					}),
					{ pages: [threads], pageParams: [undefined] },
				);
				await saveBatch();
				for (const row of threads.items ?? []) {
					const key = messageOperationsDescribeMessageQueryKey({
						baseUrl: apiBaseUrl,
						path: { messageId: row.messageId },
					});
					if (
						count >= PERIODIC_MAX_MESSAGES ||
						seen.has(row.messageId) ||
						known.has(hashKey(key))
					)
						continue;
					seen.add(row.messageId);
					count++;
					const description = await json<RemitImapDescribeMessageResponse>(
						`/messages/${encodeURIComponent(row.messageId)}`,
					);
					const part = pickRenderablePart(description.bodyParts);
					if (part) {
						const url = new URL(part.contentUrl, location.origin);
						if (
							url.origin !== location.origin ||
							!url.pathname.startsWith("/content/") ||
							/\/exports?(?:\/|$)/i.test(url.pathname)
						)
							throw new Error(
								"Background refresh only admits same-origin mail parts",
							);
						const response = await budget.fetch(url.href);
						if (response.headers.get(PARTITION_HEADER) !== partition.key)
							throw new PartitionMismatch();
						const mime = part.kind === "html" ? "text/html" : "text/plain";
						if (!(await admitContent(response, mime, partition)))
							throw new Error("Background mail part admission refused");
						const cacheKey = `${url.origin}${url.pathname}`;
						await commitOffline(partition, async () => {
							budget.check();
							await (await caches.open(contentCacheName(partition))).put(
								cacheKey,
								response,
							);
							await writeOfflineRecord(
								`part:${partition.generation}:${cacheKey}`,
								{ mime, savedAt: Date.now() },
							);
						});
					}
					client.setQueryData(key, description);
					await saveBatch();
				}
				await saveBatch();
			}
			await saveBatch();
			await commitOffline(partition, () =>
				writeOfflineRecord(
					statusKey,
					status?.warning ? { warning: status.warning } : undefined,
				),
			);
		})().catch(async (error: unknown) => {
			if (error instanceof OfflineUnavailableError) return;
			if (error instanceof PartitionMismatch) {
				await commitOffline(partition, async () => {
					await writeOfflineRecord(stagingKey(partition), undefined);
					await writeOfflineRecord("periodic:config", undefined);
					await writeOfflineRecord(statusKey, {
						warning: "Periodic partition provenance changed",
					});
				});
				await registration.periodicSync
					?.unregister(PERIODIC_TAG)
					.catch(() => {});
				return;
			}
			if (error instanceof RunLimit || budget.controller.signal.aborted) return;
			const needsLogin = error instanceof SessionRequired;
			const attempts = (status?.attempts ?? 0) + 1;
			await commitOffline(partition, () =>
				writeOfflineRecord(statusKey, {
					needsLogin,
					warning: status?.warning,
					attempts,
					nextAttempt: Date.now() + DAILY_INTERVAL * 2 ** (attempts - 1),
					...(!(error instanceof TransportFailure) && !needsLogin
						? { warning: "Periodic download refresh failed" }
						: {}),
				} satisfies PeriodicStatus),
			);
			if (needsLogin || attempts >= 10)
				await registration.periodicSync?.unregister(PERIODIC_TAG);
		});
	} finally {
		budget.close();
		client.clear();
	}
}

/** Route unexpected storage/runtime failures to the worker's reporter bridge. */
export async function refreshPeriodicDownloads(
	registration: PeriodicRegistration,
	report: (error: unknown) => Promise<void>,
): Promise<void> {
	await runPeriodicRefresh(registration).catch(async (error: unknown) => {
		if (!(error instanceof OfflineUnavailableError)) await report(error);
	});
}
