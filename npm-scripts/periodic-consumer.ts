import assert from "node:assert/strict";
import { chromium, type Page, type Worker } from "playwright";

interface PeriodicControls {
	messages(ids: string[], continuationToken?: string): void;
	holdBody(status?: number): { requested: Promise<void>; release(): void };
	session(status: number | "malformed"): void;
	contentRequests: string[];
	descriptionRequests: string[];
	accountRequests: string[];
	failedAccount(fail: boolean): void;
}

function refresh(worker: Worker, failSnapshot = false): Promise<void> {
	return worker.evaluate(async (failSnapshot) => {
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
		const put = IDBObjectStore.prototype.put;
		if (failSnapshot)
			IDBObjectStore.prototype.put = function (value, key) {
				if (typeof key === "string" && key.startsWith("queries:"))
					throw new DOMException(
						"Snapshot quota exhausted",
						"QuotaExceededError",
					);
				return put.call(this, value, key);
			};
		try {
			self.dispatchEvent(event);
			if (!completion) throw new Error("Periodic event was not handled");
			await completion;
		} finally {
			if (failSnapshot) IDBObjectStore.prototype.put = put;
		}
	}, failSnapshot);
}

function waitForHeldBody(requested: Promise<void>, completion: Promise<void>) {
	return Promise.race([
		requested,
		completion.then(() => {
			throw new Error(
				"Periodic event finished before requesting the held body",
			);
		}),
	]);
}

function settleOfflineWrites(page: Page): Promise<void> {
	return page.evaluate(() =>
		navigator.locks.request("remit-offline-storage", () => {}),
	);
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
							if (sessionStorage.getItem("fail-periodic-unregister"))
								throw new Error("Browser refused to unregister the tag");
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
		controls.messages(["saved-first"], "saved-tail");
		const page = await eligible("/downloads/background-mail");
		await page
			.getByText("This message has no body content.", { exact: true })
			.waitFor();
		assert.deepEqual(
			await page.evaluate(() =>
				JSON.parse(localStorage.getItem("periodic-registration") ?? "null"),
			),
			{ tag: "remit-refresh-downloads", minInterval: 86400000 },
		);
		await settleOfflineWrites(page);
		await page.goto(`${origin}/mail/periodic-inbox`);
		await page.getByText("Saved first page", { exact: true }).waitFor();
		await page.getByText("Saved older page", { exact: true }).waitFor();
		await settleOfflineWrites(page);
		const worker = context.serviceWorkers()[0];
		assert.ok(worker);
		await page.close();
		await context.setOffline(true);
		const retainedDescription = await open("/downloads/background-mail");
		await retainedDescription
			.getByText("This message has no body content.", { exact: true })
			.waitFor();
		await retainedDescription.close();
		await context.setOffline(false);

		controls.messages(
			[
				"deleted-mail",
				"unavailable-202",
				"unavailable-403",
				"unavailable-404",
				"oversized-mail",
				"background-mail",
				"background-mail",
				"failed-mail",
			],
			"saved-tail",
		);
		const before = controls.contentRequests.length;
		controls.session("malformed");
		try {
			await refresh(worker);
		} finally {
			controls.session(200);
		}
		await refresh(worker);
		assert.equal(
			controls.contentRequests.length,
			before,
			"malformed session backs off",
		);
		await (await eligible()).close();

		const beforeDescriptions = controls.descriptionRequests.length;
		await refresh(worker);
		assert.equal(
			controls.descriptionRequests
				.slice(beforeDescriptions)
				.filter((id) => id === "background-mail").length,
			2,
		);
		assert.deepEqual(controls.contentRequests.slice(before), [
			"/content/unavailable-202/body",
			"/content/unavailable-403/body",
			"/content/unavailable-404/body",
			"/content/background-mail/expired-body",
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
		await reopened.getByText("New background mail", { exact: true }).waitFor();
		await reopened.getByText("Saved older page", { exact: true }).waitFor();
		assert.equal(
			await reopened.getByText("Saved first page", { exact: true }).count(),
			0,
		);
		await reopened.close();

		await context.setOffline(false);
		const renewed = await eligible();
		await renewed.close();
		controls.messages(["gap-head"], "gap-tail");
		await refresh(worker);
		await context.setOffline(true);
		const gap = await open("/mail/periodic-inbox");
		await gap.getByText("New background mail", { exact: true }).waitFor();
		await gap.getByText("Saved older page", { exact: true }).waitFor();
		assert.equal(
			await gap.getByText("Incompatible worker head", { exact: true }).count(),
			0,
		);
		await gap.goto(`${origin}/downloads`);
		await gap
			.getByRole("link", { name: "Incompatible worker head", exact: true })
			.waitFor();
		await gap.close();
		await context.setOffline(false);

		const assertDownloaded = async (messageId: string) => {
			await context.setOffline(true);
			try {
				const downloaded = await open(`/downloads/${messageId}`);
				await downloaded
					.frameLocator('iframe[title="Email content"]')
					.getByText("Background downloaded body", { exact: true })
					.waitFor();
				await downloaded.close();
			} finally {
				await context.setOffline(false);
			}
		};

		controls.messages(["multi-chunk-mail", "after-budget"]);
		const beforeBudget = controls.contentRequests.length;
		await refresh(worker);
		assert.deepEqual(controls.contentRequests.slice(beforeBudget), [
			"/content/multi-chunk-mail/body",
		]);
		await refresh(worker);
		await assertDownloaded("after-budget");

		const pending = Array.from(
			{ length: 20 },
			(_, index) => `pending-${index}`,
		);
		controls.messages([...pending, "after-pending"]);
		const beforePending = controls.descriptionRequests.length;
		await refresh(worker);
		assert.deepEqual(
			controls.descriptionRequests.slice(beforePending),
			pending,
		);
		await refresh(worker);
		assert.deepEqual(
			controls.descriptionRequests.slice(
				beforePending + pending.length,
				beforePending + pending.length + 2,
			),
			["after-pending", pending[0]],
		);
		await assertDownloaded("after-pending");

		controls.failedAccount(true);
		try {
			controls.messages([]);
			await refresh(worker);
			const beforeAccount = controls.accountRequests.length;
			controls.messages(["after-account-error"]);
			await refresh(worker);
			assert.deepEqual(controls.accountRequests.slice(beforeAccount), [
				"/api/accounts/resumed-account/mailboxes",
				"/api/accounts/failed-account/mailboxes",
			]);
			await assertDownloaded("after-account-error");
		} finally {
			controls.failedAccount(false);
		}

		controls.messages(["held-mail"]);
		const stale = controls.holdBody(401);
		const staleRun = refresh(worker);
		try {
			await waitForHeldBody(stale.requested, staleRun);
			const reverified = await eligible();
			await reverified.close();
		} finally {
			stale.release();
			await staleRun;
		}
		await context.setOffline(true);
		const reverified = await open();
		await reverified
			.getByRole("heading", { name: "Downloaded mail", exact: true })
			.waitFor();
		assert.equal(
			await reverified.evaluate(
				() => window.pwaTest.offline()?.state.needsLogin,
			),
			false,
		);
		await reverified.close();
		await context.setOffline(false);

		const refused = controls.holdBody(401);
		const refusedRun = refresh(worker, true);
		try {
			await waitForHeldBody(refused.requested, refusedRun);
		} finally {
			refused.release();
			await refusedRun;
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
				await waitForHeldBody(held.requested, completed);
				if (action === "opt-out") {
					const disabled = await open("/downloads?periodic=off");
					await disabled.waitForFunction(
						() => !localStorage.getItem("periodic-registration"),
					);
					await optedIn.evaluate(async () => {
						const runtime = window.pwaTest.offline();
						if (!runtime) throw new Error("Offline runtime unavailable");
						await runtime.verify();
					});
					await settleOfflineWrites(optedIn);
					assert.equal(
						await optedIn.evaluate(() =>
							localStorage.getItem("periodic-registration"),
						),
						null,
					);
					await disabled.close();
				} else {
					const witness = await open();
					await witness.waitForFunction(
						() => !!window.pwaTest.offline()?.state.verified,
					);
					await optedIn.evaluate(async () => {
						const runtime = window.pwaTest.offline();
						if (!runtime) throw new Error("Offline runtime unavailable");
						sessionStorage.setItem("fail-periodic-unregister", "yes");
						await runtime.removeDownloads();
					});
					await witness.waitForFunction(
						() => !window.pwaTest.offline()?.state.partition,
					);
					await witness.close();
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
			await optedIn.close();
			await context.setOffline(false);
		}
		await context.close();
	} finally {
		await browser.close();
	}
	console.log(
		"Periodic packed consumer OK: Chromium joins compatible inbox pages and guards downloads across wipe and opt-out.",
	);
}
