import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";

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
const server = createServer((request, response) => {
	const path = new URL(request.url ?? "/", "http://localhost").pathname;
	const file = join(serving, path === "/" ? "index.html" : path);
	response.setHeader("Cache-Control", "no-store");
	if (path === "/index.html") {
		response.writeHead(308, { Location: "/" });
		response.end();
	} else if (existsSync(file) && extname(file)) {
		response.setHeader(
			"Content-Type",
			types[extname(file)] ?? "application/octet-stream",
		);
		response.end(readFileSync(file));
	} else if (
		path.startsWith("/api/") ||
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
	args: ["--no-sandbox"],
});
try {
	const context = await browser.newContext({ serviceWorkers: "allow" });
	const first = await context.newPage();
	await first.goto(origin);
	await first.waitForFunction(
		() => navigator.serviceWorker.controller !== null,
	);
	await first.waitForFunction(() => "pwaTest" in window);
	const second = await context.newPage();
	await second.goto(origin);
	await second.waitForFunction(() => "pwaTest" in window);
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
	await second.evaluate(() => {
		const input = document.createElement("textarea");
		input.id = "unsaved-draft";
		input.value = "Keep my unsaved message";
		document.body.append(input);
		(window as unknown as { pwaTest: { dirty: boolean } }).pwaTest.dirty = true;
	});
	let reloadsFirst = 0;
	let reloadsSecond = 0;
	first.on("framenavigated", (frame) => {
		if (frame === first.mainFrame()) reloadsFirst++;
	});
	second.on("framenavigated", (frame) => {
		if (frame === second.mainFrame()) reloadsSecond++;
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
		await registration?.update();
	});
	await first.waitForFunction(
		async () => !!(await navigator.serviceWorker.getRegistration())?.waiting,
	);
	await first.evaluate(async () =>
		(await navigator.serviceWorker.getRegistration())?.waiting?.postMessage(
			"remit:check-update",
		),
	);
	await first.waitForTimeout(2000);
	assert.equal(reloadsFirst, 0);
	assert.equal(reloadsSecond, 0);
	assert.equal(
		await second.locator("#unsaved-draft").inputValue(),
		"Keep my unsaved message",
	);
	assert.ok(
		await first.evaluate(
			async () =>
				(await caches.keys()).filter((key) => key.startsWith("remit-shell-"))
					.length >= 2,
		),
	);
	await second.evaluate(() => {
		(window as unknown as { pwaTest: { dirty: boolean } }).pwaTest.dirty =
			false;
	});
	await first.evaluate(async () =>
		(await navigator.serviceWorker.getRegistration())?.waiting?.postMessage(
			"remit:check-update",
		),
	);
	await first.waitForFunction(
		() => sessionStorage.getItem("pwa-loads") === "2",
	);
	await second.waitForFunction(
		() => sessionStorage.getItem("pwa-loads") === "3",
	);
	assert.equal(reloadsFirst, 1);
	assert.equal(reloadsSecond, 1);
	await context.close();
	console.log(
		"PWA consumer OK: complete offline shell and lazy chunks; dirty tab veto; one reload per tab.",
	);
} finally {
	await browser.close();
	await new Promise<void>((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve())),
	);
}
