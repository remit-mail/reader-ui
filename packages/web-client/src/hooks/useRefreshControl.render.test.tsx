import assert from "node:assert/strict";
import { test } from "node:test";

import { MailFreshnessProvider } from "../lib/mail-freshness";
import { createDomHarness } from "../test-support/dom";
import { mockFetch } from "../test-support/http";
import { useRefreshControl } from "./useRefreshControl";

test("hands off each account's INBOX early and reloads once after both rounds finish", async (t) => {
	const onInboxSynced = t.mock.fn<(accountId: string) => void>();
	const onSettled = t.mock.fn();
	const statusReads = new Map<string, number>();
	const release = new window.EventTarget();
	const held = new Promise<void>((resolve) =>
		release.addEventListener("finish", () => resolve(), { once: true }),
	);
	const http = mockFetch(async ({ method, path }) => {
		const accountId = path.match(/\/accounts\/([ab])\/sync(?:\/status)?$/)?.[1];
		assert.ok(accountId, path);
		if (method === "POST") return { triggered: true };
		const read = (statusReads.get(accountId) ?? 0) + 1;
		statusReads.set(accountId, read);
		if (read === 1) return { syncPhase: "complete", lastSyncAt: 1 };
		if (read === 2)
			return {
				syncPhase: "syncing_others",
				lastSyncAt: 1,
				mailboxes: [{ fullPath: "INBOX", lastSyncedAt: 2 }],
			};
		if (accountId === "b") await held;
		return { syncPhase: "complete", lastSyncAt: 2 };
	});
	function Control() {
		const { refresh, state } = useRefreshControl(["a", "b"], {
			onInboxSynced,
			onSettled,
		});
		return (
			<button type="button" onClick={refresh}>
				{state}
			</button>
		);
	}
	const dom = createDomHarness();
	try {
		dom.renderApp(
			<MailFreshnessProvider accountIds={[]}>
				<Control />
			</MailFreshnessProvider>,
		);
		dom.click(dom.byText("button", "idle"));
		await dom.waitFor(
			() => statusReads.get("b") === 3,
			"the final status read",
			8_000,
		);
		assert.deepEqual(
			onInboxSynced.mock.calls
				.map(({ arguments: [accountId] }) => accountId)
				.sort(),
			["a", "b"],
		);
		assert.equal(onSettled.mock.callCount(), 0);
		assert.equal(dom.byText("button", "refreshing").textContent, "refreshing");
		release.dispatchEvent(new window.Event("finish"));
		await dom.waitFor(() => onSettled.mock.callCount() > 0);
		assert.equal(onSettled.mock.callCount(), 1);
		assert.equal(dom.byText("button", "success").textContent, "success");
	} finally {
		release.dispatchEvent(new window.Event("finish"));
		dom.close();
		http.restore();
	}
});
