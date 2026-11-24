import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { OFFLINE_FORMAT, type Partition, wipeOffline } from "./offline-store";
import {
	PERIODIC_MAX_BYTES,
	PERIODIC_MAX_MS,
	refreshPeriodicDownloads,
} from "./periodic-refresh";
import {
	DAILY_INTERVAL,
	PERIODIC_TAG,
	type PeriodicRegistration,
	periodicStatusKey,
	registerPeriodicRefresh,
} from "./periodic-registration";
import { mergePeriodicBatch, stagingKey } from "./periodic-staging";

const partition: Partition = {
	key: "tenant",
	generation: "generation",
	epoch: "epoch",
	format: OFFLINE_FORMAT,
};
const records = new Map<string, unknown>();
const bytes = new Map<string, Response>();
let requests: string[];
let registered: unknown[][];
let unregistered: string[];
let registration: PeriodicRegistration;
const response = (
	data: unknown,
	mime = "application/json",
	tenant = partition.key,
) =>
	new Response(
		mime === "application/json" ? JSON.stringify(data) : String(data),
		{ headers: { "content-type": mime, "x-remit-partition": tenant } },
	);
/** Asynchronous IDB transport stand-in; exercises real record and lock code. */
function database() {
	return {
		close() {},
		transaction() {
			const tx = {
				oncomplete: undefined as (() => void) | undefined,
				objectStore: () => ({
					get(key: string) {
						const request = {
							result: records.get(key),
							onsuccess: undefined as (() => void) | undefined,
						};
						queueMicrotask(() => request.onsuccess?.());
						return request;
					},
					put(value: unknown, key: string) {
						records.set(key, structuredClone(value));
						queueMicrotask(() => tx.oncomplete?.());
					},
					delete(key: string) {
						records.delete(key);
						queueMicrotask(() => tx.oncomplete?.());
					},
					clear() {
						records.clear();
					},
				}),
			};
			return tx;
		},
	};
}
beforeEach(() => {
	requests = [];
	registered = [];
	unregistered = [];
	records.clear();
	bytes.clear();
	records.set("partition", partition);
	records.set("epoch", partition.epoch);
	records.set("periodic:config", {
		partition,
		revision: "revision",
		sessionEndpoint: "/api/session",
		apiBaseUrl: "/api/",
	});
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const path = new URL(String(input)).pathname;
			requests.push(path);
			assert.equal(init?.credentials, "same-origin");
			assert.equal(init?.redirect, "manual");
			assert.equal(init?.cache, "no-store");
			if (path === "/api/session")
				return response({ partitionKey: partition.key });
			if (path === "/api/config")
				return response({ accounts: [{ accountId: "account" }] });
			if (path.endsWith("/mailboxes"))
				return response({ items: [{ mailboxId: "inbox", fullPath: "INBOX" }] });
			if (path.endsWith("/threads"))
				return response({
					items: Array.from({ length: 30 }, (_, i) => ({
						messageId: `message-${i}`,
					})),
				});
			if (path.startsWith("/api/messages/"))
				return response({
					message: { messageId: path.split("/").at(-1) },
					bodyParts: [
						{
							partPath: "1",
							mediaType: "TEXT",
							mediaSubtype: "PLAIN",
							isMultipart: false,
							contentUrl: `/content/${path.split("/").at(-1)}`,
						},
					],
				});
			return response("downloaded mail", "text/plain");
		},
	);
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { origin: "http://localhost" },
	});
	Object.defineProperty(globalThis, "indexedDB", {
		configurable: true,
		value: {
			open() {
				const request = {
					result: database(),
					onsuccess: undefined as (() => void) | undefined,
				};
				queueMicrotask(() => request.onsuccess?.());
				return request;
			},
		},
	});
	Object.defineProperty(navigator, "locks", {
		configurable: true,
		value: {
			request: async (_: string, work: () => Promise<unknown>) => work(),
		},
	});
	Object.defineProperty(globalThis, "caches", {
		configurable: true,
		value: {
			keys: async () => ["remit-content-test"],
			delete: async () => {
				bytes.clear();
				return true;
			},
			open: async () => ({
				match: async (key: string) => bytes.get(key),
				put: async (key: string, value: Response) => {
					bytes.set(key, value);
				},
			}),
		},
	});
	registration = {
		periodicSync: {
			register: async (...args: unknown[]) => {
				registered.push(args);
			},
			unregister: async (tag: string) => {
				unregistered.push(tag);
			},
		},
	} as unknown as PeriodicRegistration;
	Object.defineProperty(navigator, "serviceWorker", {
		configurable: true,
		value: { ready: Promise.resolve(registration) },
	});
	Object.defineProperty(globalThis, "ServiceWorkerRegistration", {
		configurable: true,
		value: class {},
	});
	Object.defineProperty(ServiceWorkerRegistration.prototype, "periodicSync", {
		configurable: true,
		value: {},
	});
	mock.method(
		window,
		"matchMedia",
		() => ({ matches: true }) as MediaQueryList,
	);
	Object.defineProperty(navigator, "permissions", {
		configurable: true,
		value: { query: async () => ({ state: "granted" }) },
	});
});
afterEach(() => mock.restoreAll());
const run = () => refreshPeriodicDownloads(registration);
test("unsupported, uninstalled, denied and failed registrations are silent", async () => {
	const log = mock.method(console, "log", () => {});
	const warn = mock.method(console, "warn", () => {});
	const error = mock.method(console, "error", () => {});
	Reflect.deleteProperty(ServiceWorkerRegistration.prototype, "periodicSync");
	await registerPeriodicRefresh(
		partition,
		{ sessionEndpoint: "/api/session" },
		"/api",
	);
	Object.defineProperty(ServiceWorkerRegistration.prototype, "periodicSync", {
		configurable: true,
		value: {},
	});
	mock.method(
		window,
		"matchMedia",
		() => ({ matches: false }) as MediaQueryList,
	);
	await registerPeriodicRefresh(
		partition,
		{ sessionEndpoint: "/api/session" },
		"/api",
	);
	mock.method(
		window,
		"matchMedia",
		() => ({ matches: true }) as MediaQueryList,
	);
	mock.method(
		navigator.permissions,
		"query",
		async () => ({ state: "denied" }) as PermissionStatus,
	);
	await registerPeriodicRefresh(
		partition,
		{ sessionEndpoint: "/api/session" },
		"/api",
	);
	assert.equal(registered.length, 0);
	mock.method(
		navigator.permissions,
		"query",
		async () => ({ state: "granted" }) as PermissionStatus,
	);
	mock.method(registration.periodicSync, "register", async () => {
		throw new Error("ineligible");
	});
	await registerPeriodicRefresh(
		partition,
		{ sessionEndpoint: "/api/session" },
		"/api",
	);
	assert.equal(
		log.mock.callCount() + warn.mock.callCount() + error.mock.callCount(),
		0,
	);
});
test("eligible foreground authentication requests daily minimum and resets needsLogin", async () => {
	records.set(periodicStatusKey(partition), { needsLogin: true });
	await registerPeriodicRefresh(
		partition,
		{ sessionEndpoint: "/api/session" },
		"/api",
	);
	assert.deepEqual(registered, [
		[PERIODIC_TAG, { minInterval: DAILY_INTERVAL }],
	]);
	assert.equal(records.has(periodicStatusKey(partition)), false);
});
test("session redirects, opaque redirects, 401 and 403 record needsLogin and stop", async () => {
	for (const status of [302, 401, 403, 0]) {
		records.delete(periodicStatusKey(partition));
		const fetcher = mock.method(globalThis, "fetch", async () => {
			const r = new Response(null, { status: status || 200 });
			if (!status)
				Object.defineProperty(r, "type", { value: "opaqueredirect" });
			return r;
		});
		await run();
		assert.equal(fetcher.mock.callCount(), 1);
		assert.equal(
			(records.get(periodicStatusKey(partition)) as { needsLogin: boolean })
				.needsLogin,
			true,
		);
	}
	assert.equal(unregistered.length, 4);
});
test("twenty-message cap, staging hydration and subsequent new-message selection", async () => {
	await run();
	assert.equal(
		requests.filter((p) => p.startsWith("/api/messages/")).length,
		20,
	);
	assert.equal(bytes.size, 20);
	assert.equal(records.has(`queries:${partition.generation}`), false);
	const merged = await mergePeriodicBatch(partition);
	assert.equal(merged?.clientState.queries.length, 22);
	assert.equal(records.has(stagingKey(partition)), false);
	requests = [];
	await run();
	assert.equal(
		requests.filter((p) => p.startsWith("/api/messages/")).length,
		10,
	);
});
test("the body budget skips advertised and previously streamed oversized parts", async () => {
	const original = fetch;
	const streamed = mock.fn(
		() =>
			new Response(
				new ReadableStream({
					start(controller) {
						controller.enqueue(new Uint8Array(PERIODIC_MAX_BYTES / 2));
						controller.enqueue(new Uint8Array(PERIODIC_MAX_BYTES / 2 + 1));
					},
				}),
				{
					headers: {
						"content-type": "text/plain",
						"x-remit-partition": partition.key,
					},
				},
			),
	);
	const fetcher = mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			switch (new URL(String(input)).pathname) {
				case "/api/messages/message-0":
					return response({
						bodyParts: [
							{
								partPath: "1",
								mediaType: "TEXT",
								mediaSubtype: "PLAIN",
								isMultipart: false,
								sizeOctets: PERIODIC_MAX_BYTES + 1,
								contentUrl: "/content/message-0",
							},
						],
					});
				case "/content/message-1":
					return streamed();
				default:
					return original(input, init);
			}
		},
	);
	await run();
	assert.equal(bytes.size, 0);
	assert.equal(streamed.mock.callCount(), 1);
	assert.ok(
		!fetcher.mock.calls.some(({ arguments: [input] }) =>
			String(input).endsWith("/content/message-0"),
		),
	);
	assert.ok(!requests.includes("/api/messages/message-2"));

	await run();
	assert.equal(streamed.mock.callCount(), 1);
	assert.equal(bytes.has("http://localhost/content/message-2"), true);
});

test("a completed body and its descriptor survive a later download failure", async () => {
	const original = fetch;
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) =>
			String(input).endsWith("/content/message-1")
				? new Response(null, { status: 500 })
				: original(input, init),
	);
	const assertFirstDownload = async () => {
		assert.equal(
			await bytes.get("http://localhost/content/message-0")?.clone().text(),
			"downloaded mail",
		);
		assert.equal(bytes.has("http://localhost/content/message-1"), false);
		const merged = await mergePeriodicBatch(partition);
		const descriptions = merged?.clientState.queries
			.filter(
				({ queryKey: [key] }) =>
					key &&
					typeof key === "object" &&
					"_id" in key &&
					key._id === "messageOperationsDescribeMessage",
			)
			.map(({ state }) => state.data);
		assert.deepEqual(descriptions, [
			{
				message: { messageId: "message-0" },
				bodyParts: [
					{
						partPath: "1",
						mediaType: "TEXT",
						mediaSubtype: "PLAIN",
						isMultipart: false,
						contentUrl: "/content/message-0",
					},
				],
			},
		]);
	};

	await run();
	await assertFirstDownload();

	// The index and bytes can outlive their saved descriptor.
	records.delete(`queries:${partition.generation}`);
	records.delete(periodicStatusKey(partition));
	requests = [];
	await run();
	assert.equal(requests.includes("/content/message-0"), false);
	await assertFirstDownload();
});

test("30 second deadline stops before another request", async () => {
	const original = fetch;
	const now = 1000;
	mock.method(Date, "now", () => now);
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const result = await original(input, init);
			mock.method(Date, "now", () => now + PERIODIC_MAX_MS);
			return result;
		},
	);
	await run();
	assert.deepEqual(requests, ["/api/session"]);
	assert.equal(bytes.size, 0);
});
test("partition mismatch discards staging and wipe erases all staging", async () => {
	await run();
	const batch = records.get(stagingKey(partition));
	records.set(stagingKey(partition), {
		...(batch as object),
		partition: { ...partition, key: "other" },
	});
	assert.equal(await mergePeriodicBatch(partition), undefined);
	records.set(stagingKey(partition), batch);
	mock.method(globalThis, "fetch", async () =>
		response({ partitionKey: "other" }),
	);
	await run();
	assert.equal(records.has(stagingKey(partition)), false);
	records.set(stagingKey(partition), batch);
	await wipeOffline();
	assert.equal(records.has(stagingKey(partition)), false);
});
test("transport keeps caches; other failures warn, back off and stop after ten attempts", async () => {
	bytes.set("old", response("old", "text/plain"));
	mock.method(globalThis, "fetch", async () => {
		throw new TypeError("offline");
	});
	await run();
	assert.equal(bytes.size, 1);
	assert.equal(
		records.get(`periodic:warning:${partition.generation}`),
		undefined,
	);
	records.set(periodicStatusKey(partition), { attempts: 9 });
	const failed = mock.method(
		globalThis,
		"fetch",
		async () => new Response(null, { status: 500 }),
	);
	await run();
	await run();
	assert.equal(failed.mock.callCount(), 1);
	assert.equal(
		(records.get(periodicStatusKey(partition)) as { attempts: number })
			.attempts,
		10,
	);
	assert.ok(records.get(`periodic:warning:${partition.generation}`));
	assert.deepEqual(unregistered, [PERIODIC_TAG]);
});

test("a response completing after a wipe cannot recreate bytes or staging", async () => {
	const original = fetch;
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const result = await original(input, init);
			if (String(input).includes("/content/")) await wipeOffline();
			return result;
		},
	);
	await run();
	assert.equal(bytes.size, 0);
	assert.equal(records.has(stagingKey(partition)), false);
});

test("API provenance mismatch discards staging, stops and leaves one reporter warning", async () => {
	const original = fetch;
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const result = await original(input, init);
			if (String(input).includes("/messages/"))
				result.headers.set("x-remit-partition", "other");
			return result;
		},
	);
	await run();
	assert.equal(bytes.size, 0);
	assert.equal(records.has(stagingKey(partition)), false);
	assert.ok(records.get(`periodic:warning:${partition.generation}`));
	assert.deepEqual(unregistered, [PERIODIC_TAG]);
});

test("opt-out revokes a body response already in flight", async () => {
	const original = fetch;
	mock.method(
		globalThis,
		"fetch",
		async (input: RequestInfo | URL, init?: RequestInit) => {
			const result = await original(input, init);
			if (String(input).includes("/content/"))
				records.delete("periodic:config");
			return result;
		},
	);
	await run();
	assert.equal(bytes.size, 0);
	assert.equal(records.has(stagingKey(partition)), false);
});

test("prefetched metadata without cached bytes still downloads its body", async () => {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	client.setQueryData(
		[
			{
				_id: "messageOperationsDescribeMessage",
				baseUrl: "/api",
				path: { messageId: "message-0" },
			},
		],
		{
			message: { messageId: "message-0" },
			bodyParts: [
				{
					partPath: "1",
					mediaType: "TEXT",
					mediaSubtype: "PLAIN",
					isMultipart: false,
					contentUrl: "/content/message-0",
				},
			],
		},
	);
	records.set(`queries:${partition.generation}`, {
		timestamp: Date.now(),
		buster: String(OFFLINE_FORMAT),
		clientState: dehydrate(client),
	});
	await run();
	assert.equal(requests.includes("/api/messages/message-0"), false);
	assert.equal(bytes.has("http://localhost/content/message-0"), true);
	client.clear();
});
