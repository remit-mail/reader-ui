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
import {
	__resetStaleAccountSyncGuard,
	useStaleAccountSync,
} from "./useStaleAccountSync";

const account = makeAccount({ accountId: "acc-1", lastSyncAt: 0 });
const ids = [account.accountId];
const statusKey = syncOperationsGetSyncStatusQueryKey({
	path: { accountId: account.accountId },
});
const PREVIOUS = 100;
const BACKGROUND = 101;
const PRESSED = 102;

function Button({ onSettled }: { onSettled: () => void }) {
	const { state, errorMessage, refresh } = useRefreshControl(ids, {
		onSettled,
	});
	return createElement(
		"button",
		{ type: "button", onClick: refresh },
		errorMessage ?? state,
	);
}

function App({ onSettled }: { onSettled: () => void }) {
	useStaleAccountSync([account]);
	return createElement(MailFreshnessProvider, {
		accountIds: ids,
		// biome-ignore lint/correctness/noChildrenProp: the provider requires children in its props
		children: createElement(Button, { onSettled }),
	});
}

const mount = async (t: TestContext) => {
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
	const onSettled = t.mock.fn();
	seed("error", PREVIOUS);
	dom.renderApp(createElement(App, { onSettled }));
	await dom.waitFor(() => posts === 1);
	await dom.flush();
	dom.click(dom.byText("button", "idle"));
	await dom.waitFor(() => posts === 2);

	const ack = async () => {
		await act(async () => releasePost({ requestedAt: PRESSED }));
		await dom.flush();
	};
	return { ack, dom, onSettled, seed };
};

test("a press ignores the older error and owns its error even before the POST ack", async (t) => {
	const { ack, dom, onSettled, seed } = await mount(t);
	assert.equal(dom.byText("button", "refreshing").textContent, "refreshing");

	seed("error", PRESSED);
	await dom.wait(1);
	assert.equal(dom.byText("button", "refreshing").textContent, "refreshing");
	assert.doesNotMatch(dom.text(), /Couldn't sync/);
	await ack();
	await dom.waitFor(() => dom.text().includes("Sync failed for this account"));

	assert.doesNotMatch(dom.text(), /Couldn't sync/);
	assert.equal(onSettled.mock.callCount(), 1);
});

test("the tracker hands off the INBOX once while the round is running", async (t) => {
	const { ack, dom, onSettled, seed } = await mount(t);
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
	assert.equal(onSettled.mock.callCount(), 0);

	seed("syncing_others", PRESSED, [mailbox]);
	await dom.waitFor(() => onSettled.mock.callCount() === 1);
	assert.equal(dom.byText("button", "refreshing").textContent, "refreshing");
	seed("syncing_others", PRESSED, [{ ...mailbox, lastSyncedAt: PRESSED + 1 }]);
	await dom.wait(1);
	assert.equal(onSettled.mock.callCount(), 1);

	seed("complete", PRESSED + 1, [mailbox]);
	await dom.waitFor(() => dom.text().includes("success"));
	assert.equal(onSettled.mock.callCount(), 2);
});
