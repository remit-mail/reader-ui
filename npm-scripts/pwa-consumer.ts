import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";
import { chromium, firefox } from "playwright";
import type { OfflineRuntime } from "../packages/web-client/src/lib/offline-runtime.ts";
import {
	makeAccount,
	makeConfig,
	makeMailbox,
	makeThreadMessage,
	makeUserSettings,
} from "../packages/web-client/src/test-support/fixtures.ts";
import { testOfflineReading } from "./offline-consumer.ts";
import { testPeriodicReading } from "./periodic-consumer.ts";

declare global {
	interface Window {
		pwaTest: {
			dirty: boolean;
			offline: () => OfflineRuntime | undefined;
			reauthentications: number;
			latePersist?: () => Promise<string>;
			slowSave?: Promise<string>;
			slowImageSave?: Promise<string>;
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
let failInstall = false;
let briefProbe = true;
let failingPeriodicAccount = false;
let periodicInbox: { ids: string[]; continuationToken?: string } | undefined;
const periodicDescriptions: string[] = [];
const periodicSubjects: Record<string, string> = {
	"saved-first": "Saved first page",
	"saved-tail": "Saved older page",
	"background-mail": "New background mail",
	"gap-head": "Incompatible worker head",
};
let heldPeriodicBody:
	| { status: number; requested(): void; released: Promise<void> }
	| undefined;
const oldCategoryRow = makeThreadMessage({
	messageId: "old-category-mail",
	threadId: "old-category-thread",
	mailboxId: "inbox",
	category: "marketing",
	subject: "Old category mail",
	sentDate: 0,
	isRead: true,
});
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
let tenant = "tenant-a";
let sessionStatus: number | "malformed" = 200;
const contentRequests: string[] = [];
const imageProxyRequests: string[] = [];
let imageSlowReady!: () => void;
const slowImageRequested = new Promise<void>((resolve) => {
	imageSlowReady = resolve;
});
let releaseSlowImage!: () => void;
const slowImageGate = new Promise<void>((resolve) => {
	releaseSlowImage = resolve;
});
let attachmentExpired = false;
let inlineReady!: () => void;
const inlineGate = new Promise<void>((resolve) => {
	inlineReady = resolve;
});
let slowReady!: () => void;
const slowRequested = new Promise<void>((resolve) => {
	slowReady = resolve;
});
let releaseSlow!: () => void;
const slowGate = new Promise<void>((resolve) => {
	releaseSlow = resolve;
});
const part = (
	messageId: string,
	path: string,
	mediaType: string,
	mediaSubtype: string,
	extra = {},
) => ({
	bodyPartId: path,
	partPath: path,
	mediaType,
	mediaSubtype,
	isMultipart: false,
	sizeOctets: 32,
	contentUrl: `/content/${messageId}/${path}?signature=${attachmentExpired ? "renewed" : "expired"}`,
	...extra,
});
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
	} else if (path.startsWith("/content/")) {
		contentRequests.push(path);
		response.setHeader("X-Remit-Partition", tenant);
		response.setHeader("Cache-Control", "private, max-age=3600");
		response.setHeader("Content-Security-Policy", "sandbox");
		const unavailableBody = /^\/content\/unavailable-(202|403|404)\/body$/.exec(
			path,
		);
		if (unavailableBody) {
			response.writeHead(Number(unavailableBody[1])).end();
		} else if (path === "/content/multi-chunk-mail/body") {
			response.setHeader("Content-Type", "text/html");
			const chunk = Buffer.alloc(256 * 1024, "x");
			for (let index = 0; index < 41; index++) response.write(chunk);
			response.end();
		} else if (path === "/content/failed-mail/body") {
			response.writeHead(500).end();
		} else if (path === "/content/held-mail/body") {
			const held = heldPeriodicBody;
			held?.requested();
			await held?.released;
			response.statusCode = held?.status ?? 200;
			response.setHeader("Content-Type", "text/html");
			response.end("<p>Held background body</p>");
		} else if (
			[
				"/content/background-mail/body",
				"/content/gap-head/body",
				"/content/after-budget/body",
				"/content/after-pending/body",
				"/content/after-account-error/body",
			].includes(path)
		) {
			response.setHeader("Content-Type", "text/html");
			response.end("<p>Background downloaded body</p>");
		} else if (path.endsWith("/html")) {
			response.setHeader("Content-Type", "text/html");
			response.end(
				'<p>Old downloaded body</p><img alt="first inline" src="cid:one"><img alt="second inline" src="cid:two"><!-- <img src="cid:unused"> --><script>"<img src=cid:unused>"</script><img alt="remote image" src="https://tracking.invalid/pixel?token=one">',
			);
		} else if (path.endsWith("/inline-a") || path.endsWith("/inline-b")) {
			if (path.endsWith("/inline-a")) await inlineGate;
			else inlineReady();
			response.setHeader("Content-Type", "image/png");
			response.end(
				Buffer.from(
					"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
					"base64",
				),
			);
		} else if (path.endsWith("/attachment")) {
			if (!attachmentExpired) {
				attachmentExpired = true;
				response.writeHead(403, { "x-remit-403-reason": "expired" });
				response.end("Expired signature");
			} else {
				response.setHeader("Content-Type", "application/pdf");
				response.end("Offline attachment bytes\n");
			}
		} else if (path.endsWith("/slow")) {
			slowReady();
			await slowGate;
			response.setHeader("Content-Type", "text/plain");
			response.end("Late private bytes");
		} else if (path.endsWith("/quota")) {
			response.setHeader("Content-Type", "text/plain");
			response.end("Quota probe");
		} else {
			response.writeHead(500);
			response.end("Unused CID must never be fetched");
		}
	} else if (path === "/api/image-proxy") {
		assert.equal(request.method, "POST");
		assert.equal(request.headers["content-type"], "text/plain;charset=UTF-8");
		const chunks: Buffer[] = [];
		for await (const chunk of request) chunks.push(Buffer.from(chunk));
		const destination = Buffer.concat(chunks).toString("utf8");
		imageProxyRequests.push(destination);
		response.setHeader("X-Remit-Partition", tenant);
		if (destination.endsWith("token=slow")) {
			imageSlowReady();
			await slowImageGate;
		}
		response.setHeader("Content-Type", "image/png");
		response.setHeader("Cache-Control", "private, max-age=3600");
		response.end(
			Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
				"base64",
			),
		);
	} else if (path.startsWith("/api/")) {
		response.setHeader("Content-Type", "application/json");
		if (!path.startsWith("/api/auth/") && path !== "/api/session")
			response.setHeader("X-Remit-Partition", tenant);
		if (path === "/api/session") {
			response.setHeader("Cache-Control", "no-store");
			if (sessionStatus === "malformed") {
				response.end("{");
				return;
			}
			response.statusCode = sessionStatus;
			response.end(
				JSON.stringify(
					sessionStatus === 200
						? { partitionKey: tenant }
						: { error: "Session unavailable" },
				),
			);
		} else if (
			failingPeriodicAccount &&
			path === "/api/accounts/failed-account/mailboxes"
		) {
			response.writeHead(500).end();
		} else if (
			periodicInbox &&
			[
				"/api/accounts/acc-1/mailboxes",
				"/api/accounts/resumed-account/mailboxes",
			].includes(path)
		) {
			response.end(
				JSON.stringify({
					items: [
						makeMailbox({
							mailboxId: "periodic-inbox",
							fullPath: "Appointed Inbox",
						}),
						makeMailbox({ mailboxId: "other-inbox", fullPath: "INBOX" }),
					],
				}),
			);
		} else if (
			periodicInbox &&
			path === "/api/mailboxes/periodic-inbox/threads"
		) {
			const cursor = new URL(request.url!, "http://localhost").searchParams.get(
				"continuationToken",
			);
			const ids =
				cursor === "saved-tail"
					? ["saved-tail"]
					: cursor
						? []
						: periodicInbox.ids;
			const continuationToken = cursor
				? undefined
				: periodicInbox.continuationToken;
			response.end(
				JSON.stringify({
					items: ids.map((messageId) =>
						makeThreadMessage({
							messageId,
							threadId: messageId,
							mailboxId: "periodic-inbox",
							subject: periodicSubjects[messageId] ?? messageId,
						}),
					),
					continuationToken,
					hasMore: !!continuationToken,
				}),
			);
		} else if (path === "/api/threads/old-category-thread/messages") {
			response.end(JSON.stringify({ items: [oldCategoryRow], hasMore: false }));
		} else if (path === "/api/threads" && briefProbe) {
			const query = new URL(request.url!, "http://localhost").searchParams;
			const matches = query.getAll("category").includes("marketing");
			response.end(
				JSON.stringify({
					items:
						matches && query.get("results") !== "false" ? [oldCategoryRow] : [],
					count: matches ? 1 : 0,
					hasMore: false,
				}),
			);
		} else if (path.startsWith("/api/auth/")) response.end("null");
		else if (path.startsWith("/api/messages/")) {
			const messageId = path.split("/").at(-1)!;
			if (periodicInbox) periodicDescriptions.push(messageId);
			if (messageId === "deleted-mail") {
				response.writeHead(404).end();
				return;
			}
			response.end(
				JSON.stringify({
					message: { messageId, mailboxId: "inbox", status: "active" },
					envelope: {
						messageId,
						subject:
							messageId === "old-mail"
								? "Old retained mail"
								: (periodicSubjects[messageId] ?? "New list page"),
						date: 0,
						from: [],
						to: [],
						cc: [],
						bcc: [],
						replyTo: [],
						sender: [],
					},
					flags: [],
					references: [],
					bodyParts:
						messageId === "old-mail"
							? [
									part(messageId, "html", "TEXT", "HTML"),
									part(messageId, "inline-a", "IMAGE", "PNG", {
										contentId: "<one>",
									}),
									part(messageId, "inline-b", "IMAGE", "PNG", {
										contentId: "two",
									}),
									part(messageId, "unused", "IMAGE", "PNG", {
										contentId: "unused",
									}),
									part(messageId, "attachment", "APPLICATION", "PDF", {
										disposition: "attachment",
										dispositionFilename: "report.pdf",
									}),
								]
							: periodicInbox?.ids.includes(messageId) &&
									!messageId.startsWith("pending-")
								? [
										part(messageId, "body", "TEXT", "HTML", {
											contentUrl: `/content/${messageId}/body`,
											...(messageId === "oversized-mail"
												? { sizeOctets: 10 * 1024 * 1024 + 1 }
												: {}),
										}),
									]
								: [],
				}),
			);
		} else if (path === "/api/config")
			response.end(
				JSON.stringify(
					makeConfig(
						[
							...(failingPeriodicAccount
								? [makeAccount({ accountId: "failed-account" })]
								: []),
							makeAccount({
								accountId: failingPeriodicAccount ? "resumed-account" : "acc-1",
								folderAppointments: periodicInbox
									? [
											{
												role: "Inbox",
												mailboxId: "periodic-inbox",
												source: "Appointed",
											},
										]
									: [],
							}),
						],
						{
							buildCommit:
								serving === dist ? "consumer-pwa-v1" : "consumer-pwa-v2",
						},
					),
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
	} else if (path === "/sw.js" && failInstall) {
		response.setHeader("Content-Type", "application/javascript");
		response.end(
			`${readFileSync(file, "utf8")}\nself.addEventListener("install", event => event.waitUntil(Promise.reject(new Error("Install failure probe"))));`,
		);
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
const firefoxBrowser = await firefox.launch();
try {
	const context = await firefoxBrowser.newContext();
	const page = await context.newPage();
	const threadRequests: string[] = [];
	page.on("request", (request) => {
		if (new URL(request.url()).pathname === "/api/threads")
			threadRequests.push(request.url());
	});
	page.on("console", (message) => console.log("Firefox:", message.text()));
	page.on("pageerror", (error) =>
		console.log("Firefox page error:", error.message),
	);
	await page.goto(`${origin}/mail/brief`);
	await page.waitForFunction(
		() => navigator.serviceWorker.controller !== null,
		null,
		{ timeout: 30_000 },
	);
	await page.waitForLoadState("networkidle");
	assert.equal(
		threadRequests.length,
		16,
		"eight section pages and eight counts",
	);
	assert.equal(
		new Set(threadRequests).size,
		16,
		"no duplicate thread requests",
	);
	await page.evaluate(() =>
		navigator.serviceWorker.dispatchEvent(new Event("controllerchange")),
	);
	await page.waitForLoadState("networkidle");
	assert.equal(
		threadRequests.length,
		16,
		"controllerchange must not refetch the brief",
	);
	await page.getByText("Old category mail", { exact: true }).click();
	await page.waitForURL("**/mail/brief/old-category-thread/old-category-mail");
	await page
		.getByRole("heading", { name: "Old category mail", exact: true })
		.waitFor();
	assert.equal(
		threadRequests.length,
		16,
		"selecting old mail needs no second listing",
	);
	console.log("Firefox PWA installation and old category selection OK");

	const downloads = await context.newPage();
	await downloads.addInitScript(() => {
		localStorage.setItem("pwa-offline-test", "yes");
		localStorage.setItem("pwa-auth", "better");
		const matchMedia = window.matchMedia.bind(window);
		window.matchMedia = (query) =>
			query === "(display-mode: standalone)"
				? Object.defineProperty(matchMedia(query), "matches", { value: true })
				: matchMedia(query);
	});
	const downloadIssues: string[] = [];
	downloads.on("console", (message) => {
		if (["error", "warning"].includes(message.type()))
			downloadIssues.push(message.text());
	});
	downloads.on("pageerror", (error) => downloadIssues.push(error.message));
	await downloads.goto(`${origin}/downloads`);
	await downloads
		.getByRole("heading", { name: "Downloaded mail", exact: true })
		.waitFor();
	await downloads.waitForFunction(() => !!navigator.serviceWorker.controller);
	await downloads.waitForLoadState("networkidle");
	assert.deepEqual(downloadIssues, []);
	console.log("Firefox opens Downloaded mail silently in standalone display");
	await context.close();
	briefProbe = false;

	failInstall = true;
	const failedContext = await firefoxBrowser.newContext();
	const failed = await failedContext.newPage();
	await failed.addInitScript(() => {
		localStorage.setItem("pwa-offline-test", "yes");
	});
	const warnings: string[] = [];
	const errors: string[] = [];
	failed.on("console", (message) => {
		if (message.text().startsWith("Service worker unavailable"))
			warnings.push(message.text());
	});
	failed.on("pageerror", (error) => errors.push(error.message));
	const warned = failed.waitForEvent("console", {
		predicate: (message) =>
			message.text().startsWith("Service worker unavailable"),
		timeout: 30_000,
	});
	await Promise.all([failed.goto(`${origin}/downloads/old-mail`), warned]);
	await failed.waitForFunction(() => !!window.pwaTest);
	await failed.waitForFunction(
		() => !!window.pwaTest.offline()?.state.verified,
	);
	await failed.getByRole("heading", { name: "Old retained mail" }).waitFor();
	await failed
		.frameLocator('iframe[title="Email content"]')
		.getByText("Old downloaded body", { exact: true })
		.waitFor();
	await failed.getByRole("button", { name: "Load once", exact: true }).click();
	await failed.waitForFunction(() => {
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
	const downloaded = failed.waitForEvent("download");
	await failed
		.getByRole("button", { name: "Download report.pdf", exact: true })
		.click();
	const download = await downloaded;
	assert.equal(download.suggestedFilename(), "report.pdf");
	const attachmentPath = await download.path();
	assert.ok(attachmentPath);
	assert.equal(
		readFileSync(attachmentPath, "utf8"),
		"Offline attachment bytes\n",
	);
	assert.doesNotMatch(
		await failed.locator("body").innerText(),
		/Reload after offline support finishes installing/,
	);
	assert.equal(warnings.length, 1);
	assert.deepEqual(errors, []);
	assert.equal(await failed.getByTestId("fatal-error-overlay").count(), 0);
	assert.equal(
		await failed.evaluate(() => document.documentElement.inert),
		false,
	);
	assert.equal(
		await failed.evaluate(() => navigator.serviceWorker.controller),
		null,
	);
	assert.deepEqual(errors, []);
	assert.equal(await failed.getByTestId("fatal-error-overlay").count(), 0);
	await failedContext.close();
	contentRequests.length = 0;
	imageProxyRequests.length = 0;
	attachmentExpired = false;
	failInstall = false;
	console.log(
		"Firefox failed install OK: usable app, one warning, no unhandled rejection or fatal",
	);
} finally {
	await firefoxBrowser.close();
}
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
	await testPeriodicReading(origin, {
		messages: (ids, continuationToken) => {
			periodicInbox = { ids, continuationToken };
		},
		holdBody: (status = 200) => {
			const requested = Promise.withResolvers<void>();
			const released = Promise.withResolvers<void>();
			heldPeriodicBody = {
				status,
				requested: requested.resolve,
				released: released.promise,
			};
			return {
				requested: requested.promise,
				release: () => {
					released.resolve();
					heldPeriodicBody = undefined;
				},
			};
		},
		session: (status) => {
			sessionStatus = status;
		},
		contentRequests,
		descriptionRequests: periodicDescriptions,
		failedAccount: (fail) => {
			failingPeriodicAccount = fail;
		},
	});
	periodicInbox = undefined;
	await testOfflineReading(origin, {
		setSession: (key, status = 200) => {
			tenant = key;
			sessionStatus = status;
		},
		contentRequests,
		imageProxyRequests,
		slowImageRequested,
		releaseSlowImage,
		slowRequested,
		releaseSlow,
	});
	console.log(
		"PWA consumer OK: offline chunks, deferred composer save, unavailable/full session storage, stale first control, BFCache restoration, one reload.",
	);
} finally {
	inlineReady();
	releaseSlowImage();
	releaseSlow();
	finishSave();
	await browser.close();
	await new Promise<void>((resolve, reject) =>
		server.close((error) => (error ? reject(error) : resolve())),
	);
}
