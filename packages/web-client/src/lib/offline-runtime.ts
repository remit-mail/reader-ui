import { threadDetailOperationsListThreadMessagesQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { ThreadDetailOperationsListThreadMessagesResponse } from "@remit/api-http-client/types.gen.ts";
import {
	onlineManager,
	type Query,
	type QueryClient,
} from "@tanstack/react-query";
import type {
	PersistedClient,
	Persister,
} from "@tanstack/react-query-persist-client";
import { externalImageBytes, requestExternalImage } from "./external-image";
import { OFFLINE_ERROR_EVENT, OfflineUnavailableError } from "./offline-error";
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
	storageLock,
	wipeOffline,
	writeOfflineRecord,
} from "./offline-store";
import { isUpdatePrepared, registerUpdateBlocker } from "./pwa-update";
import { reportSignedOut, resetSignedOut } from "./signed-out";

export interface OfflineOptions {
	/** Fresh authenticated no-store request. null means authentication is required;
	 * reject only for transport/server failures. Never use a cached config as identity. */
	verifySession(): Promise<{ partitionKey: string } | null>;
	reauthenticate(): void;
}
export interface OfflineState {
	partition?: Partition;
	verified: boolean;
	usage?: number;
	quota?: number;
	persistent?: boolean;
}
const threadLists = new Set([
	"threadOperationsListThreads",
	"threadOperationsSearchThreads",
	"unifiedThreadOperationsListAllThreads",
]);

const readingQueryKey = ({ queryKey: [key] }: Pick<Query, "queryKey">) =>
	key &&
	typeof key === "object" &&
	"_id" in key &&
	!("headers" in key) &&
	!("body" in key)
		? key
		: undefined;

/** Explicit reading allowlist; settings, auth, drafts and mutations never persist. */
export const retainedReadingQuery = (
	query: Pick<Query, "queryKey">,
): boolean => {
	const key = readingQueryKey(query);
	return (
		key !== undefined &&
		(threadLists.has(String(key._id)) ||
			key._id === "mailboxOperationsListMailboxes" ||
			key._id === "messageOperationsDescribeMessage" ||
			key._id === "threadDetailOperationsListThreadMessages")
	);
};

/** Preserve the last successful descriptor even when a list page or error replaces it. */
export const mergePersistedQueries = (
	previous: PersistedClient | undefined,
	client: PersistedClient,
): PersistedClient => {
	const queries = new Map(
		previous?.clientState.queries.map((query) => [query.queryHash, query]),
	);
	for (const query of client.clientState.queries) {
		const existing = queries.get(query.queryHash);
		if (!existing || query.state.dataUpdatedAt >= existing.state.dataUpdatedAt)
			queries.set(query.queryHash, query);
	}
	return {
		...client,
		clientState: { mutations: [], queries: [...queries.values()] },
	};
};

export class OfflineRuntime {
	state: OfflineState = { verified: false };
	private listeners = new Set<() => void>();
	private channel = new BroadcastChannel("remit-offline");
	private pending = 0;
	private verifying?: Promise<boolean>;
	private starting?: Promise<void>;
	private revoked = false;
	private queryClient?: QueryClient;
	private refreshing = 0;
	private persistenceRequested = false;
	constructor(readonly options: OfflineOptions) {
		registerUpdateBlocker(
			() => this.pending > 0 || this.verifying !== undefined,
		);
		const revoked = () => {
			this.revoked = true;
			void this.revokeMemory();
		};
		this.channel.onmessage = revoked;
		navigator.serviceWorker?.addEventListener("message", (event) => {
			if (event.data?.type === "remit:offline-revoked") revoked();
		});
	}
	subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	snapshot = (): OfflineState => this.state;
	private update(patch: Partial<OfflineState>) {
		this.state = { ...this.state, ...patch };
		onlineManager.setOnline(this.state.verified && navigator.onLine);
		for (const listener of this.listeners) listener();
	}
	report = (error: unknown): void => {
		window.dispatchEvent(
			new CustomEvent(OFFLINE_ERROR_EVENT, { detail: error }),
		);
	};
	private async revokeMemory() {
		this.update({ verified: false, partition: undefined });
		await this.queryClient?.cancelQueries();
		this.queryClient?.clear();
	}
	start(queryClient: QueryClient): Promise<void> {
		this.starting ??= this.startNow(queryClient);
		return this.starting;
	}
	private async startNow(queryClient: QueryClient): Promise<void> {
		this.queryClient = queryClient;
		// Late mutation rollbacks still hold this client after a wipe. Keep its
		// cache empty until the required fresh-document navigation.
		queryClient.getQueryCache().subscribe((event) => {
			if (this.revoked && event.type === "added")
				queryClient.getQueryCache().remove(event.query);
		});
		const partition = await offlineRecord<Partition>("partition");
		if (this.revoked) return;
		if (partition && partition.format !== OFFLINE_FORMAT)
			throw new Error(
				"Offline storage format changed. Remove downloads before continuing.",
			);
		if (partition) await requirePartition(partition);
		if (this.revoked) return;
		this.update({ partition });
		await this.verify().catch(this.report);
		void this.storage(
			window.matchMedia("(display-mode: standalone)").matches,
		).catch(this.report);
		window.addEventListener("offline", () => this.update({ verified: false }));
		window.addEventListener("online", () => {
			void this.verify().catch(this.report);
		});
	}
	verify = (): Promise<boolean> => {
		this.verifying ??= this.verifyNow().finally(() => {
			this.verifying = undefined;
		});
		return this.verifying;
	};
	private async verifyNow(): Promise<boolean> {
		if (!navigator.onLine || this.revoked || isUpdatePrepared()) return false;
		const wasVerified = this.state.verified;
		this.update({ verified: false });
		const epoch = await storageLock(async () => {
			const existing = await offlineRecord<string>("epoch");
			if (existing) return existing;
			const epoch = crypto.randomUUID();
			await writeOfflineRecord("epoch", epoch);
			return epoch;
		});
		const observed = await offlineRecord<Partition>("partition");
		if (
			this.state.partition &&
			!samePartition(observed, this.state.partition)
		) {
			this.revoked = true;
			await this.revokeMemory();
			return false;
		}
		const session = await this.options.verifySession();
		if (!session || this.revoked) {
			if (!session && !this.revoked && navigator.onLine) reportSignedOut();
			return false;
		}
		const unchanged = await offlineRecord<Partition>("partition");
		if (observed && !samePartition(unchanged, observed)) return false;
		if (!session.partitionKey)
			throw new Error("Session partition key is empty");
		const previous = await offlineRecord<Partition>("partition");
		if (previous && previous.key !== session.partitionKey) {
			// A fresh document also isolates late mutation rollback callbacks that
			// still hold the old QueryClient. Never bind that client to a new tenant.
			await this.removeDownloads();
			this.options.reauthenticate();
			return false;
		}
		const partition = await storageLock(async () => {
			if ((await offlineRecord<string>("epoch")) !== epoch)
				throw new Error("Downloads were removed while verifying identity");
			const current = await offlineRecord<Partition>("partition");
			if (
				current &&
				(current.key !== session.partitionKey || current.epoch !== epoch)
			)
				throw new Error("Session changed in another tab");
			const next = current ?? {
				key: session.partitionKey,
				generation: crypto.randomUUID(),
				format: OFFLINE_FORMAT,
				epoch,
			};
			await writeOfflineRecord("partition", next);
			return next;
		});
		if (this.revoked) return false;
		this.update({ partition, verified: true });
		resetSignedOut();
		if (!wasVerified) window.dispatchEvent(new Event("remit:session-verified"));
		return true;
	}
	sessionUnverified(): void {
		this.update({ verified: false });
	}
	async removeDownloads(): Promise<void> {
		if (isUpdatePrepared())
			throw new OfflineUnavailableError(
				"App update in progress; downloads were not removed. Try again after updating.",
			);
		this.pending++;
		try {
			this.revoked = true;
			// Keep the error-banner owner mounted until the wipe commits.
			this.update({ verified: false });
			await wipeOffline();
			this.channel.postMessage("wipe");
			await this.revokeMemory();
			navigator.serviceWorker?.controller?.postMessage({
				type: "remit:offline-wipe",
			});
		} finally {
			this.pending--;
		}
	}
	async removeDownloadsAndReload(): Promise<void> {
		await this.removeDownloads();
		window.location.reload();
	}
	/** Capture the generation at request start, never at completion. */
	async authorizeNetwork(method: string): Promise<Partition> {
		const partition = this.state.partition;
		if (!partition || !this.state.verified || !navigator.onLine)
			throw new OfflineUnavailableError(
				`Session unverified: ${method} unavailable. Downloaded mail is read-only.`,
			);
		await requirePartition(partition);
		return partition;
	}
	private async commit<T>(
		partition: Partition,
		work: () => Promise<T>,
	): Promise<T> {
		try {
			return await commitOffline(partition, work);
		} catch (error) {
			this.report(error);
			if (error instanceof DOMException)
				throw new OfflineUnavailableError(error.message, error);
			throw error;
		}
	}
	async write<T>(partition: Partition, work: () => Promise<T>): Promise<T> {
		if (isUpdatePrepared())
			throw new OfflineUnavailableError(
				"App update in progress; download was not saved",
			);
		this.pending++;
		try {
			const result = await this.commit(partition, work);
			void this.storage(!this.persistenceRequested).catch(this.report);
			return result;
		} finally {
			this.pending--;
		}
	}
	persister(partition: Partition): Persister {
		return {
			persistClient: async (client) => {
				await this.write(partition, async () => {
					const previous = await offlineRecord<PersistedClient>(
						`queries:${partition.generation}`,
					);
					await writeOfflineRecord(
						`queries:${partition.generation}`,
						mergePersistedQueries(previous, client),
					);
				});
			},
			restoreClient: () =>
				commitOffline(partition, () =>
					offlineRecord<PersistedClient>(`queries:${partition.generation}`),
				),
			removeClient: () => {
				this.report(
					new Error(
						"Offline storage is incompatible or unavailable. Remove downloads explicitly to reset it.",
					),
				);
			},
		};
	}
	async content(
		url: string,
		mime: string,
		network: () => Promise<Response>,
	): Promise<Response> {
		const partition = this.state.partition;
		if (!partition)
			throw new OfflineUnavailableError("No remembered offline identity");
		const target = new URL(url, location.origin);
		if (
			target.origin !== location.origin ||
			!target.pathname.startsWith("/content/") ||
			/\/exports?(?:\/|$)/i.test(target.pathname)
		)
			throw new Error("Only same-origin mail parts can be downloaded");
		// No SW runtime caching: each tab owns a captured partition/generation.
		const cacheKey = `${target.origin}${target.pathname}`;
		const cached = await this.commit(partition, async () => {
			const saved = await offlineRecord<{ mime: string }>(
				`part:${partition.generation}:${cacheKey}`,
			);
			return saved?.mime === mime
				? (await caches.open(contentCacheName(partition))).match(cacheKey)
				: undefined;
		});
		if (cached && !this.refreshing) return cached;
		await this.authorizeNetwork("GET");
		const response = await network();
		if (await admitContent(response, mime, partition)) {
			await this.write(partition, async () => {
				await (await caches.open(contentCacheName(partition))).put(
					cacheKey,
					response.clone(),
				);
				await writeOfflineRecord(`part:${partition.generation}:${cacheKey}`, {
					mime,
					savedAt: Date.now(),
				});
			});
		} else if (response.status === 200) {
			throw new OfflineUnavailableError(
				"Mail part was not saved: unexpected MIME, tenant, redirect, HTML shell or no-store response",
			);
		}
		await requirePartition(partition);
		return response;
	}
	/** Binary records use the complete destination URL, including authorization queries. */
	async externalImage(
		proxyUrl: string,
		resolvedRemoteUrl: string,
	): Promise<Blob> {
		const partition = this.state.partition;
		if (!partition)
			throw new OfflineUnavailableError("No remembered offline identity");
		const key = `external-image:${partition.generation}:${JSON.stringify(["external-image", resolvedRemoteUrl])}`;
		const saved = await this.commit(partition, () => offlineRecord<Blob>(key));
		if (saved && !this.refreshing) return saved;
		await this.authorizeNetwork("POST");
		const bytes = await externalImageBytes(
			await requestExternalImage(proxyUrl, resolvedRemoteUrl),
			partition,
		);
		await this.write(partition, () => writeOfflineRecord(key, bytes));
		await requirePartition(partition);
		return bytes;
	}
	async storage(requestPersistence = false): Promise<void> {
		if (requestPersistence) this.persistenceRequested = true;
		const persistent = requestPersistence
			? await navigator.storage.persist()
			: await navigator.storage.persisted();
		const { usage, quota } = await navigator.storage.estimate();
		this.update({ persistent, usage, quota });
	}
	async refreshReading({
		openThreadId,
		listsVisible,
	}: {
		openThreadId?: string;
		listsVisible: boolean;
	}): Promise<void> {
		const queryClient = this.queryClient;
		if (!queryClient || !this.state.verified) return;
		const thread = openThreadId
			? threadDetailOperationsListThreadMessagesQueryKey({
					path: { threadId: openThreadId },
				})
			: undefined;
		await Promise.all([
			listsVisible &&
				queryClient.refetchQueries({
					type: "active",
					predicate: (query) => {
						const key = readingQueryKey(query);
						return (
							!!key &&
							threadLists.has(String(key._id)) &&
							(!("query" in key) ||
								(key.query as { results?: boolean } | undefined)?.results !==
									false)
						);
					},
				}),
			thread &&
				queryClient.refetchQueries({
					type: "active",
					queryKey: thread,
				}),
		]);
		if (!thread) return;
		const messageIds = new Set(
			queryClient
				.getQueryData<ThreadDetailOperationsListThreadMessagesResponse>(thread)
				?.items.map(({ messageId }) => messageId),
		);
		await queryClient.refetchQueries({
			type: "active",
			predicate: (query) => {
				const key = readingQueryKey(query);
				return (
					key?._id === "messageOperationsDescribeMessage" &&
					"path" in key &&
					messageIds.has((key.path as { messageId: string }).messageId)
				);
			},
		});
		this.refreshing++;
		try {
			await queryClient.refetchQueries({
				type: "active",
				predicate: ({ queryKey: [scope, detail, messageId, body] }) =>
					scope === "messages" &&
					detail === "detail" &&
					body === "body" &&
					typeof messageId === "string" &&
					messageIds.has(messageId),
			});
		} finally {
			this.refreshing--;
		}
	}
}
let runtime: OfflineRuntime | undefined;
export const getOfflineRuntime = (): OfflineRuntime | undefined => runtime;
export const installOfflineRuntime = (
	options: OfflineOptions,
): OfflineRuntime => {
	runtime = new OfflineRuntime(options);
	return runtime;
};
export const fetchOfflineContent = (
	url: string,
	mime: string,
	network: () => Promise<Response>,
): Promise<Response> =>
	runtime ? runtime.content(url, mime, network) : network();
export const validateNetworkPartition = async (
	response: Response,
	partition: Partition,
): Promise<void> => {
	await requirePartition(partition);
	if (response.ok && response.headers.get(PARTITION_HEADER) !== partition.key)
		throw new Error(
			"Response tenant provenance is missing or changed; nothing was saved",
		);
};
