import assert from "node:assert/strict";
import { test } from "node:test";
import { act, createElement } from "react";
import { canUpdate } from "../lib/pwa-update";
import { createDomHarness } from "../test-support/dom";
import { mockFetch } from "../test-support/http";
import { useSaveDraft } from "./useSaveDraft";
import "../lib/client";

test("a new draft finishes after unmount without reopening the composer", async () => {
	const harness = createDomHarness();
	let finish!: () => void;
	const saving = new Promise<void>((resolve) => {
		finish = resolve;
	});
	let navigations = 0;
	let save!: ReturnType<typeof useSaveDraft>["saveDraft"];
	const http = mockFetch(async () => {
		await saving;
		return { outboxMessageId: "new-draft" };
	});
	function Probe() {
		save = useSaveDraft({
			onDraftCreated: () => {
				navigations++;
			},
		}).saveDraft;
		return null;
	}
	try {
		harness.renderApp(createElement(Probe));
		await harness.flush();
		act(() =>
			save({
				accountId: "acc-1",
				toAddresses: ["recipient@example.com"],
				subject: "Final subject",
				textBody: "Final bytes",
			}),
		);
		harness.unmount();
		assert.equal(canUpdate(), false);
		await harness.waitFor(
			() => http.calls.some((call) => call.method === "POST"),
			"the scheduled create runs after unmount",
			3000,
		);
		assert.equal(http.calls.at(-1)?.body?.textBody, "Final bytes");
		assert.equal(canUpdate(), false);
		finish();
		await harness.waitFor(
			canUpdate,
			"the completed create releases its blocker",
		);
		assert.equal(navigations, 0);
	} finally {
		finish();
		harness.close();
		http.restore();
	}
});
