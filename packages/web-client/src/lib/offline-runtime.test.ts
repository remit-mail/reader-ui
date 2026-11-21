import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { dehydrate, onlineManager, QueryClient } from "@tanstack/react-query";
import {
	type PersistedClient,
	persistQueryClientRestore,
} from "@tanstack/react-query-persist-client";
import { IDBFactory } from "fake-indexeddb";
import {
	OfflineRuntime,
	retainedReadingQuery,
	validateNetworkPartition,
} from "./offline-runtime";
import {
	admitContent,
	commitOffline,
	contentCacheName,
	OFFLINE_FORMAT,
	offlineRecord,
	type Partition,
	writeOfflineRecord,
} from "./offline-store";
import { canUpdate } from "./pwa-update";

const partition: Partition = {
	key: "tenant-a",
	generation: "generation-a",
	format: OFFLINE_FORMAT,
};
const originals = new Map<string, PropertyDescriptor | undefined>();
const setGlobal = (key: string, value: unknown) => {
	if (!originals.has(key))
		originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
	Object.defineProperty(globalThis, key, {
		configurable: true,
		writable: true,
		value,
	});
};
let networkOnline: boolean;
let failCache: boolean;
let messages: unknown[];
let stores: Map<string, Map<string, Response>>;
let channels: Channel[];
class Channel {
	onmessage?: (event: { data: unknown }) => void;
	constructor() {
		channels.push(this);
	}
	postMessage(data: unknown) {
		for (const channel of channels)
			if (channel !== this) channel.onmessage?.({ data });
	}
}
const response = (
	text = "mail",
	mime = "text/plain",
	headers: Record<string, string> = {},
) =>
	new Response(text, {
		headers: {
			"content-type": mime,
			"x-remit-partition": partition.key,
			"content-security-policy": "sandbox",
			...headers,
		},
	});
const createRuntime = (key = partition.key) =>
	new OfflineRuntime({
		verifySession: async () => ({ partitionKey: key }),
		reauthenticate: () => undefined,
	});
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
};

beforeEach(async () => {
	networkOnline = true;
	failCache = false;
	messages = [];
	stores = new Map();
	channels = [];
	let tail: Promise<unknown> = Promise.resolve();
	setGlobal("indexedDB", new IDBFactory());
	setGlobal("navigator", {
		get onLine() {
			return networkOnline;
		},
		locks: {
			request: (_: string, work: () => Promise<unknown>) => {
				const next = tail.then(work);
				tail = next.catch(() => undefined);
				return next;
			},
		},
		serviceWorker: {
			controller: { postMessage: (message: unknown) => messages.push(message) },
			addEventListener: () => undefined,
		},
		storage: {
			persist: async () => true,
			persisted: async () => false,
			estimate: async () => ({ usage: 1024, quota: 4096 }),
		},
	});
	setGlobal("BroadcastChannel", Channel);
	setGlobal("window", new window.EventTarget());
	setGlobal("location", { origin: "https://mail.example" });
	setGlobal("caches", {
		keys: async () => [...stores.keys()],
		delete: async (key: string) => stores.delete(key),
		open: async (name: string) => {
			if (!stores.has(name)) stores.set(name, new Map());
			const store = stores.get(name)!;
			return {
				match: async (url: string) => store.get(url)?.clone(),
				put: async (url: string, value: Response) => {
					if (failCache)
						throw new DOMException("Quota exceeded", "QuotaExceededError");
					store.set(url, value.clone());
				},
			};
		},
	});
	await writeOfflineRecord("partition", partition);
});
afterEach(() => {
	for (const [key, descriptor] of originals) {
		if (descriptor) Object.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}
	originals.clear();
	onlineManager.setOnline(true);
});

test("admits only tenant-provenanced 200 mail parts with expected MIME and original security headers", async () => {
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
		response('<div id="root"></div>', "text/html"),
	]) {
		assert.equal(
			await admitContent(
				candidate,
				(await candidate.clone().text()).startsWith("<div")
					? "text/html"
					: "text/plain",
				partition,
			),
			false,
		);
	}
	for (const type of ["opaque", "opaqueredirect", "error"]) {
		const candidate = response();
		Object.defineProperty(candidate, "type", { value: type });
		assert.equal(await admitContent(candidate, "text/plain", partition), false);
	}
	const redirected = response();
	Object.defineProperty(redirected, "redirected", { value: true });
	assert.equal(await admitContent(redirected, "text/plain", partition), false);
});

test("body, inline image and attachment bytes reopen after restart, including renewed signatures", async () => {
	const runtime = createRuntime();
	await runtime.start(new QueryClient());
	for (const mime of ["text/html", "image/png", "application/pdf"]) {
		const path = `/content/${mime.split("/")[1]}`;
		const saved = await runtime.content(
			`${path}?signature=old`,
			mime,
			async () => response("downloaded bytes", mime),
		);
		assert.equal(saved.headers.get("content-security-policy"), "sandbox");
	}
	networkOnline = false;
	const restarted = createRuntime();
	await restarted.start(new QueryClient());
	assert.equal(restarted.state.verified, false);
	for (const mime of ["text/html", "image/png", "application/pdf"]) {
		const cached = await restarted.content(
			`/content/${mime.split("/")[1]}?signature=new`,
			mime,
			async () => {
				throw new Error("Must not use network");
			},
		);
		assert.equal(await cached.text(), "downloaded bytes");
		assert.equal(cached.headers.get("content-security-policy"), "sandbox");
	}
	await assert.rejects(restarted.authorizeNetwork("POST"), /read-only/);
	await assert.rejects(
		restarted.content("/content/never-read", "text/plain", async () =>
			response(),
		),
		/unverified/,
	);
});

test("quota failures are observable and parts without a committed index are not advertised offline", async () => {
	const runtime = createRuntime();
	await runtime.start(new QueryClient());
	failCache = true;
	await assert.rejects(
		runtime.content("/content/part", "text/plain", async () => response()),
		/Quota/,
	);
	assert.match(runtime.state.error ?? "", /Quota/);
	assert.equal(
		await offlineRecord(
			`part:${partition.generation}:https://mail.example/content/part`,
		),
		undefined,
	);
	assert.equal(canUpdate(), true);
	await runtime.storage(true);
	assert.equal(runtime.state.persistent, true);
	assert.equal(runtime.state.usage, 1024);
});

test("a wipe fences slow content completions, persisted snapshots and other tabs while preserving shell caches", async () => {
	const runtime = createRuntime();
	const client = new QueryClient();
	await runtime.start(client);
	const second = createRuntime();
	await second.start(new QueryClient());
	client.setQueryData(["messages", "detail", "old", "body"], "old mail");
	stores.set("remit-shell-build", new Map());
	const slow = deferred<Response>();
	const started = deferred<void>();
	const fetching = runtime.content("/content/slow", "text/plain", () => {
		started.resolve();
		return slow.promise;
	});
	await started.promise;
	const persister = runtime.persister(runtime.state.partition!);
	await runtime.removeDownloads();
	slow.resolve(response());
	await assert.rejects(fetching, /removed/);
	await persister.persistClient({
		buster: "1",
		timestamp: Date.now(),
		clientState: dehydrate(client),
	});
	assert.equal(await offlineRecord("partition"), undefined);
	assert.equal(second.state.partition, undefined);
	assert.equal(client.getQueryCache().getAll().length, 0);
	assert.deepEqual([...stores.keys()], ["remit-shell-build"]);
	assert.equal((messages[0] as { type: string }).type, "remit:offline-wipe");
});

test("wipe waits for a writer already committing and rejects one queued after revocation", async () => {
	const held = deferred<void>();
	const started = deferred<void>();
	const writing = commitOffline(partition, async () => {
		started.resolve();
		await held.promise;
		await writeOfflineRecord("old", "mail");
	});
	await started.promise;
	const runtime = createRuntime();
	runtime.state = { partition, verified: true };
	const wiping = runtime.removeDownloads();
	const stale = commitOffline(partition, () =>
		writeOfflineRecord("resurrected", "mail"),
	);
	const rejected = assert.rejects(stale, /removed/);
	held.resolve();
	await writing;
	await wiping;
	await rejected;
	assert.equal(await offlineRecord("old"), undefined);
	assert.equal(await offlineRecord("resurrected"), undefined);
});

test("a pending identity verification cannot recreate the partition after logout", async () => {
	const identity = deferred<{ partitionKey: string } | null>();
	const started = deferred<void>();
	const runtime = new OfflineRuntime({
		verifySession: () => {
			started.resolve();
			return identity.promise;
		},
		reauthenticate: () => undefined,
	});
	const verifying = runtime.verify();
	await started.promise;
	await runtime.removeDownloads();
	identity.resolve({ partitionKey: partition.key });
	assert.equal(await verifying, false);
	assert.equal(await offlineRecord("partition"), undefined);
});

test("tenant switch wipes old bytes before binding new generation and rejects wrong-provenance API responses", async () => {
	stores.set(contentCacheName(partition), new Map());
	const runtime = createRuntime("tenant-b");
	await runtime.start(new QueryClient());
	assert.equal(runtime.state.partition, undefined);
	assert.equal(await runtime.verify(), false);
	const freshDocument = createRuntime("tenant-b");
	await freshDocument.start(new QueryClient());
	assert.equal(freshDocument.state.partition?.key, "tenant-b");
	assert.equal(stores.has(contentCacheName(partition)), false);
	await assert.rejects(
		validateNetworkPartition(response(), freshDocument.state.partition!),
		/provenance/,
	);
	await validateNetworkPartition(
		response("ok", "application/json", { "x-remit-partition": "tenant-b" }),
		freshDocument.state.partition!,
	);
});

test("successful reading queries and a descriptor index survive replacement pages, errors and long retention intervals", async () => {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const key = [
		{ _id: "messageOperationsDescribeMessage", path: { messageId: "old" } },
	];
	client.setQueryData(key, {
		message: { messageId: "old" },
		envelope: { subject: "Old mail" },
		bodyParts: [],
	});
	const runtime = createRuntime();
	await runtime.start(client);
	const persister = runtime.persister(runtime.state.partition!);
	const snapshot: PersistedClient = {
		buster: "1",
		timestamp: 1,
		clientState: dehydrate(client),
	};
	await persister.persistClient(snapshot);
	client.clear();
	await persister.persistClient({
		...snapshot,
		clientState: dehydrate(client),
	});
	const restored = await persister.restoreClient();
	assert.equal(restored?.clientState.queries.length, 1);
	const fresh = new QueryClient();
	await persistQueryClientRestore({
		queryClient: fresh,
		persister,
		maxAge: Infinity,
		buster: String(OFFLINE_FORMAT),
	});
	assert.deepEqual(fresh.getQueryData(key), {
		message: { messageId: "old" },
		envelope: { subject: "Old mail" },
		bodyParts: [],
	});
	assert.equal(Object.keys(await runtime.downloadedMessages()).length, 1);
	assert.equal(retainedReadingQuery({ queryKey: key }), true);
	for (const id of [
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
	assert.equal(
		retainedReadingQuery({ queryKey: ["messages", "detail", "old", "body"] }),
		true,
	);
	assert.equal(retainedReadingQuery({ queryKey: ["auth"] }), false);
});

test("auth failure and transport failure keep remembered reading; explicit retry re-verifies", async () => {
	let session: { partitionKey: string } | null = null;
	const runtime = new OfflineRuntime({
		verifySession: async () => session,
		reauthenticate: () => undefined,
	});
	await runtime.start(new QueryClient());
	assert.equal(runtime.state.verified, false);
	assert.equal(runtime.state.partition?.key, partition.key);
	session = { partitionKey: partition.key };
	assert.equal(await runtime.verify(), true);
	const failing = new OfflineRuntime({
		verifySession: async () => {
			throw new Error("Network unavailable");
		},
		reauthenticate: () => undefined,
	});
	await failing.start(new QueryClient());
	assert.equal(failing.state.partition?.key, partition.key);
	assert.match(failing.state.error ?? "", /Network/);
});

test("unexpected MIME, no-store, shell HTML and exports are never saved", async () => {
	const runtime = createRuntime();
	await runtime.start(new QueryClient());
	for (const candidate of [
		response("login", "text/html"),
		response("mail", "text/plain", { "cache-control": "no-store" }),
		response("mail", "text/plain", { "x-remit-partition": "other" }),
	])
		await assert.rejects(
			runtime.content("/content/part", "text/plain", async () => candidate),
			/not saved/,
		);
	await assert.rejects(
		runtime.content("/content/export/archive", "application/zip", async () =>
			response(),
		),
		/Only same-origin/,
	);
	await assert.rejects(
		runtime.content(
			"https://other.example/content/part",
			"text/plain",
			async () => response(),
		),
		/Only same-origin/,
	);
});

test("durable revocation fences writers even if deletion is interrupted", async () => {
	await writeOfflineRecord("epoch", "revoked");
	await assert.rejects(
		commitOffline(partition, () => writeOfflineRecord("late", "mail")),
		/removed/,
	);
	assert.equal(await offlineRecord("late"), undefined);
});

test("pending commits block a shell takeover until settlement", async () => {
	const runtime = createRuntime();
	await runtime.start(new QueryClient());
	const held = deferred<void>();
	const started = deferred<void>();
	const writing = runtime.write(runtime.state.partition!, async () => {
		started.resolve();
		await held.promise;
	});
	await started.promise;
	assert.equal(canUpdate(), false);
	held.resolve();
	await writing;
	assert.equal(canUpdate(), true);
});
