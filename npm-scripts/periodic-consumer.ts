import assert from "node:assert/strict";
import { chromium, type Page, type Worker } from "playwright";

interface PeriodicControls {
	inboxes(
		inboxes: Record<
			string,
			{ ids: string[]; continuationToken?: string } | null
		>,
	): void;
	stopAdvertisingOversized(): void;
	holdBody(): { requested: Promise<void>; release(): void };
	session(status: number): void;
	contentRequests: string[];
	inboxRequests: string[];
}

function refresh(worker: Worker): Promise<void> {
	return worker.evaluate(async () => {
		const event = new Event("periodicsync");
		let completion: Promise<unknown> | undefined;
		Object.assign(event, {
			tag: "remit-refresh-downloads",
			waitUntil(promise: Promise<unknown>) {
				completion = promise;
			},
		});
		self.dispatchEvent(event);
		if (!completion) throw new Error("Periodic event was not handled");
		await completion;
	});
}

function settleOfflineWrites(page: Page): Promise<void> {
	return page.evaluate(() =>
		navigator.locks.request("remit-offline-storage", () => {}),
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
		const eligible = async (path = "/downloads") => {
			const page = await context.newPage();
			await page.addInitScript(() =>
				localStorage.removeItem("periodic-registration"),
			);
			await page.goto(`${origin}${path}`);
			await page.waitForFunction(
				() =>
					!!localStorage.getItem("periodic-registration") &&
					!!navigator.serviceWorker.controller &&
					!!window.pwaTest.offline()?.state.verified,
			);
			await settleOfflineWrites(page);
			return page;
		};
		const inbox = (ids: string[], continuationToken?: string) =>
			controls.inboxes({ "periodic-inbox": { ids, continuationToken } });
		inbox(["saved-first"], "saved-tail");
		const page = await eligible("/mail/periodic-inbox");
		await page.getByText("Saved first page", { exact: true }).waitFor();
		await page.getByText("Saved older page", { exact: true }).waitFor();
		await settleOfflineWrites(page);
		const worker = context.serviceWorkers()[0];
		assert.ok(worker);
		await page.close();

		const bodyPath = (id: string) => `/content/${id}/body`;
		const contentSince = async () => {
			const start = controls.contentRequests.length;
			await refresh(worker);
			return controls.contentRequests.slice(start);
		};
		const assertDownloaded = async (id: string) => {
			await context.setOffline(true);
			const downloaded = await open(`/downloads/${id}`);
			await downloaded
				.frameLocator('iframe[title="Email content"]')
				.getByText("Background downloaded body", { exact: true })
				.waitFor();
			await downloaded.close();
			await context.setOffline(false);
		};
		const messages = [
			"deleted-mail",
			"unavailable-202",
			"unavailable-403",
			"unavailable-404",
			"failed-mail",
			"oversized-mail",
			"background-mail",
		];
		inbox(messages, "saved-tail");
		controls.session(403);
		assert.deepEqual(await contentSince(), []);
		await context.setOffline(true);
		const locked = await open();
		await locked.waitForFunction(
			() => window.pwaTest.offline()?.state.needsLogin,
		);
		await locked.close();
		await context.setOffline(false);
		controls.session(200);
		await (await eligible()).close();

		const unavailable = messages.slice(1, 5).map(bodyPath);
		assert.deepEqual(await contentSince(), [
			...unavailable,
			bodyPath("background-mail"),
		]);
		await assertDownloaded("background-mail");
		controls.stopAdvertisingOversized();
		assert.deepEqual(await contentSince(), unavailable);

		inbox(["gap-head"], "gap-tail");
		await refresh(worker);
		await context.setOffline(true);
		const saved = await open("/mail/periodic-inbox");
		await saved.getByText("New background mail", { exact: true }).waitFor();
		await saved.getByText("Saved older page", { exact: true }).waitFor();
		assert.equal(
			await saved.getByText("Saved first page", { exact: true }).count(),
			0,
		);
		assert.equal(
			await saved
				.getByText("Incompatible worker head", { exact: true })
				.count(),
			0,
		);
		await saved.goto(`${origin}/downloads`);
		await saved
			.getByRole("link", { name: "Incompatible worker head", exact: true })
			.waitFor();
		await saved.close();
		await context.setOffline(false);

		const mailboxes = [
			"periodic-inbox",
			"periodic-inbox-2",
			"periodic-inbox-3",
		];
		const each = mailboxes.map((mailbox) =>
			Array.from({ length: 6 }, (_, i) => `${mailbox}-mail-${i + 1}`),
		);
		controls.inboxes(
			Object.fromEntries(
				mailboxes.map((mailbox, i) => [mailbox, { ids: each[i] }]),
			),
		);
		let beforeInbox = controls.inboxRequests.length;
		assert.deepEqual(
			await contentSince(),
			each.flatMap((ids) => ids.slice(0, 5).map(bodyPath)),
		);
		assert.deepEqual(controls.inboxRequests.slice(beforeInbox), mailboxes);
		beforeInbox = controls.inboxRequests.length;
		assert.deepEqual(
			await contentSince(),
			[each[1][5], each[2][5], each[0][5]].map(bodyPath),
		);
		assert.deepEqual(controls.inboxRequests.slice(beforeInbox), [
			mailboxes[1],
			mailboxes[2],
			mailboxes[0],
		]);

		controls.inboxes({
			"periodic-inbox": null,
			"periodic-inbox-2": { ids: ["after-account-error"] },
		});
		beforeInbox = controls.inboxRequests.length;
		assert.deepEqual(await contentSince(), [bodyPath("after-account-error")]);
		assert.deepEqual(
			controls.inboxRequests.slice(beforeInbox),
			mailboxes.slice(0, 2),
		);
		await assertDownloaded("after-account-error");

		inbox(["held-mail"]);
		for (const action of ["opt-out", "wipe"] as const) {
			const optedIn = await eligible();
			const held = controls.holdBody();
			const completion = refresh(worker);
			try {
				await Promise.race([
					held.requested,
					completion.then(() => {
						throw new Error("Refresh never requested the held body");
					}),
				]);
				if (action === "opt-out") {
					const disabled = await open("/downloads?periodic=off");
					await disabled.waitForFunction(
						() => !localStorage.getItem("periodic-registration"),
					);
					await optedIn.evaluate(() => window.pwaTest.offline()?.verify());
					await settleOfflineWrites(optedIn);
					assert.equal(
						await optedIn.evaluate(() =>
							localStorage.getItem("periodic-registration"),
						),
						null,
					);
					await disabled.close();
				} else {
					await optedIn.evaluate(() =>
						window.pwaTest.offline()?.removeDownloads(),
					);
					assert.equal(
						await optedIn.evaluate(() =>
							localStorage.getItem("periodic-registration"),
						),
						null,
					);
					const rebound = await open("/downloads?periodic=off");
					await rebound.waitForFunction(
						() => !!window.pwaTest.offline()?.state.verified,
					);
					await rebound.close();
				}
			} finally {
				held.release();
				await completion;
			}
			await optedIn.close();
			await context.setOffline(true);
			const after = await open("/downloads/held-mail?periodic=off");
			await after
				.getByText("This message has not been downloaded.", { exact: true })
				.waitFor();
			assert.equal(
				await after.evaluate(() =>
					caches.match("/content/held-mail/body").then(Boolean),
				),
				false,
			);
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
	console.log(
		"Periodic packed consumer OK: Chromium rotates Inboxes, skips unavailable and oversized mail, and honors opt-out and wipe.",
	);
}
