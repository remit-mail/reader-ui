import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ThreadRowData } from "@remit/ui";
import { wizardSelectionFrom } from "./wizard-selection.js";

const row = (over: Partial<ThreadRowData> & { id: string }): ThreadRowData => ({
	fromName: "Alice",
	fromEmail: "alice@example.com",
	subject: "Quarterly report",
	snippet: "",
	timeLabel: "Jan 1",
	accountId: "acc-1",
	mailboxId: "inbox",
	...over,
});

describe("the ticked rows the wizard is handed", () => {
	// Regression for #872: a bulk run batches per account, and a row that
	// arrives without its own account is one the run cannot place.
	it("carries each row's own account, not the first one it saw", () => {
		const got = wizardSelectionFrom(
			[
				row({ id: "m1", accountId: "acc-work" }),
				row({ id: "m2", accountId: "acc-personal", mailboxId: "archive" }),
			],
			new Set(["m1", "m2"]),
		);
		assert.deepEqual(
			got.map(({ accountId, mailboxId }) => ({ accountId, mailboxId })),
			[
				{ accountId: "acc-work", mailboxId: "inbox" },
				{ accountId: "acc-personal", mailboxId: "archive" },
			],
		);
	});

	it("rejects a selected row without original placement", () => {
		for (const missing of [{ accountId: undefined }, { mailboxId: undefined }])
			assert.throws(
				() =>
					wizardSelectionFrom([row({ id: "m1", ...missing })], new Set(["m1"])),
				/no original placement/,
			);
	});

	it("takes only the ticked rows", () => {
		const got = wizardSelectionFrom(
			[row({ id: "m1" }), row({ id: "m2" })],
			new Set(["m2"]),
		);
		assert.deepEqual(
			got.map((message) => message.id),
			["m2"],
		);
	});
});

it("preserves original read state for a mixed selection", () => {
	const selected = wizardSelectionFrom(
		[row({ id: "unread", isRead: false }), row({ id: "read", isRead: true })],
		new Set(["unread", "read"]),
	);
	assert.deepEqual(
		selected.map((message) => message.isRead),
		[false, true],
	);
});
