/**
 * Coming back to a tab always leaves the poll loop with a next tick (#1031).
 *
 * A tick that fires while the tab is hidden deliberately does not reschedule —
 * `visibilitychange` is the only thing that resumes the loop. While that resume
 * was itself conditional on a poll being due, the resume could be skipped for
 * good: press refresh (which opens the hot 30s window), hide the tab shortly
 * after a hot tick, let the window lapse while away, and the return is measured
 * against the ambient interval the tab never slept through. Nothing re-armed,
 * and the tab stopped polling until the account list changed or the layout
 * remounted.
 *
 * At the default the ambient and hot intervals are equal and the loop is safe
 * either way, so these drive a deployment that lengthened
 * `mailboxPollIntervalSeconds` — the only shape where the bug is reachable.
 */

import assert from "node:assert/strict";
import {
	afterEach,
	beforeEach,
	describe,
	mock,
	type TestContext,
	test,
} from "node:test";
import {
	mailboxOperationsListMailboxesQueryKey,
	syncOperationsGetSyncStatusQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapSyncPhase } from "@remit/api-http-client/types.gen.ts";
import { act, createElement } from "react";
import { ErrorBannerContext } from "../components/ui/error-banner-context";
import {
	__resetHotSyncWindow,
	HOT_POLL_INTERVAL_MS,
	HOT_WINDOW_MS,
	startHotSyncWindow,
} from "../lib/hot-sync-window";
import { installOfflineRuntime } from "../lib/offline-runtime";
import { createDomHarness, type DomHarness } from "../test-support/dom";
import { makeAccount } from "../test-support/fixtures";
import { type HttpMock, mockFetch } from "../test-support/http";

const ACCOUNT_ID = "acc-1";
const AMBIENT_SECONDS = 600;
const AMBIENT_MS = AMBIENT_SECONDS * 1000;
const T0 = 1_700_000_000_000;

// The hook resolves the ambient interval once, at module load, so the config has
// to be in place before it is imported.
globalThis.__REMIT_CONFIG__ = {
	mailboxPollIntervalSeconds: String(AMBIENT_SECONDS),
};
const { __resetStaleAccountSyncGuard, POLL_INTERVAL_MS } = await import(
	"./useStaleAccountSync.js"
);
const { FRESHNESS_POLL_MS, MailFreshnessProvider, useMailFreshness } =
	await import("../lib/mail-freshness.js");

let harness: DomHarness | undefined;
let http: HttpMock | undefined;

const accounts = [makeAccount({ accountId: ACCOUNT_ID, lastSyncAt: T0 })];
const staleAccounts = [makeAccount({ accountId: ACCOUNT_ID, lastSyncAt: 0 })];

/**
 * jsdom reports "prerender" unless it is pretending to be visual, and the
 * shared environment deliberately does not — so a spec about a tab being looked
 * at has to say so.
 */
const setVisibility = (state: "hidden" | "visible"): void => {
	Object.defineProperty(document, "visibilityState", {
		configurable: true,
		get: () => state,
	});
};

/** Enough microtask turns for a dispatched poll to reach the fetch seam. */
const settle = async (dom: DomHarness): Promise<void> => {
	for (let round = 0; round < 3; round += 1) await dom.flush();
};

const mount = async (): Promise<DomHarness> => {
	http = mockFetch(({ method }) =>
		method === "POST" ? { triggered: true, requestedAt: Date.now() } : {},
	);
	const dom = createDomHarness();
	harness = dom;
	dom.renderApp(
		// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
		createElement(MailFreshnessProvider, { accounts, children: null }),
	);
	await settle(dom);
	return dom;
};

const advance = async (dom: DomHarness, ms: number): Promise<void> => {
	await act(async () => {
		mock.timers.tick(ms);
	});
	await settle(dom);
};

const goVisible = async (dom: DomHarness): Promise<void> => {
	setVisibility("visible");
	dom.dispatch(dom.document, new Event("visibilitychange"));
	await settle(dom);
};

const goHidden = async (dom: DomHarness): Promise<void> => {
	setVisibility("hidden");
	dom.dispatch(dom.document, new Event("visibilitychange"));
	await settle(dom);
};

/** Every background sync this tab has fired since it mounted. */
const polls = (): number => http?.to(`/${ACCOUNT_ID}/sync`).length ?? 0;

describe("the poll loop across hide and show, on a long ambient interval", () => {
	beforeEach(() => {
		mock.timers.enable({ apis: ["setTimeout", "Date"], now: T0 });
	});

	afterEach(() => {
		mock.timers.reset();
		harness?.close();
		harness = undefined;
		http?.restore();
		http = undefined;
		__resetHotSyncWindow();
		__resetStaleAccountSyncGuard();
		Reflect.deleteProperty(document, "visibilityState");
	});

	test("the deployment under test really is on a lengthened interval", () => {
		assert.equal(POLL_INTERVAL_MS, AMBIENT_MS);
	});

	test("keeps polling after a refresh press, a hidden hot window and a return", async () => {
		setVisibility("visible");
		const dom = await mount();

		// The press: the hot window opens and the loop drops onto its cadence.
		act(() => startHotSyncWindow());
		await advance(dom, HOT_POLL_INTERVAL_MS);
		assert.equal(polls(), 1, "the hot cadence polled once");

		// Away before the next hot tick, and back only after the window lapsed.
		await goHidden(dom);
		await advance(dom, HOT_WINDOW_MS);
		assert.equal(polls(), 1, "a hidden tab polled");

		await goVisible(dom);
		assert.equal(
			polls(),
			1,
			"the return polled a tab that is not due on the ambient interval",
		);

		await advance(dom, AMBIENT_MS);
		assert.equal(polls(), 2, "the tab came back with no tick scheduled");
	});

	test("polls on return once the ambient interval has passed", async () => {
		setVisibility("visible");
		const dom = await mount();

		await goHidden(dom);
		await advance(dom, AMBIENT_MS);
		assert.equal(polls(), 0, "a hidden tab polled");

		await goVisible(dom);
		assert.equal(polls(), 1, "a tab due a poll did not catch up on return");

		await advance(dom, AMBIENT_MS);
		assert.equal(polls(), 2, "the catch-up left no next tick behind it");
	});
});

const syncPath = { path: { accountId: ACCOUNT_ID } };
const statusKey = syncOperationsGetSyncStatusQueryKey(syncPath);
const mailboxKey = mailboxOperationsListMailboxesQueryKey(syncPath);

const reading = (syncPhase: RemitImapSyncPhase, syncRequestedAt: number) => ({
	accountId: ACCOUNT_ID,
	syncPhase,
	syncRequestedAt,
	mailboxes: [],
});

const seedStatus = (
	dom: DomHarness,
	syncPhase: RemitImapSyncPhase,
	syncRequestedAt: number,
): void => {
	act(() => {
		dom.queryClient.setQueryData(
			statusKey,
			reading(syncPhase, syncRequestedAt),
		);
	});
};

const mountStale = async (t: TestContext) => {
	const dom = createDomHarness();
	const fetch = mockFetch(() => ({ triggered: true, requestedAt: T0 }));
	const pushError = t.mock.fn(() => "banner");
	t.after(() => {
		dom.close();
		fetch.restore();
		__resetStaleAccountSyncGuard();
	});
	seedStatus(dom, "error", T0 - 1);
	dom.queryClient.setQueryDefaults(mailboxKey, { gcTime: Infinity });
	dom.queryClient.setQueryData(mailboxKey, []);
	dom.renderApp(
		createElement(
			ErrorBannerContext.Provider,
			{
				value: {
					errors: [],
					pushError,
					dismissError: () => {},
					clearAll: () => {},
				},
			},
			createElement(MailFreshnessProvider, {
				accounts: staleAccounts,
				// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
				children: null,
			}),
		),
	);
	await dom.waitFor(() => fetch.to("/sync").length === 1);
	await dom.flush();
	return { dom, fetch, pushError };
};

test("an old error and a round that never starts leave nothing to handle", async (t) => {
	mock.timers.enable({ apis: ["setTimeout", "Date"], now: T0 });
	t.after(() => {
		mock.timers.reset();
		Reflect.deleteProperty(document, "visibilityState");
	});
	setVisibility("visible");
	const { dom, fetch, pushError } = await mountStale(t);

	await advance(dom, AMBIENT_MS);
	assert.equal(fetch.to("/sync").length, 2);
	assert.equal(fetch.to("/sync/status").length, 0);
	assert.equal(pushError.mock.callCount(), 0);
	assert.equal(dom.queryClient.getQueryState(mailboxKey)?.isInvalidated, false);
});

test("an unpressed errored round raises one banner", async (t) => {
	const { dom, pushError } = await mountStale(t);

	seedStatus(dom, "error", T0);
	await dom.waitFor(() => pushError.mock.callCount() === 1);
	seedStatus(dom, "syncing_inbox", T0);
	await dom.wait(1);
	seedStatus(dom, "error", T0);
	await dom.wait(1);

	assert.equal(pushError.mock.callCount(), 1);
	assert.deepEqual(pushError.mock.calls[0]?.arguments, [
		{
			title: `Couldn't sync ${staleAccounts[0]?.email}`,
			detail: "Sync failed for this account",
			error: undefined,
		},
	]);
	assert.equal(dom.queryClient.getQueryState(mailboxKey)?.isInvalidated, false);
});

test("the provider sends one status request per ambient or hot interval", async (t) => {
	mock.timers.enable({ apis: ["setTimeout", "setInterval", "Date"], now: T0 });
	const dom = createDomHarness();
	const fetch = mockFetch(() => reading("complete", T0 - 1));
	const press = new AbortController();
	t.after(() => {
		press.abort();
		dom.close();
		fetch.restore();
		__resetHotSyncWindow();
		mock.timers.reset();
	});
	function Refresh() {
		const { beginPress } = useMailFreshness();
		return createElement("button", {
			type: "button",
			onClick: () => {
				startHotSyncWindow();
				beginPress(ACCOUNT_ID, () => {}, press.signal);
			},
		});
	}
	seedStatus(dom, "complete", T0 - 1);
	dom.renderApp(
		createElement(MailFreshnessProvider, {
			accounts,
			// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
			children: createElement(Refresh),
		}),
	);
	const requests = () => fetch.to("/sync/status").length;
	await advance(dom, FRESHNESS_POLL_MS - 1);
	assert.equal(requests(), 0);
	await advance(dom, 1);
	assert.equal(requests(), 1);

	dom.click(dom.byText("button", ""));
	await settle(dom);
	assert.equal(requests(), 2);
	await advance(dom, 1999);
	assert.equal(requests(), 2);
	await advance(dom, 1);
	assert.equal(requests(), 3);
	await advance(dom, 2000);
	assert.equal(requests(), 4);
});

test("completion invalidates the mailbox list without an offline runtime", async (t) => {
	const { dom } = await mountStale(t);

	assert.equal(dom.queryClient.getQueryState(mailboxKey)?.isInvalidated, false);
	seedStatus(dom, "complete", T0);
	await dom.waitFor(
		() => dom.queryClient.getQueryState(mailboxKey)?.isInvalidated === true,
	);
});

test("completion calls refreshReading once when downloads are enabled", async (t) => {
	// Close the channel through the test environment's constructor.
	const originalChannel = globalThis.BroadcastChannel;
	let channel: BroadcastChannel | undefined;
	class TestChannel extends originalChannel {
		constructor(name: string) {
			super(name);
			channel = this;
		}
	}
	globalThis.BroadcastChannel = TestChannel;
	t.after(() => {
		globalThis.BroadcastChannel = originalChannel;
		channel?.close();
	});
	const runtime = installOfflineRuntime({
		sessionUrl: "/api/session",
		reauthenticate: () => {},
	});
	runtime.state = { verified: true };
	const refreshReading = t.mock.method(runtime, "refreshReading");
	const { dom } = await mountStale(t);

	seedStatus(dom, "complete", T0);
	await dom.waitFor(() => refreshReading.mock.callCount() === 1);
	seedStatus(dom, "syncing_others", T0);
	await dom.wait(1);
	seedStatus(dom, "complete", T0);
	await dom.wait(1);

	assert.equal(refreshReading.mock.callCount(), 1);
	assert.equal(dom.queryClient.getQueryState(mailboxKey)?.isInvalidated, true);
});
