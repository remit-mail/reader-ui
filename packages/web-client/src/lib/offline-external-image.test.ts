import assert from "node:assert/strict";
import { test } from "node:test";
import { OfflineRuntime } from "./offline-runtime";
import { OFFLINE_FORMAT, type Partition } from "./offline-store";

// A minimal IDB transport: assertions exercise the runtime's real record keys,
// partition checks and write boundary. Browser consumer tests cover real IDB.
test("remote bytes reopen offline by complete destination URL and stale writes cannot survive a wipe", async (t) => {
	const property = (target: object, name: string, value: unknown) => {
		const previous = Object.getOwnPropertyDescriptor(target, name);
		Object.defineProperty(target, name, { configurable: true, value });
		t.after(() => {
			if (previous) Object.defineProperty(target, name, previous);
			else Reflect.deleteProperty(target, name);
		});
	};
	const partition: Partition = {
		key: "tenant",
		generation: "generation",
		epoch: "epoch",
		format: OFFLINE_FORMAT,
	};
	const records = new Map<string, unknown>([
		["partition", partition],
		["epoch", partition.epoch],
	]);
	let failWrites = false;
	property(globalThis, "indexedDB", {
		open: () => {
			const request: Record<string, unknown> = {};
			queueMicrotask(() => {
				request.result = {
					close() {},
					transaction: () => {
						const tx: Record<string, unknown> = {
							objectStore: () => ({
								get: (key: string) => {
									const result: Record<string, unknown> = {};
									queueMicrotask(() => {
										result.result = records.get(key);
										(result.onsuccess as () => void)();
									});
									return result;
								},
								put: (value: unknown, key: string) => {
									if (failWrites)
										throw new DOMException(
											"Image quota exceeded",
											"QuotaExceededError",
										);
									records.set(key, value);
									queueMicrotask(() => (tx.oncomplete as () => void)());
								},
							}),
						};
						return tx;
					},
				};
				(request.onsuccess as () => void)();
			});
			return request;
		},
	});
	property(navigator, "locks", {
		request: async (_name: string, work: () => unknown) => work(),
	});
	property(navigator, "serviceWorker", {
		controller: {},
		addEventListener() {},
	});
	property(
		globalThis,
		"BroadcastChannel",
		class {
			postMessage() {}
		},
	);
	const runtime = new OfflineRuntime({
		verifySession: async () => ({ partitionKey: partition.key }),
		reauthenticate() {},
	});
	runtime.state = { partition, verified: true };
	const remote = "https://images.example/image?token=one";
	const fetch = t.mock.method(
		globalThis,
		"fetch",
		async () =>
			new Response("one", {
				headers: {
					"content-type": "image/png",
					"x-remit-partition": partition.key,
				},
			}),
	);
	assert.equal(
		await (await runtime.externalImage("/api/image-proxy", remote)).text(),
		"one",
	);
	assert.ok(
		records.has(
			`external-image:${partition.generation}:${JSON.stringify(["external-image", remote])}`,
		),
	);
	Reflect.set(runtime, "refreshing", 1);
	fetch.mock.mockImplementation(
		async () =>
			new Response("login", { headers: { "content-type": "text/html" } }),
	);
	await assert.rejects(
		runtime.externalImage("/api/image-proxy", remote),
		/External image refused/,
	);
	Reflect.set(runtime, "refreshing", 0);
	fetch.mock.mockImplementation(
		async () =>
			new Response("two", {
				headers: {
					"content-type": "image/png",
					"x-remit-partition": partition.key,
				},
			}),
	);
	failWrites = true;
	await assert.rejects(
		runtime.externalImage("/api/image-proxy", remote.replace("one", "two")),
		/Image quota exceeded/,
	);
	assert.match(runtime.state.error ?? "", /Image quota exceeded/);
	failWrites = false;
	const reopened = new OfflineRuntime(runtime.options);
	reopened.state = { partition, verified: false };
	assert.equal(
		await (await reopened.externalImage("/api/image-proxy", remote)).text(),
		"one",
	);
	assert.equal(fetch.mock.callCount(), 3);
	await assert.rejects(
		reopened.externalImage("/api/image-proxy", remote.replace("one", "two")),
		/Session unverified/,
	);
	fetch.mock.mockImplementation(async () => {
		records.delete("partition");
		return new Response("late", {
			headers: {
				"content-type": "image/png",
				"x-remit-partition": partition.key,
			},
		});
	});
	await assert.rejects(
		runtime.externalImage("/api/image-proxy", remote.replace("one", "two")),
		/Downloads were removed/,
	);
	assert.equal(
		[...records.keys()].filter((key) => key.startsWith("external-image:"))
			.length,
		1,
	);
});
