import assert from "node:assert/strict";
import { type TestContext, test } from "node:test";
import type { BroadcastChannel } from "node:worker_threads";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { OfflineRuntime } from "./offline-runtime";
import {
	admitContent,
	mergePersistedQueries,
	OFFLINE_FORMAT,
	type Partition,
	retainedReadingQuery,
} from "./offline-store";

function stubBrowserProperty(
	t: TestContext,
	object: object,
	name: string,
	value: unknown,
) {
	const previous = Object.getOwnPropertyDescriptor(object, name);
	Object.defineProperty(object, name, { configurable: true, value });
	t.after(() => {
		if (previous) Object.defineProperty(object, name, previous);
		else Reflect.deleteProperty(object, name);
	});
}

function pending<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

function createRuntime(t: TestContext) {
	const runtime = new OfflineRuntime({
		sessionUrl: "/api/session",
		reauthenticate: t.mock.fn(),
	});
	const channel: BroadcastChannel = Reflect.get(runtime, "channel");
	channel.unref();
	t.after(() => channel.close());
	stubBrowserProperty(t, navigator, "locks", {
		request: (_name: string, work: () => Promise<unknown>) => work(),
	});
	stubBrowserProperty(t, globalThis, "indexedDB", {
		open() {
			const request = {
				result: {
					close() {},
					transaction() {
						const tx = {
							oncomplete: () => {},
							objectStore: () => ({
								get(key: string) {
									const read = {
										result: key === "epoch" ? "epoch-a" : undefined,
										onsuccess: () => {},
									};
									queueMicrotask(() => read.onsuccess());
									return read;
								},
								put() {},
								delete() {},
								clear() {},
							}),
						};
						queueMicrotask(() => tx.oncomplete());
						return tx;
					},
				},
				onsuccess: () => {},
			};
			queueMicrotask(() => request.onsuccess());
			return request;
		},
	});
	return runtime;
}

test("removeDownloads resolves when periodic sync permission is prompt", async (t) => {
	const unregister = t.mock.fn(async () => {
		throw new DOMException("Permission denied", "NotAllowedError");
	});
	class Registration {
		get periodicSync() {
			return { unregister };
		}
	}
	const query = t.mock.fn(async () => ({ state: "prompt" }));
	stubBrowserProperty(t, navigator, "permissions", { query });
	stubBrowserProperty(t, navigator, "serviceWorker", {
		addEventListener() {},
		getRegistration: async () => new Registration(),
	});
	stubBrowserProperty(t, globalThis, "ServiceWorkerRegistration", Registration);
	stubBrowserProperty(t, globalThis, "caches", { keys: async () => [] });

	await createRuntime(t).removeDownloads();
	assert.equal(query.mock.callCount(), 1);
	assert.equal(unregister.mock.callCount(), 0);
});

test("online during boot runs a fresh check after the boot check settles", async (t) => {
	stubBrowserProperty(t, navigator, "storage", {
		persisted: async () => false,
		estimate: async () => ({}),
	});
	const runtime = createRuntime(t);
	const report = t.mock.method(runtime, "report", () => {});
	const bootStarted = pending<void>();
	const reconnectStarted = pending<void>();
	const endBoot = pending<void>();
	const endReconnect = pending<void>();
	const failure = new Error("Boot fetch failed");
	const fetchSession = t.mock.method(globalThis, "fetch", async () => {
		reconnectStarted.resolve();
		await endReconnect.promise;
		return new Response(null, { status: 401 });
	});
	fetchSession.mock.mockImplementationOnce(async () => {
		bootStarted.resolve();
		await endBoot.promise;
		throw failure;
	});

	const startup = runtime.start(new QueryClient());
	await bootStarted.promise;
	window.dispatchEvent(new Event("online"));
	assert.equal(fetchSession.mock.callCount(), 1);
	endBoot.resolve();
	await startup;
	assert.deepEqual(runtime.snapshot().session, {
		status: "failed",
		error: failure,
	});
	assert.equal(report.mock.callCount(), 1);
	await reconnectStarted.promise;
	const verification = runtime.verify();
	endReconnect.resolve();
	assert.equal(await verification, false);
	assert.equal(fetchSession.mock.callCount(), 2);
	assert.deepEqual(runtime.snapshot().session, { status: "signedOut" });
});

const partition: Partition = {
	key: "tenant-a",
	generation: "generation-a",
	epoch: "epoch-a",
	format: OFFLINE_FORMAT,
};
const response = (
	body = "mail",
	mime = "text/plain",
	headers: Record<string, string> = {},
) =>
	new Response(body, {
		headers: {
			"content-type": mime,
			"x-remit-partition": partition.key,
			...headers,
		},
	});

test("content admission preserves legitimate HTML but refuses errors, wrong MIME, tenant, auth, shell, redirects and no-store", async () => {
	assert.equal(
		await admitContent(
			response("<p>mail</p>", "text/html; charset=utf-8"),
			"text/html",
			partition,
		),
		true,
	);
	for (const candidate of [
		new Response("pending", { status: 202 }),
		new Response("error", { status: 500 }),
		response("login", "text/html"),
		response("mail", "text/plain", { "cache-control": "private, no-store" }),
		response("mail", "text/plain", { "x-remit-partition": "other" }),
	])
		assert.equal(await admitContent(candidate, "text/plain", partition), false);
	assert.equal(
		await admitContent(
			response('<div id="root"></div>', "text/html"),
			"text/html",
			partition,
		),
		false,
	);
	for (const type of ["opaque", "opaqueredirect", "error"]) {
		const candidate = response();
		Object.defineProperty(candidate, "type", { value: type });
		assert.equal(await admitContent(candidate, "text/plain", partition), false);
	}
	const redirected = response();
	Object.defineProperty(redirected, "redirected", { value: true });
	assert.equal(await admitContent(redirected, "text/plain", partition), false);
});

test("retention admits reading data and excludes configuration, credentials, exports and drafts", () => {
	for (const id of [
		"messageOperationsDescribeMessage",
		"threadDetailOperationsListThreadMessages",
		"unifiedThreadOperationsListAllThreads",
		"mailboxOperationsListMailboxes",
	])
		assert.equal(retainedReadingQuery({ queryKey: [{ _id: id }] }), true);
	for (const id of [
		"configOperationsGetConfig",
		"outboxDetailOperationsGetOutboxMessage",
		"peopleOperationsListPeople",
		"configOperationsExportConfig",
	])
		assert.equal(retainedReadingQuery({ queryKey: [{ _id: id }] }), false);
	assert.equal(
		retainedReadingQuery({
			queryKey: [
				{
					_id: "messageOperationsDescribeMessage",
					headers: { Authorization: "secret" },
				},
			],
		}),
		false,
	);
	assert.equal(retainedReadingQuery({ queryKey: ["auth"] }), false);
});

test("retained snapshots merge page replacements and errors without overwriting newer descriptors", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const descriptor = [
		{ _id: "messageOperationsDescribeMessage", path: { messageId: "old" } },
	];
	const list = [{ _id: "unifiedThreadOperationsListAllThreads" }];
	const snapshot = (): PersistedClient => ({
		buster: String(OFFLINE_FORMAT),
		timestamp: Date.now(),
		clientState: dehydrate(client, {
			shouldDehydrateMutation: () => false,
			shouldDehydrateQuery: (query) =>
				query.state.status === "success" && retainedReadingQuery(query),
		}),
	});
	client.setQueryData(descriptor, "old mail", { updatedAt: 100 });
	client.setQueryData(list, ["old"], { updatedAt: 100 });
	const first = mergePersistedQueries(undefined, snapshot());
	client.clear();
	client.setQueryData(list, ["new page"], { updatedAt: 200 });
	let merged = mergePersistedQueries(first, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => JSON.stringify(query.queryKey) === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	assert.deepEqual(
		merged.clientState.queries.find(
			(query) => JSON.stringify(query.queryKey) === JSON.stringify(list),
		)?.state.data,
		["new page"],
	);
	client.setQueryData(descriptor, "stale tab", { updatedAt: 50 });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	client
		.getQueryCache()
		.find({ queryKey: descriptor })!
		.setState({ status: "error", error: new Error("Offline") });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	client.setQueryData(descriptor, "newly refreshed", { updatedAt: 300 });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"newly refreshed",
	);
	client.clear();
});
