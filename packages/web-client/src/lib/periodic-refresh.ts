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
	readMailPart,
	requirePartition,
	saveMailPart,
	writeOfflineRecord,
} from "./offline-store";
import {
	commitPeriodicRefresh,
	DAILY_INTERVAL,
	type PeriodicConfig,
	type PeriodicRegistration,
	PeriodicUnregisterError,
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
export const PERIODIC_MAX_MESSAGES = 20;
export class RunLimit extends Error {}
export class OversizedBody extends RunLimit {}
class SessionRequired extends Error {}
class SignedLinkExpired extends Error {}
class BodyUnavailable extends Error {}
class PartitionMismatch extends Error {}
class TransportFailure extends Error {}
class ResponseFailure extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
	}
}

/** Counts streamed bytes, including session and metadata, and aborts slow bodies. */
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
			throw new ResponseFailure("Periodic refresh requires same-origin URLs");
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
			throw new ResponseFailure(
				`Periodic refresh received HTTP ${response.status}`,
				response.status,
			);
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
			throw new ResponseFailure("Periodic refresh expected JSON");
		}

		return this.read(response, kind);
	}

	async read(
		response: Response,
		kind: "session" | "api" | "body",
	): Promise<Response> {
		const reader = response.body?.getReader();
		const chunks: Uint8Array<ArrayBuffer>[] = [];
		let streamed = 0;
		try {
			while (reader) {
				const { value, done } = await reader.read().catch((cause: unknown) => {
					this.check();
					throw new TransportFailure("Background body transport failed", {
						cause,
					});
				});
				this.check();
				if (done) break;
				streamed += value.byteLength;
				this.bytes += value.byteLength;
				if (this.bytes > PERIODIC_MAX_BYTES) {
					if (kind === "body" && streamed > PERIODIC_MAX_BYTES)
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
	const commit = <T>(work: () => Promise<T>): Promise<T> =>
		commitPeriodicRefresh(config, work);
	// A newer foreground verification can supersede a failed session or retry.
	// It leaves valid downloads for this binding free to finish.
	const commitStatus = (work: (current: PeriodicConfig) => Promise<void>) =>
		commitPeriodicRefresh(config, async (current) => {
			if (current.verification === verification) await work(current);
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
		if (!client.getQueryCache().getAll().length && !inboxHeads.length) return;
		await commit(async () => {
			const key = `queries:${partition.generation}`;
			const previous = await offlineRecord<PersistedClient>(key);
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
			await writeOfflineRecord(
				key,
				mergePersistedQueries(previous, {
					timestamp: Date.now(),
					buster: String(OFFLINE_FORMAT),
					clientState: dehydrate(client),
				}),
			);
			if (oversizedPartKey) await writeOfflineRecord(oversizedPartKey, true);
		});
	};

	const downloadBody = async (part: PickedBodyPart | null) => {
		if (!part) return false;
		const { contentUrl, kind, sizeOctets } = part;
		const mime = kind === "html" ? "text/html" : "text/plain";
		const canonical = mailPartCacheKey(contentUrl);
		const oversizeKey = `periodic:oversize:${partition.generation}:${canonical}`;
		if (await commit(() => readMailPart(partition, contentUrl, mime)))
			return true;
		if (
			(sizeOctets ?? 0) > PERIODIC_MAX_BYTES ||
			(await offlineRecord<boolean>(oversizeKey))
		)
			return false;

		const response = await budget
			.fetch(contentUrl, "body")
			.catch((error: unknown) => {
				if (error instanceof OversizedBody) oversizedPartKey = oversizeKey;
				if (error instanceof BodyUnavailable) return;
				throw error;
			});
		if (!response) return false;
		if (
			!(await saveMailPart(partition, contentUrl, mime, response, (work) =>
				commit(async () => {
					budget.check();
					await work();
				}),
			))
		)
			throw new ResponseFailure("Periodic refresh rejected a mail body");
		return true;
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
			throw new ResponseFailure("Periodic refresh received an invalid session");
		if (session.partitionKey !== partition.key) throw new PartitionMismatch();

		const previous = await offlineRecord<PersistedClient>(
			`queries:${partition.generation}`,
		);
		const known = new Map(
			previous?.clientState.queries
				.filter((query) => query.state.status === "success")
				.map((query) => [query.queryHash, query.state]),
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
				if (seen.has(messageId)) continue;
				seen.add(messageId);
				const path = { messageId };
				const key = messageOperationsDescribeMessageQueryKey({
					client: api,
					path,
				});
				const describe = async () => {
					const result = await messageOperationsDescribeMessage({
						...get,
						path,
					}).catch((error: unknown) => {
						if (error instanceof ResponseFailure && error.status === 404)
							return;
						throw error;
					});
					if (result) return { data: result.data, dataUpdatedAt: Date.now() };
				};
				const saved = known.get(hashKey(key));
				const retained = saved?.data as
					| RemitImapDescribeMessageResponse
					| undefined;
				const cachedPart = retained && pickRenderablePart(retained.bodyParts);
				if (
					cachedPart &&
					(await commit(() =>
						readMailPart(
							partition,
							cachedPart.contentUrl,
							cachedPart.kind === "html" ? "text/html" : "text/plain",
						),
					))
				)
					continue;
				if (count >= PERIODIC_MAX_MESSAGES) continue;
				count++;
				let description = await describe();
				if (!description) continue;
				let downloaded: boolean;
				try {
					downloaded = await downloadBody(
						pickRenderablePart(description.data.bodyParts),
					);
				} catch (error) {
					if (!(error instanceof SignedLinkExpired)) throw error;
					description = await describe();
					if (!description) continue;
					downloaded = await downloadBody(
						pickRenderablePart(description.data.bodyParts),
					).catch((retryError: unknown) => {
						if (retryError instanceof SignedLinkExpired) return false;
						throw retryError;
					});
				}
				if (!downloaded) continue;
				client.setQueryData(key, description.data, {
					updatedAt: description.dataUpdatedAt,
				});
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
			await commitStatus(async () => {
				await writeOfflineRecord(
					periodicWarningKey(partition),
					"Periodic partition provenance changed",
				);
				await stopPeriodicRefresh(registration, true);
			});
			return;
		}

		const result = await flush().then(
			() => outcome,
			(error: unknown) => ({ ok: false, error }) as const,
		);
		if (result.ok) {
			await commitStatus((current) =>
				writePeriodicStatus(current, { kind: "ready" }),
			);
			return;
		}

		const { error } = result;
		if (error instanceof OfflineUnavailableError || error instanceof RunLimit)
			return;
		await commitStatus(async (current) => {
			if (error instanceof SessionRequired) {
				await writePeriodicStatus(current, { kind: "login-required" });
				await stopPeriodicRefresh(registration, false);
				return;
			}
			const attempts =
				(current.status.kind === "retry" ? current.status.attempts : 0) + 1;
			await writePeriodicStatus(current, {
				kind: "retry",
				attempts,
				nextAttempt: Date.now() + DAILY_INTERVAL * 2 ** (attempts - 1),
			});
			if (!(error instanceof TransportFailure))
				await writeOfflineRecord(
					periodicWarningKey(partition),
					periodicFailureWarning(error),
				);
			if (attempts >= 10) await stopPeriodicRefresh(registration, false);
		});
	} finally {
		budget.close();
		client.clear();
	}
}

function periodicFailureWarning(error: unknown): string {
	if (
		error instanceof PeriodicUnregisterError ||
		error instanceof ResponseFailure
	)
		return error.message;
	if (error instanceof SyntaxError)
		return "Periodic refresh received malformed JSON";
	if (error instanceof DOMException && error.name === "QuotaExceededError")
		return "Periodic refresh exceeded offline storage quota";
	return "Periodic refresh could not finish saving downloads";
}

export async function refreshPeriodicDownloads(
	registration: PeriodicRegistration,
): Promise<void> {
	const config = await readPeriodicConfig();
	if (!config) return;
	try {
		await runPeriodicRefresh(config, registration);
	} catch (error) {
		if (error instanceof OfflineUnavailableError) return;
		const record = () =>
			writeOfflineRecord(
				periodicWarningKey(config.partition),
				periodicFailureWarning(error),
			);
		await (error instanceof PeriodicUnregisterError
			? commitOffline(config.partition, record)
			: commitPeriodicRefresh(config, record)
		).catch((failure: unknown) => {
			if (!(failure instanceof OfflineUnavailableError)) throw failure;
		});
	}
}
