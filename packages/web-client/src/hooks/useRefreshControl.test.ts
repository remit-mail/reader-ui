import assert from "node:assert/strict";
import { type TestContext, test } from "node:test";
import { syncOperationsGetSyncStatusQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapAccountSyncStatusResponse } from "@remit/api-http-client/types.gen.ts";
import { act, createElement } from "react";
import { __resetHotSyncWindow } from "../lib/hot-sync-window";
import { MailFreshnessProvider } from "../lib/mail-freshness";
import { createDomHarness } from "../test-support/dom";
import { makeAccount } from "../test-support/fixtures";
import { mockFetch } from "../test-support/http";
import { useRefreshControl } from "./useRefreshControl";
import { __resetStaleAccountSyncGuard } from "./useStaleAccountSync";

const account = makeAccount({ accountId: "acc-1", lastSyncAt: 0 });
const ids = [account.accountId];
const statusKey = syncOperationsGetSyncStatusQueryKey({
	path: { accountId: account.accountId },
});
const PREVIOUS = 100;
const BACKGROUND = 101;
const PRESSED = 102;

function Button({
	accountIds = ids,
	reload,
}: {
	accountIds?: readonly string[];
	reload: () => void;
}) {
	const { state, errorMessage, refresh } = useRefreshControl(accountIds, {
		reload,
	});
	return createElement(
		"button",
		{ type: "button", onClick: refresh },
		errorMessage ?? state,
	);
}

function App({ reload, presses }: { reload: () => void; presses: number }) {
	return createElement(MailFreshnessProvider, {
		accounts: [account],
		// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
		children: Array.from({ length: presses }, (_, key) =>
			createElement(Button, { key, reload }),
		),
	});
}

const mount = async (t: TestContext, presses = 1) => {
	const dom = createDomHarness();
	let posts = 0;
	let releasePost: (ack: { requestedAt: number }) => void = () => {};
	const pendingPost = new Promise<{ requestedAt: number }>((resolve) => {
		releasePost = resolve;
	});
	const fetch = mockFetch(({ method, path }) => {
		if (method === "POST" && path.endsWith("/sync")) {
			posts += 1;
			return posts === 1 ? { requestedAt: BACKGROUND } : pendingPost;
		}
		return dom.queryClient.getQueryData(statusKey);
	});
	t.after(() => {
		dom.close();
		fetch.restore();
		__resetHotSyncWindow();
		__resetStaleAccountSyncGuard();
	});
	const seed = (
		syncPhase: RemitImapAccountSyncStatusResponse["syncPhase"],
		syncRequestedAt: number,
		mailboxes: RemitImapAccountSyncStatusResponse["mailboxes"] = [],
	): void => {
		act(() => {
			dom.queryClient.setQueryData(statusKey, {
				accountId: account.accountId,
				syncPhase,
				syncRequestedAt,
				mailboxes,
			});
		});
	};
	const reload = t.mock.fn();
	seed("error", PREVIOUS);
	dom.renderApp(createElement(App, { reload, presses }));
	await dom.waitFor(() => posts === 1);
	await dom.flush();
	for (const button of dom.queryAll("button")) dom.click(button);
	await dom.waitFor(() => posts === presses + 1);

	const ack = async () => {
		await act(async () => releasePost({ requestedAt: PRESSED }));
		await dom.flush();
	};
	return { ack, dom, reload, seed };
};

test("a press ignores the older error and owns its error even before the POST ack", async (t) => {
	const { ack, dom, reload, seed } = await mount(t);
	dom.byText("button", "refreshing");

	seed("error", PRESSED);
	await dom.wait(1);
	dom.byText("button", "refreshing");
	assert.doesNotMatch(dom.text(), /Couldn't sync/);
	await ack();
	await dom.waitFor(() => dom.text().includes("Sync failed for this account"));

	assert.doesNotMatch(dom.text(), /Couldn't sync/);
	assert.equal(reload.mock.callCount(), 1);
});

test("one errored round settles both presses for the same account without a banner", async (t) => {
	const { ack, dom, reload, seed } = await mount(t, 2);
	await ack();
	seed("error", PRESSED);
	await dom.waitFor(() => reload.mock.callCount() === 2);

	assert.deepEqual(
		dom.queryAll("button").map((button) => button.textContent),
		["Sync failed for this account", "Sync failed for this account"],
	);
	assert.doesNotMatch(dom.text(), /Couldn't sync/);
});

test("the tracker hands off the INBOX once while the round is running", async (t) => {
	const { ack, dom, reload, seed } = await mount(t);
	await ack();

	const mailbox = {
		mailboxId: "inbox",
		fullPath: "Inbox",
		phase: "complete" as const,
		messagesSynced: 1,
		messagesTotal: 1,
		highWaterMarkUid: 1,
		lastSyncedAt: PRESSED,
	};
	seed("syncing_inbox", PRESSED, [
		{ ...mailbox, lastSyncedAt: PREVIOUS },
		{ ...mailbox, fullPath: "Junk" },
	]);
	await dom.wait(1);
	assert.equal(reload.mock.callCount(), 0);

	seed("syncing_others", PRESSED, [mailbox]);
	await dom.waitFor(() => reload.mock.callCount() === 1);
	dom.byText("button", "refreshing");
	seed("syncing_others", PRESSED, [{ ...mailbox, lastSyncedAt: PRESSED + 1 }]);
	await dom.wait(1);
	assert.equal(reload.mock.callCount(), 1);

	seed("complete", PRESSED + 1, [mailbox]);
	await dom.waitFor(() => dom.text().includes("success"));
	assert.equal(reload.mock.callCount(), 2);
});

test("hands off each INBOX early and reloads once after both accounts finish", async (t) => {
	t.mock.timers.enable({ apis: ["setInterval"] });
	const accountIds = ["a", "b"];
	const accounts = accountIds.map((accountId) =>
		makeAccount({ accountId, lastSyncAt: Date.now() }),
	);
	const statusKeyFor = (accountId: string) =>
		syncOperationsGetSyncStatusQueryKey({ path: { accountId } });
	const dom = createDomHarness();
	const statusFor = (accountId: string) =>
		dom.queryClient.getQueryData<RemitImapAccountSyncStatusResponse>(
			statusKeyFor(accountId),
		);
	const reload = t.mock.fn();
	let pressed = false;
	const completed = new Set<string>();
	const fetch = mockFetch(({ method, path }) => {
		const accountId = path.match(/\/accounts\/([ab])\/sync(?:\/status)?$/)?.[1];
		assert.ok(accountId, path);
		if (method === "POST") return { requestedAt: PRESSED };
		if (!pressed)
			return { accountId, syncRequestedAt: PREVIOUS, syncPhase: "complete" };
		return {
			accountId,
			syncRequestedAt: PRESSED,
			syncPhase: completed.has(accountId) ? "complete" : "syncing_others",
			mailboxes: [{ fullPath: "INBOX", lastSyncedAt: PRESSED }],
		};
	});
	t.after(() => {
		dom.close();
		fetch.restore();
		__resetHotSyncWindow();
		__resetStaleAccountSyncGuard();
	});

	dom.renderApp(
		createElement(MailFreshnessProvider, {
			accounts,
			// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
			children: createElement(Button, { accountIds, reload }),
		}),
	);
	await dom.waitFor(() =>
		accountIds.every(
			(accountId) => statusFor(accountId)?.syncPhase === "complete",
		),
	);
	pressed = true;
	dom.click(dom.byText("button", "idle"));
	await dom.waitFor(() => reload.mock.callCount() === 2);
	dom.byText("button", "refreshing");

	completed.add("a");
	await act(async () => t.mock.timers.tick(2_000));
	await dom.waitFor(() => statusFor("a")?.syncPhase === "complete");
	dom.byText("button", "refreshing");
	assert.equal(reload.mock.callCount(), 2);

	completed.add("b");
	await act(async () => t.mock.timers.tick(2_000));
	await dom.waitFor(() => dom.text().includes("success"));
	assert.equal(reload.mock.callCount(), 3);
});
