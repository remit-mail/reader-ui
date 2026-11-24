import assert from "node:assert/strict";
import { threadOperationsListThreadsQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { chromium, firefox, type Page, type Worker } from "playwright";
import { makeThreadMessage } from "../packages/web-client/src/test-support/fixtures.ts";

interface PeriodicControls {
	messages(ids: string[]): void;
	holdBody(): { requested: Promise<void>; release(): void };
	session(status: number): void;
	contentRequests: string[];
}

function refresh(worker: Worker): Promise<void> {
	return worker.evaluate(async () => {
		const event = new Event("periodicsync");
		let completion: Promise<unknown> | undefined;
		Object.defineProperties(event, {
			tag: { value: "remit-refresh-downloads" },
			waitUntil: {
				value(promise: Promise<unknown>) {
					completion = promise;
				},
			},
		});
		self.dispatchEvent(event);
		if (!completion) throw new Error("Periodic event was not handled");
		await completion;
	});
}

async function seedSavedInbox(page: Page): Promise<void> {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const mailboxId = "periodic-inbox";
	const key = threadOperationsListThreadsQueryKey({
		baseUrl: "/api",
		path: { mailboxId },
		query: { order: "desc" },
	});
	client.setQueryData(key, {
		pages: [
			{
				items: [
					makeThreadMessage({
						mailboxId,
						messageId: "saved-first",
						threadId: "saved-first",
						subject: "Saved first page",
					}),
				],
				continuationToken: "saved-tail",
			},
			{
				items: [
					makeThreadMessage({
						mailboxId,
						messageId: "saved-tail",
						threadId: "saved-tail",
						subject: "Saved older page",
					}),
				],
			},
		],
		pageParams: [undefined, "saved-tail"],
	});
	const clientState = dehydrate(client);
	client.clear();
	await page.evaluate(async (clientState) => {
		const runtime = window.pwaTest.offline();
		const partition = runtime?.state.partition;
		if (!runtime || !partition)
			throw new Error("Offline partition unavailable");
		await runtime.persister(partition).persistClient({
			buster: String(partition.format),
			timestamp: Date.now(),
			clientState,
		});
	}, clientState);
}

async function assertNoHeldBody(page: Page): Promise<void> {
	await page
		.getByText("This message has not been downloaded.", { exact: true })
		.waitFor();
	await assert.rejects(
		page.evaluate(async () => {
			const runtime = window.pwaTest.offline();
			if (!runtime?.state.partition)
				throw new Error("Offline partition unavailable");
			await runtime.content("/content/held-mail/body", "text/html", () => {
				throw new Error("Unexpected network read");
			});
		}),
		/Session unverified/,
	);
}

export async function testPeriodicReading(
	origin: string,
	controls: PeriodicControls,
): Promise<void> {
	const browser = await chromium.launch({ args: ["--no-sandbox"] });
	try {
		const context = await browser.newContext({ serviceWorkers: "allow" });
		await context.addInitScript(() => {
			localStorage.setItem("pwa-offline-test", "yes");
			localStorage.setItem("pwa-auth", "better");
			const matchMedia = window.matchMedia.bind(window);
			window.matchMedia = (query) =>
				query === "(display-mode: standalone)"
					? Object.defineProperty(matchMedia(query), "matches", { value: true })
					: matchMedia(query);
			Object.defineProperty(
				ServiceWorkerRegistration.prototype,
				"periodicSync",
				{
					configurable: true,
					value: {
						async register(tag: string, options: { minInterval: number }) {
							localStorage.setItem(
								"periodic-registration",
								JSON.stringify({ tag, ...options }),
							);
						},
						async unregister() {
							localStorage.removeItem("periodic-registration");
						},
					},
				},
			);
			const query = navigator.permissions.query.bind(navigator.permissions);
			navigator.permissions.query = (descriptor) =>
				descriptor.name === ("periodic-background-sync" as PermissionName)
					? Promise.resolve({ state: "granted" } as PermissionStatus)
					: query(descriptor);
		});
		const open = async (path = "/downloads") => {
			const page = await context.newPage();
			await page.goto(`${origin}${path}`);
			return page;
		};
		const eligible = async () => {
			const page = await context.newPage();
			await page.addInitScript(() =>
				localStorage.removeItem("periodic-registration"),
			);
			await page.goto(`${origin}/downloads`);
			await page.waitForFunction(
				() =>
					!!localStorage.getItem("periodic-registration") &&
					!!navigator.serviceWorker.controller &&
					!!window.pwaTest.offline()?.state.verified,
			);
			await page.evaluate(() =>
				navigator.locks.request("remit-offline-storage", () => {}),
			);
			return page;
		};
		const page = await eligible();
		assert.deepEqual(
			await page.evaluate(() =>
				JSON.parse(localStorage.getItem("periodic-registration") ?? "null"),
			),
			{ tag: "remit-refresh-downloads", minInterval: 86400000 },
		);
		await seedSavedInbox(page);
		const worker = context.serviceWorkers()[0];
		assert.ok(worker);
		await page.close();

		controls.messages([
			"unavailable-202",
			"unavailable-403",
			"unavailable-404",
			"oversized-mail",
			"background-mail",
			"failed-mail",
		]);
		const before = controls.contentRequests.length;
		await refresh(worker);
		assert.deepEqual(controls.contentRequests.slice(before), [
			"/content/unavailable-202/body",
			"/content/unavailable-403/body",
			"/content/unavailable-404/body",
			"/content/oversized-mail/body",
		]);
		await refresh(worker);
		assert.deepEqual(controls.contentRequests.slice(before + 4), [
			"/content/unavailable-202/body",
			"/content/unavailable-403/body",
			"/content/unavailable-404/body",
			"/content/background-mail/body",
			"/content/failed-mail/body",
		]);
		await context.setOffline(true);
		const reopened = await open("/downloads/background-mail");
		await reopened
			.getByRole("heading", { name: "New background mail", exact: true })
			.waitFor();
		await reopened.waitForFunction(() =>
			document
				.querySelector<HTMLIFrameElement>('iframe[title="Email content"]')
				?.contentDocument?.body?.textContent?.includes(
					"Background downloaded body",
				),
		);
		await reopened.goto(`${origin}/mail/periodic-inbox`);
		await reopened.getByText("Saved first page", { exact: true }).waitFor();
		await reopened.getByText("Saved older page", { exact: true }).waitFor();
		await reopened.close();

		await context.setOffline(false);
		const renewed = await eligible();
		await renewed.close();
		controls.messages(["held-mail"]);
		controls.session(401);
		const beforeExpired = controls.contentRequests.length;
		try {
			await refresh(worker);
			assert.equal(controls.contentRequests.length, beforeExpired);
		} finally {
			controls.session(200);
		}
		await context.setOffline(true);
		const expired = await open();
		await expired.waitForFunction(
			() => window.pwaTest.offline()?.state.needsLogin,
		);
		await expired
			.getByRole("link", { name: "New background mail", exact: true })
			.waitFor();
		await expired.close();
		await context.setOffline(false);

		for (const action of ["opt-out", "wipe"] as const) {
			const optedIn = await eligible();
			const held = controls.holdBody();
			const completed = refresh(worker);
			try {
				await Promise.race([
					held.requested,
					completed.then(() => {
						throw new Error(
							"Periodic event finished before requesting the held body",
						);
					}),
				]);
				if (action === "opt-out") {
					await optedIn.close();
					const disabled = await open("/downloads?periodic=off");
					await disabled.waitForFunction(
						() => !localStorage.getItem("periodic-registration"),
					);
					await disabled.close();
				} else {
					await optedIn.evaluate(async () => {
						const runtime = window.pwaTest.offline();
						if (!runtime) throw new Error("Offline runtime unavailable");
						await runtime.removeDownloads();
					});
					await optedIn.close();
					const rebound = await open("/downloads?periodic=off");
					await rebound.waitForFunction(
						() => !!window.pwaTest.offline()?.state.verified,
					);
					await rebound.close();
				}
			} finally {
				held.release();
				await completed;
			}
			await context.setOffline(true);
			const after = await open("/downloads/held-mail?periodic=off");
			await assertNoHeldBody(after);
			const retained = after.getByRole("link", {
				name: "New background mail",
				exact: true,
			});
			if (action === "opt-out") await retained.waitFor();
			else assert.equal(await retained.count(), 0);
			await after.close();
			await context.setOffline(false);
		}
		await context.close();
	} finally {
		await browser.close();
	}
	const unsupported = await firefox.launch();
	try {
		const context = await unsupported.newContext();
		await context.addInitScript(() => {
			localStorage.setItem("pwa-offline-test", "yes");
			localStorage.setItem("pwa-auth", "better");
		});
		const page = await context.newPage();
		const issues: string[] = [];
		page.on("console", (message) => {
			if (["error", "warning"].includes(message.type()))
				issues.push(message.text());
		});
		page.on("pageerror", (error) => issues.push(error.message));
		await page.goto(`${origin}/downloads`);
		await page
			.getByRole("heading", { name: "Downloaded mail", exact: true })
			.waitFor();
		await page.waitForFunction(() => !!navigator.serviceWorker.controller);
		await page.waitForLoadState("networkidle");
		assert.deepEqual(issues, []);
		await context.close();
	} finally {
		await unsupported.close();
	}
	console.log(
		"Periodic packed consumer OK: Chromium downloads mail offline and guards wipe and opt-out. Firefox opens Downloaded mail silently.",
	);
}
