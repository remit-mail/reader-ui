import {
	mailboxOperationsListMailboxesQueryKey,
	messageOperationsDescribeMessageQueryKey,
	threadOperationsListThreadsQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { createClient } from "@remit/api-http-client/client/index.ts";
import {
	configOperationsGetConfig,
	mailboxOperationsListMailboxes,
	messageOperationsDescribeMessage,
	threadOperationsListThreads,
} from "@remit/api-http-client/sdk.gen.ts";
import type { RemitImapDescribeMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { dehydrate, hashKey, QueryClient } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import {
	BODY_FAILURE_REASON_HEADER,
	classifyBodyFetchFailure,
	pickRenderablePart,
} from "./message-body-source";
import { OfflineUnavailableError } from "./offline-error";
import { mergePersistedQueries } from "./offline-queries";
import {
	admitContent,
	contentCacheName,
	mailPartCacheKey,
	OFFLINE_FORMAT,
	offlineRecord,
	PARTITION_HEADER,
	readMailPart,
	requirePartition,
	writeOfflineRecord,
} from "./offline-store";
import {
	commitPeriodicRefresh,
	DAILY_INTERVAL,
	type PeriodicConfig,
	type PeriodicRegistration,
	periodicWarningKey,
	readPeriodicConfig,
	stopPeriodicRefresh,
	writePeriodicStatus,
} from "./periodic-registration";
import {
	type InboxHead,
	type MailboxPages,
	mergeInboxHead,
} from "./thread-list-cache";

export const PERIODIC_MAX_BYTES = 10 * 1024 * 1024;
export const PERIODIC_MAX_MS = 30_000;
const MAX_BODIES_PER_RUN = 20;
const MAX_BODIES_PER_ACCOUNT = 5;
export class RunLimit extends Error {}
export class OversizedBody extends RunLimit {}
class SessionRequired extends Error {}
class ProvenanceFailure extends Error {}
class PartitionMismatch extends ProvenanceFailure {}
class TransportFailure extends Error {}
class ResponseFailure extends Error {}

export class PeriodicBudget {
	readonly controller = new AbortController();
	private bytes = 0;
	private readonly timer = setTimeout(
		() => this.controller.abort(),
		PERIODIC_MAX_MS,
	);

	constructor(
		private readonly partitionKey: string,
		private readonly started = Date.now(),
	) {}

	check(now = Date.now()): void {
		if (this.controller.signal.aborted || now - this.started >= PERIODIC_MAX_MS)
			throw new RunLimit();
	}

	checkNext(): void {
		this.check();
		if (this.bytes >= PERIODIC_MAX_BYTES) throw new RunLimit();
	}

	close(): void {
		clearTimeout(this.timer);
	}

	async fetch(
		input: RequestInfo | URL,
		kind: "session" | "api" | "body",
	): Promise<Response> {
		this.checkNext();
		const request = input instanceof Request ? input : undefined;
		const target = new URL(request?.url ?? String(input), location.origin);
		if (target.origin !== location.origin)
			throw new ProvenanceFailure("Periodic refresh requires same-origin URLs");
		const response = await fetch(target, {
			headers: request?.headers,
			credentials: "same-origin",
			redirect: "manual",
			cache: "no-store",
			signal:
				kind === "session"
					? AbortSignal.any([this.controller.signal, AbortSignal.timeout(5000)])
					: this.controller.signal,
		}).catch((cause: unknown) => {
			this.check();
			throw new TransportFailure("Periodic refresh transport failed", {
				cause,
			});
		});
		if (
			response.type === "opaqueredirect" ||
			response.redirected ||
			(response.status >= 300 && response.status < 400) ||
			(kind === "session" &&
				(response.status === 401 || response.status === 403)) ||
			(kind === "api" && response.status === 401) ||
			(kind === "body" &&
				classifyBodyFetchFailure(
					response.status,
					response.headers.get(BODY_FAILURE_REASON_HEADER),
				) === "auth")
		) {
			await response.body?.cancel();
			throw new SessionRequired();
		}
		if (response.status !== 200) {
			await response.body?.cancel();
			throw new ResponseFailure(
				`Periodic refresh received HTTP ${response.status}`,
			);
		}
		if (
			!["basic", "cors", "default"].includes(response.type) ||
			(kind !== "body" &&
				!response.headers.get("content-type")?.startsWith("application/json"))
		) {
			await response.body?.cancel();
			throw new ProvenanceFailure(
				"Periodic refresh received an unexpected response",
			);
		}
		if (
			kind !== "session" &&
			response.headers.get(PARTITION_HEADER) !== this.partitionKey
		) {
			await response.body?.cancel();
			throw new PartitionMismatch("Periodic partition provenance changed");
		}
		return this.read(response, kind === "body");
	}

	async read(response: Response, body = false): Promise<Response> {
		const reader = response.body?.getReader();
		const chunks: Uint8Array<ArrayBuffer>[] = [];
		let size = 0;
		try {
			while (reader) {
				const { value, done } = await reader.read().catch((cause: unknown) => {
					this.check();
					throw new TransportFailure("Periodic refresh stream failed", {
						cause,
					});
				});
				this.check();
				if (done) break;
				size += value.byteLength;
				this.bytes += value.byteLength;
				if (body && size > PERIODIC_MAX_BYTES) throw new OversizedBody();
				if (this.bytes > PERIODIC_MAX_BYTES) throw new RunLimit();
				chunks.push(value);
			}
		} finally {
			if (reader) {
				// An errored stream rejects cancellation with the original read error.
				await reader.cancel().catch(() => undefined);
				reader.releaseLock();
			}
		}
		return new Response(new Blob(chunks), {
			status: response.status,
			headers: response.headers,
		});
	}
}

function skipResponseFailure(error: unknown): undefined {
	if (error instanceof ResponseFailure || error instanceof SyntaxError) return;
	throw error;
}

async function runPeriodicRefresh(
	config: PeriodicConfig,
	registration: PeriodicRegistration,
): Promise<void> {
	const { partition, apiBaseUrl, status, verification } = config;
	if (
		status.kind === "login-required" ||
		(status.kind === "retry" &&
			(status.attempts >= 10 || status.nextAttempt > Date.now()))
	)
		return;

	const budget = new PeriodicBudget(partition.key);
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const api = createClient({
		baseUrl: apiBaseUrl,
		fetch: (request) => budget.fetch(request, "api"),
	});
	// Query keys use the same client configuration as the foreground.
	const get = {
		client: api,
		baseUrl: new URL(apiBaseUrl, location.origin).href.replace(/\/$/, ""),
		throwOnError: true,
	} as const;
	const queriesKey = `queries:${partition.generation}`;
	const indexKey = `periodic:account-index:${partition.generation}`;
	const oversizedKey = `periodic:oversized:${partition.generation}`;
	const oversized = new Set<string>();
	const bodies = new Map<string, Response>();
	const inboxHeads: InboxHead[] = [];
	let nextIndex: number | undefined;

	const collect = async () => {
		await requirePartition(partition);
		const session = await budget
			.fetch(config.sessionEndpoint, "session")
			.then((response) => response.json());
		if (typeof session?.partitionKey !== "string" || !session.partitionKey)
			throw new ProvenanceFailure(
				"Periodic refresh received an invalid session",
			);
		if (session.partitionKey !== partition.key)
			throw new PartitionMismatch("Periodic partition provenance changed");

		const {
			data: { accounts },
		} = await configOperationsGetConfig(get);
		if (!accounts.length) return;
		const start =
			((await offlineRecord<number>(indexKey)) ?? 0) % accounts.length;
		const tooLarge = new Set(await offlineRecord<string[]>(oversizedKey));
		const previous = await offlineRecord<PersistedClient>(queriesKey);
		const saved = new Map(
			previous?.clientState.queries.map((query) => [
				query.queryHash,
				query.state.data,
			]),
		);
		const seen = new Set<string>();

		for (let offset = 0; offset < accounts.length; offset++) {
			budget.checkNext();
			const index = (start + offset) % accounts.length;
			const account = accounts[index];
			nextIndex = (index + 1) % accounts.length;
			const mailboxId = account.folderAppointments.find(
				(appointment) => appointment.role === "Inbox",
			)?.mailboxId;
			if (!mailboxId) continue;
			const path = { accountId: account.accountId };
			const mailboxes = await mailboxOperationsListMailboxes({
				...get,
				path,
			}).catch(skipResponseFailure);
			if (!mailboxes) continue;
			client.setQueryData(
				mailboxOperationsListMailboxesQueryKey({ client: api, path }),
				mailboxes.data,
			);
			const options = {
				path: { mailboxId },
				query: { order: "desc" },
			} as const;
			const threads = await threadOperationsListThreads({
				...get,
				...options,
			}).catch(skipResponseFailure);
			if (!threads) continue;
			inboxHeads.push({
				key: threadOperationsListThreadsQueryKey({ ...options, client: api }),
				page: threads.data,
				updatedAt: Date.now(),
			});

			let downloaded = 0;
			for (const { messageId } of threads.data.items ?? []) {
				if (seen.has(messageId)) continue;
				seen.add(messageId);
				const path = { messageId };
				const key = messageOperationsDescribeMessageQueryKey({
					client: api,
					path,
				});
				const cached = saved.get(hashKey(key)) as
					| RemitImapDescribeMessageResponse
					| undefined;
				const cachedPart = cached && pickRenderablePart(cached.bodyParts);
				if (
					cachedPart &&
					(await readMailPart(
						partition,
						mailPartCacheKey(cachedPart.contentUrl),
						cachedPart.kind === "html" ? "text/html" : "text/plain",
					))
				)
					continue;

				const description = await messageOperationsDescribeMessage({
					...get,
					path,
				}).catch(skipResponseFailure);
				if (!description) continue;
				const updatedAt = Date.now();
				const part = pickRenderablePart(description.data.bodyParts);
				if (!part) continue;
				const { contentUrl } = part;
				const cacheKey = mailPartCacheKey(contentUrl);
				const mime = part.kind === "html" ? "text/html" : "text/plain";
				if (
					!bodies.has(cacheKey) &&
					!(await readMailPart(partition, cacheKey, mime))
				) {
					if (tooLarge.has(cacheKey) || oversized.has(cacheKey)) continue;
					if ((part.sizeOctets ?? 0) > PERIODIC_MAX_BYTES) {
						oversized.add(cacheKey);
						continue;
					}
					const response = await budget
						.fetch(contentUrl, "body")
						.catch((error: unknown) => {
							if (error instanceof OversizedBody) oversized.add(cacheKey);
							return skipResponseFailure(error);
						});
					if (!response || !(await admitContent(response, mime, partition)))
						continue;
					budget.check();
					bodies.set(cacheKey, response);
					downloaded++;
				}
				client.setQueryData(key, description.data, { updatedAt });
				if (bodies.size === MAX_BODIES_PER_RUN) return;
				if (downloaded === MAX_BODIES_PER_ACCOUNT) break;
			}
		}
		// After a full sweep, give the next account the first turn.
		nextIndex = (start + 1) % accounts.length;
	};

	try {
		const failure = await collect().then(
			() => undefined,
			(error: unknown) => error,
		);
		if (failure instanceof OfflineUnavailableError) return;
		await commitPeriodicRefresh(config, async (current) => {
			const stillVerified = current.verification === verification;
			if (failure instanceof PartitionMismatch) {
				if (stillVerified) {
					await writeOfflineRecord(
						periodicWarningKey(partition),
						failure.message,
					);
					await stopPeriodicRefresh(registration, current, true);
				}
				return;
			}
			if (stillVerified && failure instanceof SessionRequired) {
				await writePeriodicStatus(current, { kind: "login-required" });
				await stopPeriodicRefresh(registration, current);
			}
			if (nextIndex !== undefined) {
				const previous = await offlineRecord<PersistedClient>(queriesKey);
				for (const head of inboxHeads) {
					const queryHash = hashKey(head.key);
					const saved = previous?.clientState.queries.find(
						(query) => query.queryHash === queryHash,
					);
					if (saved && saved.state.dataUpdatedAt >= head.updatedAt) continue;
					const pages = mergeInboxHead(
						saved?.state.data as MailboxPages | undefined,
						head.page,
					);
					if (pages)
						client.setQueryData(head.key, pages, { updatedAt: head.updatedAt });
				}
				if (bodies.size) {
					const cache = await caches.open(contentCacheName(partition));
					for (const [key, body] of bodies) await cache.put(key, body);
				}
				if (oversized.size) {
					const known = (await offlineRecord<string[]>(oversizedKey)) ?? [];
					await writeOfflineRecord(oversizedKey, [
						...new Set([...known, ...oversized]),
					]);
				}
				if (client.getQueryCache().getAll().length) {
					await writeOfflineRecord(
						queriesKey,
						mergePersistedQueries(previous, {
							timestamp: Date.now(),
							buster: String(OFFLINE_FORMAT),
							clientState: dehydrate(client),
						}),
					);
				}
				await writeOfflineRecord(indexKey, nextIndex);
			}
			if (!stillVerified || failure instanceof SessionRequired) return;
			if (!failure || failure instanceof RunLimit) {
				if (current.status.kind === "retry")
					await writePeriodicStatus(current, { kind: "ready" });
				return;
			}
			const attempts =
				(current.status.kind === "retry" ? current.status.attempts : 0) + 1;
			await writePeriodicStatus(current, {
				kind: "retry",
				attempts,
				nextAttempt: Date.now() + DAILY_INTERVAL * 2 ** (attempts - 1),
			});
			if (!(failure instanceof TransportFailure)) {
				const warning =
					failure instanceof Error ? failure.message : String(failure);
				await writeOfflineRecord(periodicWarningKey(partition), warning);
			}
			if (attempts >= 10) await stopPeriodicRefresh(registration, current);
		});
	} finally {
		budget.close();
		client.clear();
	}
}

export async function refreshPeriodicDownloads(
	registration: PeriodicRegistration,
): Promise<void> {
	const config = await readPeriodicConfig();
	if (!config) return;
	try {
		await runPeriodicRefresh(config, registration);
	} catch (error) {
		if (!(error instanceof OfflineUnavailableError)) throw error;
	}
}
