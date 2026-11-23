import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

interface Controls {
	setSession(key: string, status?: number): void;
	contentRequests: string[];
	imageProxyRequests: string[];
	slowImageRequested: Promise<void>;
	releaseSlowImage(): void;
	slowRequested: Promise<void>;
	releaseSlow(): void;
}
const imagesReady = async (page: Page) =>
	page.waitForFunction(() => {
		const frame = document.querySelector<HTMLIFrameElement>(
			'iframe[title="Email content"]',
		)?.contentDocument;
		const images =
			frame?.querySelectorAll<HTMLImageElement>("img.inline-content");
		return (
			images?.length === 2 &&
			[...images].every(
				(image) =>
					image.src.startsWith("blob:") &&
					image.complete &&
					image.naturalWidth === 1,
			)
		);
	});
const remoteImageReady = async (page: Page) =>
	page.waitForFunction(() => {
		const image = document
			.querySelector<HTMLIFrameElement>('iframe[title="Email content"]')
			?.contentDocument?.querySelector<HTMLImageElement>(
				'img[alt="remote image"]',
			);
		return (
			image?.src.startsWith("blob:") &&
			image.complete &&
			image.naturalWidth === 1
		);
	});
const attachment = async (page: Page) => {
	const downloaded = page.waitForEvent("download");
	await page
		.getByRole("button", { name: "Download report.pdf", exact: true })
		.click();
	const download = await downloaded;
	assert.equal(download.suggestedFilename(), "report.pdf");
	const path = await download.path();
	assert.ok(path);
	assert.equal(readFileSync(path, "utf8"), "Offline attachment bytes\n");
};
export async function testOfflineReading(
	origin: string,
	controls: Controls,
): Promise<void> {
	const profile = mkdtempSync(join(tmpdir(), "remit-offline-profile-"));
	const launch = (offline = false) =>
		chromium.launchPersistentContext(profile, {
			headless: true,
			channel: "chromium",
			args: ["--no-sandbox"],
			offline,
			serviceWorkers: "allow",
			acceptDownloads: true,
		});
	let context = await launch();
	try {
		let page = await context.newPage();
		await page.addInitScript(() => {
			Object.defineProperty(navigator.storage, "persist", {
				value: async () => {
					document.documentElement.dataset.persistCalls = String(
						Number(document.documentElement.dataset.persistCalls ?? 0) + 1,
					);
					return true;
				},
			});
			const estimate = navigator.storage.estimate.bind(navigator.storage);
			Object.defineProperty(navigator.storage, "estimate", {
				value: async () => {
					const count =
						Number(document.documentElement.dataset.estimateCalls ?? 0) + 1;
					document.documentElement.dataset.estimateCalls = String(count);
					return count === 1 ? { usage: 0, quota: 10737418240 } : estimate();
				},
			});
			localStorage.setItem("pwa-offline-test", "yes");
			localStorage.setItem("pwa-auth", "better");
		});
		let tracking = 0;
		context.on("request", (request) => {
			if (request.url().includes("tracking.invalid")) tracking++;
		});
		const installed = await context.newPage();
		await installed.addInitScript(() => {
			localStorage.setItem("pwa-offline-test", "yes");
			const matchMedia = window.matchMedia.bind(window);
			window.matchMedia = (query) =>
				query === "(display-mode: standalone)"
					? Object.defineProperty(matchMedia(query), "matches", { value: true })
					: matchMedia(query);
			Object.defineProperty(navigator.storage, "persist", {
				value: async () => {
					document.documentElement.dataset.persistCalls = "1";
					return true;
				},
			});
		});
		await installed.goto(`${origin}/settings/advanced`);
		await installed.waitForFunction(
			() => document.documentElement.dataset.persistCalls === "1",
		);
		await installed.close();
		await page.goto(`${origin}/downloads/old-mail`);
		await page.waitForFunction(
			() =>
				!!navigator.serviceWorker.controller &&
				!!window.pwaTest.offline()?.state.verified,
		);
		await page.reload();
		await page.getByRole("heading", { name: "Old retained mail" }).waitFor();
		await imagesReady(page);
		await attachment(page);
		assert.doesNotMatch(
			await page.locator("body").innerText(),
			/Session verified|session unverified|Opening downloads|Restoring downloads|MiB used|may be removed|Keep downloads on this device|Remove downloads/,
		);
		assert.equal(
			await page.evaluate(() => window.pwaTest.offline()?.state.verified),
			true,
			"signed URL repair must not invalidate the session",
		);
		assert.equal(
			controls.contentRequests.filter((path) => path.endsWith("/attachment"))
				.length,
			2,
			"expired signature is repaired by re-describing",
		);
		assert.equal(
			controls.contentRequests.some((path) => path.endsWith("/unused")),
			false,
			"unreferenced CIDs are not fetched",
		);
		await page.waitForFunction(
			() =>
				Number(document.documentElement.dataset.estimateCalls) > 1 &&
				(window.pwaTest.offline()?.state.usage ?? 0) > 0,
		);
		assert.equal(
			await page.evaluate(() => document.documentElement.dataset.persistCalls),
			"1",
			"first successful save requests persistence once",
		);
		assert.equal(tracking, 0, "remote tracking images remain blocked");
		assert.deepEqual(
			controls.imageProxyRequests,
			[],
			"blocked images never reach the proxy",
		);
		await page.getByRole("button", { name: "Load once", exact: true }).click();
		await remoteImageReady(page);
		assert.deepEqual(controls.imageProxyRequests, [
			"https://tracking.invalid/pixel?token=one",
		]);
		assert.equal(tracking, 0, "permitted images use only the POST proxy");
		await page.goto(`${origin}/downloads/new-mail`);
		await page.getByRole("heading", { name: "New list page" }).waitFor();
		await page
			.getByRole("link", { name: "Old retained mail", exact: true })
			.waitFor();
		// Age the actual stored snapshot past the plugin's default 24-hour lifetime.
		await page.waitForFunction(async () => {
			const request = indexedDB.open("remit-offline");
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			try {
				return await new Promise<boolean>((resolve, reject) => {
					const tx = db.transaction("data");
					const cursor = tx.objectStore("data").openCursor();
					let found = false;
					cursor.onsuccess = () => {
						const entry = cursor.result;
						if (!entry) return;
						if (
							String(entry.key).startsWith("queries:") &&
							entry.value.clientState.queries.filter(
								(query: { queryKey: unknown[] }) =>
									JSON.stringify(query.queryKey).includes(
										"messageOperationsDescribeMessage",
									),
							).length === 2
						)
							found = true;
						entry.continue();
					};
					tx.oncomplete = () => resolve(found);
					tx.onerror = () => reject(tx.error);
				});
			} finally {
				db.close();
			}
		});
		await page.evaluate(async () => {
			const request = indexedDB.open("remit-offline");
			const db = await new Promise<IDBDatabase>((resolve) => {
				request.onsuccess = () => resolve(request.result);
			});
			try {
				await new Promise<void>((resolve, reject) => {
					const tx = db.transaction("data", "readwrite");
					const cursor = tx.objectStore("data").openCursor();
					cursor.onsuccess = () => {
						const entry = cursor.result;
						if (!entry) return;
						if (String(entry.key).startsWith("queries:")) {
							const value = entry.value;
							value.timestamp = Date.now() - 90 * 86400000;
							entry.update(value);
						}
						entry.continue();
					};
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(tx.error);
				});
			} finally {
				db.close();
			}
			localStorage.setItem("pwa-auth", "cognito");
		});
		await context.close();
		// A real Chromium process restart, with only its durable profile retained.
		context = await launch(true);
		page = await context.newPage();
		await page.goto(`${origin}/downloads`);
		await page
			.getByRole("link", { name: "Old retained mail", exact: true })
			.waitFor();
		await page
			.locator('[data-identity-context="mounted"]')
			.waitFor({ state: "attached" });
		await page
			.locator('[data-account-probe="signed-out"]')
			.waitFor({ state: "attached" });
		assert.equal(
			await page.locator("[data-online-gate]").count(),
			0,
			"Cognito context stays mounted without its sign-in gate",
		);
		await page
			.getByRole("link", { name: "Old retained mail", exact: true })
			.click();
		await page.getByRole("heading", { name: "Old retained mail" }).waitFor();
		await imagesReady(page);
		await page.getByRole("button", { name: "Load once", exact: true }).click();
		await remoteImageReady(page);
		assert.deepEqual(
			controls.imageProxyRequests,
			["https://tracking.invalid/pixel?token=one"],
			"a process restart recreates object URLs from saved bytes without a POST",
		);
		await attachment(page);
		assert.equal(
			await page.evaluate(() => window.pwaTest.offline()?.state.verified),
			false,
		);
		const cached = await page.evaluate(async () => {
			const names = (await caches.keys()).filter((name) =>
				name.startsWith("remit-content-"),
			);
			const response = await (await caches.open(names[0])).match(
				`${location.origin}/content/old-mail/html`,
			);
			return {
				csp: response?.headers.get("Content-Security-Policy"),
				mime: response?.headers.get("Content-Type"),
			};
		});
		assert.deepEqual(cached, { csp: "sandbox", mime: "text/html" });
		// Better Auth's online-only gate must also stay out of an offline restart.
		await page.evaluate(() => localStorage.setItem("pwa-auth", "better"));
		await context.close();
		context = await launch(true);
		page = await context.newPage();
		await page.goto(`${origin}/downloads/old-mail`);
		await imagesReady(page);
		assert.equal(await page.locator("[data-online-gate]").count(), 0);
		// Reconnect verifies identity; server/transport rejection never starts login.
		controls.setSession("tenant-a", 503);
		await context.setOffline(false);
		await page.waitForFunction(
			() =>
				window.pwaTest.offline()?.state.error ===
				"Session verification failed: 503",
		);
		assert.equal(
			await page.evaluate(() => window.pwaTest.reauthentications),
			0,
		);
		controls.setSession("tenant-a");
		await page.evaluate(() => window.pwaTest.offline()!.verify());
		await page.waitForFunction(
			() => !!window.pwaTest.offline()?.state.verified,
		);
		const imageQuotaFailure = await page.evaluate(async () => {
			const runtime = window.pwaTest.offline()!;
			const put = IDBObjectStore.prototype.put;
			IDBObjectStore.prototype.put = function (value, key) {
				if (String(key).startsWith("external-image:"))
					throw new DOMException("Image quota exceeded", "QuotaExceededError");
				return put.call(this, value, key);
			};
			try {
				return await runtime
					.externalImage(
						"/api/image-proxy",
						"https://tracking.invalid/pixel?token=quota",
					)
					.then(
						() => "unexpected success",
						(error: Error) => error.message,
					);
			} finally {
				IDBObjectStore.prototype.put = put;
			}
		});
		assert.match(imageQuotaFailure, /Image quota exceeded/);
		await page.waitForFunction(
			() => window.pwaTest.offline()?.state.error === "Image quota exceeded",
		);
		const retainedImage = await page.evaluate(async () => {
			const runtime = window.pwaTest.offline()!;
			const bytes = await runtime.externalImage(
				"/api/image-proxy",
				"https://tracking.invalid/pixel?token=one",
			);
			return { type: bytes.type, size: bytes.size };
		});
		assert.equal(retainedImage.type, "image/png");
		assert.ok(
			retainedImage.size > 0,
			"failed admission/write leaves previously saved image bytes intact",
		);
		assert.deepEqual(
			controls.imageProxyRequests,
			[
				"https://tracking.invalid/pixel?token=one",
				"https://tracking.invalid/pixel?token=quota",
			],
			"destination queries identify distinct records",
		);
		// Inject a failure at the actual Cache API write, leaving all browser stores real.
		const cacheFailure = await page.evaluate(async () => {
			const original = Cache.prototype.put;
			Cache.prototype.put = async () => {
				throw new DOMException("Cache quota exceeded", "QuotaExceededError");
			};
			try {
				await window.pwaTest
					.offline()!
					.content("/content/probe/quota", "text/plain", () =>
						fetch("/content/probe/quota"),
					);
				return "unexpected success";
			} catch (error) {
				return (error as Error).message;
			} finally {
				Cache.prototype.put = original;
			}
		});
		assert.match(cacheFailure, /quota/i);
		await page.waitForFunction(() =>
			/quota/i.test(window.pwaTest.offline()?.state.error ?? ""),
		);
		const persistenceFailure = await page.evaluate(async () => {
			const runtime = window.pwaTest.offline()!;
			const persister = runtime.persister(runtime.state.partition!);
			const original = IDBObjectStore.prototype.put;
			IDBObjectStore.prototype.put = function (value, key) {
				if (value?.buster === "quota-probe")
					throw new DOMException("Query quota exceeded", "QuotaExceededError");
				return original.call(this, value, key);
			};
			try {
				await persister.persistClient({
					buster: "quota-probe",
					timestamp: Date.now(),
					clientState: { queries: [], mutations: [] },
				});
				return "unexpected success";
			} catch (error) {
				return (error as Error).message;
			} finally {
				IDBObjectStore.prototype.put = original;
			}
		});
		assert.match(persistenceFailure, /Query quota exceeded/);
		await page.waitForFunction(
			() => window.pwaTest.offline()?.state.error === "Query quota exceeded",
		);
		// A second tab removes downloads before its initial identity read completes.
		// Delay only the first real IDB read; all stores and messaging stay native.
		const starting = await context.newPage();
		await starting.addInitScript(() => {
			const get = IDBObjectStore.prototype.get;
			let first = true;
			IDBObjectStore.prototype.get = function (key) {
				const request = get.call(this, key);
				if (first && key === "partition") {
					first = false;
					document.documentElement.dataset.offlineStart = "waiting";
					request.addEventListener(
						"success",
						(event) => {
							event.stopImmediatePropagation();
							window.addEventListener(
								"release-offline-start",
								() => {
									request.dispatchEvent(new Event("success"));
								},
								{ once: true },
							);
						},
						{ once: true },
					);
				}
				return request;
			};
		});
		await starting.goto(`${origin}/downloads`);
		await starting.waitForFunction(
			() => document.documentElement.dataset.offlineStart === "waiting",
		);
		assert.equal(await starting.locator("body").innerText(), "");
		assert.equal(
			await starting.evaluate(() => window.pwaTest.offline()?.state.partition),
			undefined,
		);
		await starting.evaluate(() => window.pwaTest.offline()!.removeDownloads());
		await page.waitForFunction(
			() => !window.pwaTest.offline()?.state.partition,
			undefined,
			{ timeout: 5000 },
		);
		await page
			.getByRole("heading", { name: "Old retained mail" })
			.waitFor({ state: "detached" });
		await starting.evaluate(() =>
			window.dispatchEvent(new Event("release-offline-start")),
		);
		await starting.waitForFunction(() =>
			document.querySelector("[data-online-gate]"),
		);
		assert.equal(
			await starting.evaluate(() => window.pwaTest.offline()?.state.partition),
			undefined,
		);
		await starting.close();
		await page.reload();
		await imagesReady(page);
		// Capture a late persister and hold a real network read across a cross-tab wipe.
		await page.evaluate(async () => {
			const runtime = window.pwaTest.offline()!;
			const persister = runtime.persister(runtime.state.partition!);
			const snapshot = (await persister.restoreClient())!;
			window.pwaTest.latePersist = () =>
				Promise.resolve(persister.persistClient(snapshot)).then(
					() => "saved",
					(error: Error) => error.message,
				);
			window.pwaTest.slowSave = runtime
				.content("/content/probe/slow", "text/plain", () =>
					fetch("/content/probe/slow"),
				)
				.then(
					() => "saved",
					(error: Error) => error.message,
				);
		});
		await page.evaluate(() => {
			window.pwaTest.slowImageSave = window.pwaTest
				.offline()!
				.externalImage(
					"/api/image-proxy",
					"https://tracking.invalid/pixel?token=slow",
				)
				.then(
					() => "saved",
					(error: Error) => error.message,
				);
		});
		await controls.slowImageRequested;
		await controls.slowRequested;
		const peer = await context.newPage();
		await peer.goto(`${origin}/downloads`);
		await peer
			.getByRole("link", { name: "Old retained mail", exact: true })
			.waitFor();
		await page.evaluate(() => window.pwaTest.offline()!.removeDownloads());
		await peer.waitForFunction(
			() => !window.pwaTest.offline()?.state.partition,
		);
		controls.releaseSlow();
		controls.releaseSlowImage();
		assert.match(
			await page.evaluate(() => window.pwaTest.slowImageSave!),
			/removed/,
		);
		const remainingImages = await page.evaluate(async () => {
			const request = indexedDB.open("remit-offline");
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			try {
				return await new Promise<IDBValidKey[]>((resolve, reject) => {
					const request = db
						.transaction("data")
						.objectStore("data")
						.getAllKeys();
					request.onsuccess = () =>
						resolve(
							request.result.filter((key) =>
								String(key).startsWith("external-image:"),
							),
						);
					request.onerror = () => reject(request.error);
				});
			} finally {
				db.close();
			}
		});
		assert.deepEqual(
			remainingImages,
			[],
			"removeDownloads deletes images and a late POST cannot recreate them",
		);
		assert.match(
			await page.evaluate(() => window.pwaTest.slowSave!),
			/removed/,
		);
		assert.match(
			await page.evaluate(() => window.pwaTest.latePersist!()),
			/removed/,
		);
		assert.deepEqual(
			await page.evaluate(async () =>
				(await caches.keys()).filter((name) =>
					name.startsWith("remit-content-"),
				),
			),
			[],
		);
		assert.ok(
			await page.evaluate(async () =>
				(await caches.keys()).some((name) => name.startsWith("remit-shell-")),
			),
		);
		await peer.close();
		// A new document can bind again; a different tenant must purge before rendering.
		await page.reload();
		await page.waitForFunction(
			() => !!window.pwaTest.offline()?.state.verified,
		);
		await page.goto(`${origin}/downloads/old-mail`);
		await imagesReady(page);
		await page.goto(`${origin}/downloads`);
		await page
			.getByRole("link", { name: "Old retained mail", exact: true })
			.waitFor();
		controls.setSession("tenant-b");
		await page.evaluate(() => window.pwaTest.offline()!.verify());
		await page.waitForFunction(
			() =>
				!window.pwaTest.offline()?.state.partition &&
				window.pwaTest.reauthentications === 1,
		);
		assert.deepEqual(
			await page.evaluate(async () =>
				(await caches.keys()).filter((name) =>
					name.startsWith("remit-content-"),
				),
			),
			[],
		);
		await page.reload();
		await page.waitForFunction(
			() => window.pwaTest.offline()?.state.partition?.key === "tenant-b",
		);
		assert.equal(
			await page
				.getByRole("link", { name: "Old retained mail", exact: true })
				.count(),
			0,
		);
		console.log(
			"Offline consumer OK: process restarts, 90-day retention, both auth contexts, CID and attachment bytes, quota failures, tenant changes and cross-tab wipe races.",
		);
	} finally {
		controls.releaseSlowImage();
		controls.releaseSlow();
		await context.close();
		rmSync(profile, { recursive: true, force: true });
	}
}
