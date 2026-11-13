import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeLabel, makeMailbox } from "../test-support/fixtures.js";
import { withoutLabelFolders } from "./label-folders.js";

const inbox = makeMailbox({ mailboxId: "mbx-inbox", fullPath: "INBOX" });
const archive = makeMailbox({ mailboxId: "mbx-archive", fullPath: "Archive" });
const root = makeMailbox({ mailboxId: "mbx-root", fullPath: "INBOX/x_remit" });
const priority = makeMailbox({
	mailboxId: "mbx-priority",
	fullPath: "INBOX/x_remit/Priority",
});

const labels = [
	makeLabel({
		labelId: "lbl-priority",
		name: "Priority",
		folders: [
			{
				accountId: "acc-1",
				state: "Present",
				mailboxId: "mbx-priority",
				fullPath: "INBOX/x_remit/Priority",
			},
		],
	}),
];

const ids = (mailboxes: { mailboxId: string }[]): string[] =>
	mailboxes.map((mailbox) => mailbox.mailboxId);

describe("withoutLabelFolders", () => {
	test("drops the label folders and the root above them", () => {
		assert.deepEqual(
			ids(withoutLabelFolders([inbox, archive, root, priority], labels)),
			["mbx-inbox", "mbx-archive"],
		);
	});

	test("keeps every folder when there are no labels", () => {
		assert.deepEqual(ids(withoutLabelFolders([inbox, root, priority], [])), [
			"mbx-inbox",
			"mbx-root",
			"mbx-priority",
		]);
	});
});
