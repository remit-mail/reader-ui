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

		return this.read(response);
	}

	async read(response: Response): Promise<Response> {
		const reader = response.body?.getReader();
		const chunks: Uint8Array<ArrayBuffer>[] = [];
		let readable = true;
		try {
			while (reader) {
				const { value, done } = await reader.read().catch((cause: unknown) => {
					readable = false;
					this.check();
					throw new TransportFailure("Background body transport failed", {
						cause,
					});
				});
				readable = !done;
				this.check();
				if (done) break;
				this.bytes += value.byteLength;
				if (this.bytes > PERIODIC_MAX_BYTES) throw new RunLimit();
				chunks.push(value);
			}
		} finally {
			if (reader) {
				// The stream can error after the last read. Preserve the run failure.
				if (readable) await reader.cancel().catch(() => undefined);
				reader.releaseLock();
			}
		}
		return new Response(new Blob(chunks), {
			status: response.status,
			headers: response.headers,
		});
	}
}

interface CandidatePosition {
	accountId: string;
	messageId?: string;
	advanceAccount?: boolean;
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
	const resumeKey = `periodic:resume:${partition.generation}`;
	let lastAttempted: CandidatePosition | undefined;
	let activeAccountId: string | undefined;
	let accountWarning: string | undefined;
	const flush = async () => {
		if (
			!lastAttempted &&
			!accountWarning &&
			!client.getQueryCache().getAll().length &&
			!inboxHeads.length
		)
			return;
		await commit(async () => {
			if (lastAttempted) await writeOfflineRecord(resumeKey, lastAttempted);
			if (accountWarning)
				await writeOfflineRecord(periodicWarningKey(partition), accountWarning);
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
		});
	};

	const downloadBody = async (part: PickedBodyPart | null) => {
		if (!part) return false;
		const { contentUrl, kind, sizeOctets } = part;
		const mime = kind === "html" ? "text/html" : "text/plain";
		if (await commit(() => readMailPart(partition, contentUrl, mime)))
			return true;
		if ((sizeOctets ?? 0) > PERIODIC_MAX_BYTES) return false;

		const response = await budget
			.fetch(contentUrl, "body")
			.catch((error: unknown) => {
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
		const resume = await offlineRecord<CandidatePosition>(resumeKey);
		const accounts = configData.accounts;
		const previousAccount = accounts.findIndex(
			(account) => account.accountId === resume?.accountId,
		);
		const start =
			previousAccount < 0
				? 0
				: previousAccount + Number(!!resume?.advanceAccount);
		const seen = new Set<string>();
		let count = 0;
		const attempt = async (
			accountId: string,
			rows: readonly { messageId: string }[],
		) => {
			for (const { messageId } of rows) {
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
				if (count >= PERIODIC_MAX_MESSAGES) return;
				count++;
				lastAttempted = { accountId, messageId };
				for (let pass = 0; pass < 2; pass++) {
					const description = await describe();
					if (!description) break;
					try {
						if (
							await downloadBody(pickRenderablePart(description.data.bodyParts))
						)
							client.setQueryData(key, description.data, {
								updatedAt: description.dataUpdatedAt,
							});
						break;
					} catch (error) {
						if (!(error instanceof SignedLinkExpired)) throw error;
					}
				}
			}
		};
		let wrapped: readonly { messageId: string }[] = [];
		for (
			let offset = 0;
			offset < accounts.length && count < PERIODIC_MAX_MESSAGES;
			offset++
		) {
			const account = accounts[(start + offset) % accounts.length];
			activeAccountId = account.accountId;
			const path = { accountId: account.accountId };
			const deferAccount = (error: unknown) => {
				if (
					!(
						error instanceof ResponseFailure ||
						error instanceof TransportFailure
					)
				)
					throw error;
				accountWarning ??= error.message;
				lastAttempted = { ...path, advanceAccount: true };
			};
			const mailboxes = await mailboxOperationsListMailboxes({ ...get, path })
				.then((result) => result.data)
				.catch(deferAccount);
			if (!mailboxes) continue;
			client.setQueryData(
				mailboxOperationsListMailboxesQueryKey({ client: api, path }),
				mailboxes,
			);
			const mailboxId = account.folderAppointments.find(
				(appointment) => appointment.role === "Inbox",
			)?.mailboxId;
			if (!mailboxId) continue;
			const options = {
				path: { mailboxId },
				query: { order: "desc" },
			} as const;
			const threads = await threadOperationsListThreads({ ...get, ...options })
				.then((result) => result.data)
				.catch(deferAccount);
			if (!threads) continue;
			inboxHeads.push({
				key: threadOperationsListThreadsQueryKey({
					...options,
					client: api,
				}),
				page: threads,
				updatedAt: Date.now(),
			});
			const rows = threads.items ?? [];
			const boundary =
				account.accountId === resume?.accountId
					? rows.findIndex(({ messageId }) => messageId === resume.messageId) +
						1
					: 0;
			if (boundary) wrapped = rows.slice(0, boundary);
			await attempt(account.accountId, rows.slice(boundary));
		}
		if (resume && wrapped.length && count < PERIODIC_MAX_MESSAGES) {
			activeAccountId = resume.accountId;
			await attempt(resume.accountId, wrapped);
		}
	};

	try {
		const outcome = await collect().then(
			() => ({ ok: true }) as const,
			(error: unknown) => ({ ok: false, error }) as const,
		);
		if (!outcome.ok && outcome.error instanceof OfflineUnavailableError) return;
		if (!outcome.ok && outcome.error instanceof PartitionMismatch) {
			let revoked = false;
			await commitStatus(async () => {
				await stopPeriodicRefresh(registration, true);
				revoked = true;
			});
			if (revoked)
				await commitOffline(partition, () =>
					writeOfflineRecord(
						periodicWarningKey(partition),
						"Periodic partition provenance changed",
					),
				);
			return;
		}

		if (!outcome.ok && outcome.error instanceof RunLimit && activeAccountId) {
			lastAttempted = {
				accountId: activeAccountId,
				messageId:
					lastAttempted?.accountId === activeAccountId
						? lastAttempted.messageId
						: undefined,
				advanceAccount: true,
			};
		}
		const flushResult = await flush().then(
			() => ({ ok: true }) as const,
			(error: unknown) => ({ ok: false, error }) as const,
		);
		if (!outcome.ok && outcome.error instanceof SessionRequired) {
			const failures = flushResult.ok ? [] : [flushResult.error];
			const report = (error: unknown) => {
				failures.push(error);
			};
			await commitStatus(async (current) => {
				await writePeriodicStatus(current, { kind: "login-required" }).catch(
					report,
				);
				await stopPeriodicRefresh(registration, false).catch(report);
			});
			if (failures.length)
				await commit(() =>
					writeOfflineRecord(
						periodicWarningKey(partition),
						failures.map(periodicFailureWarning).join(". "),
					),
				);
			return;
		}
		const result = flushResult.ok ? outcome : flushResult;
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
