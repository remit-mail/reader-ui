import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { RemitImapMailboxResponse } from "@remit/api-http-client/types.gen.ts";
import { makeLabel, makeMailbox } from "../test-support/fixtures.js";
import { splitLabelFolders } from "./label-folders.js";

const inbox = makeMailbox({ mailboxId: "mbx-inbox", fullPath: "INBOX" });
const archive = makeMailbox({ mailboxId: "mbx-archive", fullPath: "Archive" });
const root = makeMailbox({ mailboxId: "mbx-root", fullPath: "INBOX/x_remit" });
const priority = makeMailbox({
	mailboxId: "mbx-priority",
	fullPath: "INBOX/x_remit/Priority",
});
const news = makeMailbox({
	mailboxId: "mbx-news",
	fullPath: "INBOX/x_remit/News",
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
			{
				accountId: "acc-2",
				state: "Present",
				mailboxId: "mbx-elsewhere",
				fullPath: "INBOX/y_remit/Priority",
			},
		],
	}),
	makeLabel({
		labelId: "lbl-news",
		name: "News",
		folders: [
			{
				accountId: "acc-1",
				state: "Pending",
				mailboxId: "mbx-news",
				fullPath: "INBOX/x_remit/News",
			},
			{ accountId: "acc-2", state: "Missing" },
		],
	}),
];

const ids = (mailboxes: RemitImapMailboxResponse[]): string[] =>
	mailboxes.map((mailbox) => mailbox.mailboxId);

describe("splitLabelFolders", () => {
	test("hides the label folders and the root above them", () => {
		const { shown, hidden } = splitLabelFolders(
			[inbox, archive, root, priority, news],
			labels,
		);
		assert.deepEqual(ids(shown), ["mbx-inbox", "mbx-archive"]);
		assert.deepEqual(ids(hidden), ["mbx-root", "mbx-priority", "mbx-news"]);
	});

	test("keeps the root while it holds a folder that is no label", () => {
		const filed = makeMailbox({
			mailboxId: "mbx-filed",
			fullPath: "INBOX/x_remit/Filed",
		});
		const { shown, hidden } = splitLabelFolders(
			[inbox, root, priority, filed],
			labels,
		);
		assert.deepEqual(ids(shown), ["mbx-inbox", "mbx-root", "mbx-filed"]);
		assert.deepEqual(ids(hidden), ["mbx-priority"]);
	});

	test("shows every folder when there are no labels", () => {
		const { shown, hidden } = splitLabelFolders([inbox, root, priority], []);
		assert.deepEqual(ids(shown), ["mbx-inbox", "mbx-root", "mbx-priority"]);
		assert.deepEqual(hidden, []);
	});
});
