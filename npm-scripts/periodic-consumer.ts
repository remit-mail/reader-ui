import assert from "node:assert/strict";
import { chromium, firefox } from "playwright";

export async function testPeriodicReading(origin: string): Promise<void> {
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
						async unregister() {},
					},
				},
			);
			const query = navigator.permissions.query.bind(navigator.permissions);
			navigator.permissions.query = (descriptor) =>
				descriptor.name === ("periodic-background-sync" as PermissionName)
					? Promise.resolve({ state: "granted" } as PermissionStatus)
					: query(descriptor);
		});
		const page = await context.newPage();
		await page.goto(`${origin}/downloads`);
		await page.waitForFunction(
			() =>
				!!localStorage.getItem("periodic-registration") &&
				!!navigator.serviceWorker.controller,
		);
		assert.deepEqual(
			await page.evaluate(() =>
				JSON.parse(localStorage.getItem("periodic-registration") ?? "null"),
			),
			{ tag: "remit-refresh-downloads", minInterval: 86400000 },
		);
		const worker = context.serviceWorkers()[0];
		assert.ok(worker);
		await page.close();
		await worker.evaluate(async () => {
			const event = new Event("periodicsync");
			let completion: Promise<unknown> | undefined;
			Object.defineProperties(event, {
				tag: { value: "remit-refresh-downloads" },
				waitUntil: {
					value: (promise: Promise<unknown>) => {
						completion = promise;
					},
				},
			});
			self.dispatchEvent(event);
			if (!completion) throw new Error("Periodic event was not handled");
			await completion;
		});
		await context.setOffline(true);
		const reopened = await context.newPage();
		await reopened.goto(`${origin}/downloads/background-mail`);
		await reopened
			.getByRole("heading", { name: "New background mail", exact: true })
			.waitFor();
		await reopened.waitForFunction(() =>
			document
				.querySelector<HTMLIFrameElement>('iframe[title="Email content"]')
				?.contentDocument?.body.textContent?.includes(
					"Background downloaded body",
				),
		);
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
		await page.waitForFunction(
			() =>
				!!window.pwaTest.offline()?.state.verified &&
				!!navigator.serviceWorker.controller,
		);
		await page.waitForLoadState("networkidle");
		assert.equal(
			await page.evaluate(
				() => "periodicSync" in ServiceWorkerRegistration.prototype,
			),
			false,
		);
		assert.equal(
			await page.evaluate(async () => {
				const request = indexedDB.open("remit-offline");
				const db = await new Promise<IDBDatabase>((resolve) => {
					request.onsuccess = () => resolve(request.result);
				});
				try {
					return await new Promise<boolean>((resolve) => {
						const record = db
							.transaction("data")
							.objectStore("data")
							.get("periodic:config");
						record.onsuccess = () => resolve(record.result !== undefined);
					});
				} finally {
					db.close();
				}
			}),
			false,
		);
		assert.deepEqual(issues, []);
		await context.close();
	} finally {
		await unsupported.close();
	}
	console.log(
		"Periodic packed consumer OK: Chromium event downloads mail readable offline; Firefox remains silent.",
	);
}
