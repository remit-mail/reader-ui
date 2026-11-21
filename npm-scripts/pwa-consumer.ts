import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";
import {
	makeAccount,
	makeConfig,
	makeUserSettings,
} from "../packages/web-client/src/test-support/fixtures.ts";

declare global {
	interface Window {
		pwaTest: {
			dirty: boolean;
			version: string;
			restored?: boolean;
			loadProbe: () => Promise<unknown>;
		};
		allowPwaRegistration?: () => void;
		pwaRegistration?: ServiceWorkerRegistration;
	}
}

const dist = process.argv[2];
const swFile = join(dist, "sw.js");
const worker = readFileSync(swFile, "utf8");
assert.ok(
	!/importScripts\s*\(/.test(worker),
	"worker must bundle its dependencies",
);
assert.equal(
	JSON.parse(readFileSync(join(dist, "manifest.webmanifest"), "utf8")).name,
	"Consumer Mail",
);
const assets = readdirSync(join(dist, "assets")).map(
	(file) => `assets/${file}`,
);
for (const file of [...assets, "config.js", "manifest.webmanifest"]) {
	assert.ok(worker.includes(file), `precache missing ${file}`);
}
assert.ok(!worker.includes('url:"index.html"'), "precache uses canonical /");
const types: Record<string, string> = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",
	".json": "application/json",
	".webmanifest": "application/manifest+json",
	".wasm": "application/wasm",
	".mjs": "application/javascript",
	".png": "image/png",
};
let serving = dist;
let savedSubject: string | undefined;
let pendingSubject: string | undefined;
const missingStatic = new Set<string>();
let finishSave!: () => void;
const saveGate = new Promise<void>((resolve) => {
	finishSave = resolve;
});
const draft = {
	outboxMessageId: "draft-one",
	accountId: "acc-1",
	fromAddress: "alice@example.com",
	toAddresses: ["recipient@example.com"],
	ccAddresses: [],
	bccAddresses: [],
	attachments: [],
	references: [],
	subject: "Saved subject",
	textBody: "Saved body",
	status: "draft",
	createdAt: 0,
	updatedAt: 0,
};
const server = createServer(async (request, response) => {
	const path = new URL(request.url ?? "/", "http://localhost").pathname;
	const file = join(serving, path === "/" ? "index.html" : path);
	response.setHeader("Cache-Control", "no-cache");
	if (["/consent", "/device", "/apps", "/apps/connections"].includes(path)) {
		response.setHeader("Content-Type", "text/html");
		response.end(`<!doctype html><title>Host page</title><h1>${path}</h1>`);
	} else if (path === "/auth/bfcache-away") {
		response.setHeader("Content-Type", "text/html");
		response.setHeader("Cache-Control", "max-age=600");
		response.end("<!doctype html><title>Outside the app</title>");
	} else if (path.startsWith("/api/")) {
		response.setHeader("Content-Type", "application/json");
		if (path === "/api/config")
			response.end(
				JSON.stringify(
					makeConfig([makeAccount({ accountId: "acc-1" })], {
						buildCommit:
							serving === dist ? "consumer-pwa-v1" : "consumer-pwa-v2",
					}),
				),
			);
		else if (path === "/api/settings")
			response.end(JSON.stringify(makeUserSettings()));
		else if (path === "/api/outbox/draft-one") {
			if (request.method === "PATCH") {
				const chunks: Buffer[] = [];
				for await (const chunk of request) chunks.push(chunk);
				const body = JSON.parse(Buffer.concat(chunks).toString());
				pendingSubject = body.subject;
				await saveGate;
				savedSubject = body.subject;
				Object.assign(draft, body);
			}
			response.end(JSON.stringify(draft));
		} else
			response.end(
				JSON.stringify({ items: [], totalCount: 0, hasMore: false }),
			);
	} else if (path === "/index.html") {
		response.writeHead(308, { Location: "/" });
		response.end();
	} else if (existsSync(file) && extname(file)) {
		response.setHeader(
			"Content-Type",
			types[extname(file)] ?? "application/octet-stream",
		);
		response.end(readFileSync(file));
	} else if (extname(file)) {
		missingStatic.add(path);
		response.setHeader("Content-Type", "text/plain");
		response.writeHead(404);
		response.end("Not found");
	} else if (
		path.startsWith("/content/") ||
		path.startsWith("/auth/") ||
		path.startsWith("/cdn-cgi/")
	) {
		response.writeHead(401);
		response.end();
	} else {
		response.setHeader("Content-Type", "text/html");
		response.end(readFileSync(join(serving, "index.html")));
	}
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
assert.ok(address && typeof address !== "string");
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({
	headless: true,
	channel: "chromium",
	args: ["--no-sandbox"],
	ignoreDefaultArgs: ["--disable-back-forward-cache"],
});
try {
	const context = await browser.newContext({ serviceWorkers: "allow" });
	const first = await context.newPage();
	await first.goto(origin);
	await first.waitForFunction(
		() => navigator.serviceWorker.controller !== null,
	);
	await first.waitForFunction(() => "pwaTest" in window);
	assert.equal(
		await first.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"1",
		"first control of the matching build needs no reload",
	);
	const second = await context.newPage();
	await second.goto(origin);
	await second.waitForFunction(() => "pwaTest" in window);
	const hostPage = await context.newPage();
	for (const path of ["/consent", "/device", "/apps", "/apps/connections"]) {
		const response = await hostPage.goto(`${origin}${path}`);
		assert.equal(response?.status(), 200, path);
		assert.equal(response?.fromServiceWorker(), false, path);
		assert.equal(await hostPage.locator("h1").textContent(), path);
		assert.equal(
			await hostPage.evaluate(() => !!navigator.serviceWorker.controller),
			true,
		);
	}
	for (const path of [
		"/icons/missing.png",
		"/assets/missing.js",
		"/missing.webmanifest",
		"/missing-sw.js",
	]) {
		const response = await hostPage.goto(`${origin}${path}`);
		assert.equal(response?.status(), 404, path);
		assert.equal(response?.fromServiceWorker(), false, path);
		assert.equal(await hostPage.locator("body").textContent(), "Not found");
		assert.equal(
			await hostPage.evaluate(() => !!navigator.serviceWorker.controller),
			true,
		);
	}
	await hostPage.close();
	await context.setOffline(true);
	for (const page of [first, second]) {
		assert.deepEqual(
			await page.evaluate(
				async (urls) =>
					Promise.all(urls.map(async (url) => (await fetch(`/${url}`)).ok)),
				assets,
			),
			assets.map(() => true),
		);
	}
	const lazyRoute = assets.find((file) => file.startsWith("assets/accounts-"));
	assert.ok(lazyRoute);
	assert.equal(
		await second.evaluate(
			async (url) => Object.keys(await import(`/${url}`)).length > 0,
			lazyRoute,
		),
		true,
	);
	const navigation = await second.goto(`${origin}/settings/accounts`);
	assert.equal(navigation?.status(), 200);
	await second.waitForFunction(() => "pwaTest" in window);
	// Authentication and private endpoints must still fail offline.
	assert.equal(
		await second.evaluate(async () => {
			try {
				await fetch("/api/config");
				return true;
			} catch {
				return false;
			}
		}),
		false,
	);
	await context.setOffline(false);
	await second.goto(`${origin}/mail/outbox/compose/draft-one`);
	await second.locator("[data-subject-field]").waitFor();
	let reloadsFirst = 0;
	let reloadsSecond = 0;
	first.on("load", () => {
		reloadsFirst++;
	});
	second.on("load", () => {
		reloadsSecond++;
	});
	// A second deployment has its own shell cache and a different worker script.
	await promisify(execFile)(
		process.execPath,
		[
			join(dirname(dist), "node_modules/vite/bin/vite.js"),
			"build",
			"--outDir",
			"dist-next",
		],
		{
			cwd: dirname(dist),
			env: { ...process.env, REMIT_TEST_COMMIT: "consumer-pwa-v2" },
			maxBuffer: 4 * 1024 * 1024,
		},
	);
	serving = join(dirname(dist), "dist-next");
	await first.evaluate(async () => {
		const registration = await navigator.serviceWorker.getRegistration();
		window.pwaRegistration = registration;
		await registration?.update();
	});
	await first.waitForFunction(() => !!window.pwaRegistration?.waiting);
	await first.evaluate(async () =>
		(await navigator.serviceWorker.getRegistration())?.waiting?.postMessage(
			"remit:check-update",
		),
	);
	await second
		.locator("[data-subject-field]")
		.fill("The edit just before closing");
	await second.getByRole("button", { name: "Close", exact: true }).click();
	await second.locator("[data-subject-field]").waitFor({ state: "detached" });
	await first.evaluate(async () =>
		(await navigator.serviceWorker.getRegistration())?.waiting?.postMessage(
			"remit:check-update",
		),
	);
	await first.waitForTimeout(300);
	assert.equal(reloadsFirst, 0);
	assert.equal(reloadsSecond, 0);
	assert.equal(savedSubject, undefined);
	await first.waitForTimeout(2000);
	assert.equal(pendingSubject, "The edit just before closing");
	assert.equal(savedSubject, undefined);
	assert.equal(reloadsSecond, 0, "an in-flight save must finish before reload");
	assert.ok(
		await first.evaluate(
			async () =>
				(await caches.keys()).filter((key) => key.startsWith("remit-shell-"))
					.length >= 2,
		),
	);
	// Neither a full nor an unavailable session store may strand a safe tab
	// after takeover. These overrides belong only to the old documents.
	await first.evaluate(() => {
		const setItem = Storage.prototype.setItem;
		Storage.prototype.setItem = function (key, value) {
			if (key.startsWith("remit.stale-build-reload:"))
				throw new DOMException("Session store is full", "QuotaExceededError");
			setItem.call(this, key, value);
		};
	});
	await second.evaluate(() => {
		Object.defineProperty(window, "sessionStorage", {
			configurable: true,
			get() {
				throw new DOMException("Session store is unavailable", "SecurityError");
			},
		});
	});
	finishSave();
	await first.evaluate(async () =>
		(await navigator.serviceWorker.getRegistration())?.waiting?.postMessage(
			"remit:check-update",
		),
	);
	await first.waitForFunction(
		() =>
			(window as unknown as { pwaTest: { version: string } }).pwaTest
				?.version === "consumer-pwa-v2",
	);
	await second.waitForFunction(
		() =>
			(window as unknown as { pwaTest: { version: string } }).pwaTest
				?.version === "consumer-pwa-v2",
	);
	assert.equal(savedSubject, "The edit just before closing");
	assert.equal(reloadsFirst, 1);
	assert.equal(reloadsSecond, 1);
	assert.equal(
		await first.evaluate(() => document.documentElement.inert),
		false,
	);
	assert.equal(
		await second.evaluate(() => document.documentElement.inert),
		false,
	);
	await context.close();

	// HTML A can finish booting after deployment B. The first claim must not
	// discard edits, and a chunk failure must recover even when update() is a no-op.
	serving = dist;
	const staleContext = await browser.newContext();
	await staleContext.addInitScript(() => {
		const register = navigator.serviceWorker.register.bind(
			navigator.serviceWorker,
		);
		navigator.serviceWorker.register = async (...args) => {
			await new Promise<void>((resolve) => {
				window.allowPwaRegistration = resolve;
			});
			return register(...args);
		};
	});
	const stale = await staleContext.newPage();
	await stale.goto(origin);
	await stale.waitForFunction(
		() => !!window.allowPwaRegistration && !!window.pwaTest,
	);
	await stale.waitForLoadState("networkidle");
	await stale.evaluate(() => {
		window.pwaTest.dirty = true;
	});
	serving = join(dirname(dist), "dist-next");
	await stale.evaluate(() => window.allowPwaRegistration?.());
	await stale.waitForFunction(() => !!navigator.serviceWorker.controller);
	assert.equal(
		await stale.evaluate(() => window.pwaTest.version),
		"consumer-pwa-v1",
	);
	await stale.evaluate(() => window.pwaTest.loadProbe());
	const probe = assets.find((file) => file.startsWith("assets/lazy-probe-"));
	assert.ok(
		probe && missingStatic.has(`/${probe}`),
		`the old lazy chunk must actually fail against deployment B: ${JSON.stringify({ probe, missing: [...missingStatic], document: await stale.evaluate(() => window.pwaTest.version), caches: await stale.evaluate(() => caches.keys()) })}`,
	);
	assert.equal(
		await stale.evaluate(
			async () => !!(await navigator.serviceWorker.getRegistration())?.waiting,
		),
		false,
	);
	assert.equal(
		await stale.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"1",
	);
	await stale.evaluate(() => {
		window.pwaTest.dirty = false;
	});
	await stale.waitForFunction(
		() => window.pwaTest?.version === "consumer-pwa-v2",
	);
	assert.equal(
		await stale.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"2",
	);
	await staleContext.close();

	// Restore the same dirty document from BFCache. Its resumed scheduler must
	// activate the waiting worker once the draft is safe.
	serving = dist;
	const restoredContext = await browser.newContext();
	const restored = await restoredContext.newPage();
	const diagnostics = await restoredContext.newCDPSession(restored);
	await diagnostics.send("Page.enable");
	diagnostics.on("Page.backForwardCacheNotUsed", (event) =>
		console.log("BFCache not restored:", JSON.stringify(event)),
	);
	await restored.goto(origin);
	await restored.waitForFunction(
		() => !!navigator.serviceWorker.controller && !!window.pwaTest,
	);
	assert.equal(
		await restored.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"1",
	);
	await restored.evaluate(() => {
		window.pwaTest.dirty = true;
		window.addEventListener("pageshow", (event) => {
			if (event.persisted) console.debug("remit-test:bfcache-restored");
		});
	});
	const other = await restoredContext.newPage();
	// Keep the old worker in use without a second coordinator's polling. This
	// clean client votes, but only the restored document can initiate a retry.
	await other.goto(`${origin}/auth/bfcache-away`);
	await other.evaluate(() => {
		navigator.serviceWorker.addEventListener("message", (event) => {
			if (
				event.data === "remit:prepare-update" ||
				event.data === "remit:commit-update"
			)
				event.ports[0]?.postMessage(true);
		});
	});
	serving = join(dirname(dist), "dist-next");
	await other.evaluate(async () => {
		window.pwaRegistration = await navigator.serviceWorker.getRegistration();
		await window.pwaRegistration?.update();
	});
	await other.waitForFunction(() => !!window.pwaRegistration?.waiting);
	await restored.goto(
		`${origin.replace("127.0.0.1", "localhost")}/auth/bfcache-away`,
	);
	// BFCache emits pageshow, not load. Wait outside the renderer until that
	// event, so a CDP evaluation cannot evict a still-frozen document.
	const shown = restored.waitForEvent("console", {
		predicate: (message) => message.text() === "remit-test:bfcache-restored",
	});
	await restored.goBack({ waitUntil: "commit" });
	await shown;
	assert.equal(await restored.evaluate(() => window.pwaTest.restored), true);
	assert.equal(
		await restored.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"1",
		"BFCache must restore the original document",
	);
	assert.equal(await restored.evaluate(() => window.pwaTest.dirty), true);
	// Drain votes from before suspension (reply timeout: 1500 ms) while this
	// document still vetoes activation. Only its resumed checks can retry.
	await restored.waitForTimeout(2000);
	assert.equal(
		await restored.evaluate(
			async () => !!(await navigator.serviceWorker.getRegistration())?.waiting,
		),
		true,
	);
	await restored.evaluate(() => {
		window.pwaTest.dirty = false;
	});
	await restored.waitForFunction(
		() => window.pwaTest?.version === "consumer-pwa-v2",
	);
	assert.equal(
		await restored.evaluate(() => sessionStorage.getItem("pwa-loads")),
		"2",
	);
	await restoredContext.close();
	console.log(
		"PWA consumer OK: offline chunks, deferred composer save, unavailable/full session storage, stale first control, BFCache restoration, one reload.",
	);
} finally {
	await browser.close();
	await new Promise<void>((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve())),
	);
}
