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
	type PickedBodyPart,
	pickRenderablePart,
} from "./message-body-source";
import { OfflineUnavailableError } from "./offline-error";
import { mergePersistedQueries } from "./offline-queries";
import {
	commitOffline,
	mailPartCacheKey,
	OFFLINE_FORMAT,
	offlineRecord,
	PARTITION_HEADER,
	type Partition,
	readMailPart,
	requirePartition,
	samePartition,
	saveMailPart,
	writeOfflineRecord,
} from "./offline-store";
import {
	DAILY_INTERVAL,
	PERIODIC_TAG,
	type PeriodicRegistration,
} from "./periodic-registration";
import {
	type PeriodicBatch,
	stagePeriodicBatch,
	stagingKey,
} from "./periodic-staging";
import type { InboxHead } from "./thread-list-cache";

export const PERIODIC_MAX_BYTES = 10 * 1024 * 1024;
export const PERIODIC_MAX_MS = 30_000;
export const PERIODIC_MAX_MESSAGES = 20;
export interface PeriodicConfig {
	partition: Partition;
	runId?: string;
	sessionEndpoint: string;
	apiBaseUrl: string;
}
export interface PeriodicStatus {
	needsLogin?: boolean;
	attempts?: number;
	nextAttempt?: number;
}
export const periodicStatusKey = (partition: Partition): string =>
	`periodic:status:${partition.generation}`;

class RunLimit extends Error {}
class OversizedBody extends RunLimit {}
class SessionRequired extends Error {}
class SignedLinkExpired extends Error {}
class BodyUnavailable extends Error {}
class PartitionMismatch extends Error {}
class TransportFailure extends Error {}

/** Counts streamed bytes, including session and metadata, and aborts slow bodies. */
class PeriodicBudget {
	readonly controller = new AbortController();
	private bytes = 0;
	private bodyBytes = 0;
	private readonly started = Date.now();
	private readonly timer = setTimeout(
		() => this.controller.abort(),
		PERIODIC_MAX_MS,
	);

	constructor(private readonly partitionKey: string) {}

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

	async fetch(
		input: RequestInfo | URL,
		kind: "session" | "api" | "body",
	): Promise<Response> {
		this.check();
		const request = input instanceof Request ? input : undefined;
		const target = new URL(request?.url ?? String(input), location.origin);
		if (target.origin !== location.origin)
			throw new Error("Background refresh requires same-origin URLs");
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
			throw new TransportFailure("Background transport failed", { cause });
		});
		const redirected =
			response.type === "opaqueredirect" ||
			response.redirected ||
			(response.status >= 300 && response.status < 400);
		if (
			response.status !== 200 ||
			redirected ||
			!["basic", "cors", "default"].includes(response.type)
		) {
			await response.body?.cancel();
			if (kind === "body" && !redirected) {
				const reason = classifyBodyFetchFailure(
					response.status,
					response.headers.get(BODY_FAILURE_REASON_HEADER),
				);
				if (reason === "auth") throw new SessionRequired();
				if (reason === "link-expired") throw new SignedLinkExpired();
				if (reason === "not-ready" || reason === "body-missing")
					throw new BodyUnavailable();
			} else if (
				redirected ||
				response.status === 401 ||
				response.status === 403
			) {
				throw new SessionRequired();
			}
			throw new Error(`Background refresh HTTP ${response.status}`);
		}
		if (
			kind !== "session" &&
			response.headers.get(PARTITION_HEADER) !== this.partitionKey
		) {
			await response.body?.cancel();
			throw new PartitionMismatch();
		}
		if (
			kind !== "body" &&
			!response.headers.get("content-type")?.startsWith("application/json")
		) {
			await response.body?.cancel();
			throw new Error("Background refresh expected JSON");
		}

		const freshBodyBudget = kind === "body" && this.bodyBytes === 0;
		const reader = response.body?.getReader();
		const chunks: Uint8Array<ArrayBuffer>[] = [];
		let streamed = 0;
		try {
			while (reader) {
				const { value, done } = await reader.read().catch((cause: unknown) => {
					throw new TransportFailure("Background body transport failed", {
						cause,
					});
				});
				this.check();
				if (done) break;
				streamed += value.byteLength;
				this.bytes += value.byteLength;
				if (kind === "body") this.bodyBytes += value.byteLength;
				if (this.bytes > PERIODIC_MAX_BYTES) {
					// A fresh body budget includes the session and list metadata
					// the worker must read to reach the first uncached body.
					if (
						freshBodyBudget ||
						(kind === "body" && streamed > PERIODIC_MAX_BYTES)
					)
						throw new OversizedBody();
					throw new RunLimit();
				}
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

/** No retries inside a run except renewing an expired signature once. */
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
	const commit = <T>(work: () => Promise<T>): Promise<T> =>
		commitOffline(partition, async () => {
			const current = await offlineRecord<PeriodicConfig>("periodic:config");
			if (
				!current ||
				current.runId !== config.runId ||
				!samePartition(current.partition, partition)
			)
				throw new OfflineUnavailableError("Periodic refresh was disabled");
			return work();
		});
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
	const inboxHeads: InboxHead[] = [];
	let oversizedPartKey: string | undefined;
	const flush = async () => {
		const clientState = dehydrate(client);
		if (!clientState.queries.length && !inboxHeads.length) return;
		await commit(async () => {
			await stagePeriodicBatch({
				partition,
				client: {
					timestamp: Date.now(),
					buster: String(OFFLINE_FORMAT),
					clientState,
				},
				inboxHeads,
			});
			if (oversizedPartKey) await writeOfflineRecord(oversizedPartKey, true);
		});
	};

	const downloadBody = async (part: PickedBodyPart | null) => {
		if (!part) return "skipped";
		const { contentUrl, kind, sizeOctets } = part;
		const mime = kind === "html" ? "text/html" : "text/plain";
		const canonical = mailPartCacheKey(contentUrl);
		const oversizeKey = `periodic:oversize:${partition.generation}:${canonical}`;
		if (await commit(() => readMailPart(partition, contentUrl, mime)))
			return "cached";
		if (
			(sizeOctets ?? 0) > PERIODIC_MAX_BYTES ||
			(await offlineRecord<boolean>(oversizeKey))
		)
			return "skipped";

		const response = await budget
			.fetch(contentUrl, "body")
			.catch((error: unknown) => {
				if (error instanceof OversizedBody) oversizedPartKey = oversizeKey;
				if (error instanceof BodyUnavailable) return;
				throw error;
			});
		if (!response) return "skipped";
		if (
			!(await saveMailPart(partition, contentUrl, mime, response, (work) =>
				commit(async () => {
					budget.check();
					await work();
				}),
			))
		)
			throw new Error("Background mail part admission refused");
		return "saved";
	};

	const collect = async () => {
		await requirePartition(partition);
		const sessionResponse = await budget.fetch(
			config.sessionEndpoint,
			"session",
		);
		const session: unknown = await sessionResponse.json();
		if (
			!session ||
			typeof session !== "object" ||
			!("partitionKey" in session) ||
			typeof session.partitionKey !== "string" ||
			!session.partitionKey
		)
			throw new Error("Invalid background session");
		if (session.partitionKey !== partition.key) throw new PartitionMismatch();

		const previous = await offlineRecord<PersistedClient>(
			`queries:${partition.generation}`,
		);
		const staged = await offlineRecord<PeriodicBatch>(stagingKey(partition));
		const retained =
			staged && samePartition(staged.partition, partition)
				? mergePersistedQueries(previous, staged.client)
				: previous;
		const known = new Map(
			retained?.clientState.queries
				.filter((query) => query.state.status === "success")
				.map((query) => [query.queryHash, query.state.data]),
		);
		const { data: configData } = await configOperationsGetConfig(get);
		let count = 0;
		const seen = new Set<string>();
		for (const account of configData.accounts) {
			const path = { accountId: account.accountId };
			const { data: mailboxes } = await mailboxOperationsListMailboxes({
				...get,
				path,
			});
			client.setQueryData(
				mailboxOperationsListMailboxesQueryKey({ client: api, path }),
				mailboxes,
			);
			const inbox = mailboxes.items.find(
				(mailbox) => mailbox.fullPath.toUpperCase() === "INBOX",
			);
			if (!inbox) continue;
			const options = {
				path: { mailboxId: inbox.mailboxId },
				query: { order: "desc" },
			} as const;
			const { data: threads } = await threadOperationsListThreads({
				...get,
				...options,
			});
			inboxHeads.push({
				key: threadOperationsListThreadsQueryKey({
					...options,
					client: api,
				}),
				page: threads,
				updatedAt: Date.now(),
			});
			for (const { messageId } of threads.items ?? []) {
				if (count >= PERIODIC_MAX_MESSAGES || seen.has(messageId)) continue;
				seen.add(messageId);
				const path = { messageId };
				const key = messageOperationsDescribeMessageQueryKey({
					client: api,
					path,
				});
				const describe = async () =>
					(
						await messageOperationsDescribeMessage({
							...get,
							path,
						})
					).data;
				let description =
					(known.get(hashKey(key)) as
						| RemitImapDescribeMessageResponse
						| undefined) ?? (await describe());
				let outcome: Awaited<ReturnType<typeof downloadBody>>;
				try {
					outcome = await downloadBody(
						pickRenderablePart(description.bodyParts),
					);
				} catch (error) {
					if (!(error instanceof SignedLinkExpired)) throw error;
					description = await describe();
					outcome = await downloadBody(
						pickRenderablePart(description.bodyParts),
					).catch((retryError: unknown) => {
						if (retryError instanceof SignedLinkExpired) return "skipped";
						throw retryError;
					});
				}
				if (outcome === "skipped") continue;
				if (outcome === "saved") count++;
				client.setQueryData(key, description);
			}
		}
	};

	try {
		const outcome = await collect().then(
			() => ({ ok: true }) as const,
			(error: unknown) => ({ ok: false, error }) as const,
		);
		if (!outcome.ok && outcome.error instanceof OfflineUnavailableError) return;
		if (!outcome.ok && outcome.error instanceof PartitionMismatch) {
			await commit(async () => {
				await writeOfflineRecord(stagingKey(partition), undefined);
				await writeOfflineRecord("periodic:config", undefined);
				await writeOfflineRecord(
					`periodic:warning:${partition.generation}`,
					"Periodic partition provenance changed",
				);
			});
			await registration.periodicSync?.unregister(PERIODIC_TAG).catch(() => {});
			return;
		}

		await flush();
		if (outcome.ok) {
			await commit(() => writeOfflineRecord(statusKey, undefined));
			return;
		}

		const { error } = outcome;
		if (error instanceof RunLimit || budget.controller.signal.aborted) return;
		const needsLogin = error instanceof SessionRequired;
		const attempts = (status?.attempts ?? 0) + 1;
		await commit(() =>
			writeOfflineRecord(statusKey, {
				needsLogin,
				attempts,
				nextAttempt: Date.now() + DAILY_INTERVAL * 2 ** (attempts - 1),
			} satisfies PeriodicStatus),
		);
		if (!(error instanceof TransportFailure) && !needsLogin)
			await commit(() =>
				writeOfflineRecord(
					`periodic:warning:${partition.generation}`,
					"Periodic download refresh failed",
				),
			);
		if (needsLogin || attempts >= 10)
			await registration.periodicSync?.unregister(PERIODIC_TAG);
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
