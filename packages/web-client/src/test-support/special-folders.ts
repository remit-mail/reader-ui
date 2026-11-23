import { makeAccount, makeMailbox } from "./fixtures";

export const matthijsFolders = (
	[
		["inbox", "INBOX", 4821],
		["sent-empty", "INBOX/Sent", 0],
		["sent", "INBOX/Sent Messages", 912],
		["drafts-empty", "INBOX/Drafts", 0],
		["drafts", "INBOX/Concepten", 34],
		["archive", "INBOX/Archive", 19243],
		["junk", "INBOX/Spam", 18],
		["trash", "INBOX/Deleted Messages", 73],
	] as const
).map(([id, path, count]) =>
	makeMailbox({
		accountId: "acc-matthijs",
		mailboxId: id,
		fullPath: path,
		messageCount: count,
	}),
);

export const matthijs = makeAccount({
	accountId: "acc-matthijs",
	email: "matthijs@example.com",
	folderAppointments: [
		{ role: "Trash", mailboxId: "trash", source: "Flagged" },
		{ role: "Sent", mailboxId: "sent", source: "Flagged" },
		{ role: "Drafts", mailboxId: "drafts", source: "Flagged" },
		{ role: "Archive", mailboxId: "archive", source: "Flagged" },
		{ role: "Junk", mailboxId: "junk", source: "Flagged" },
	],
});

export const infoFolders = (
	[
		["prullenbak", "INBOX/Prullenbak", 3],
		["trash", "INBOX/Trash", 62],
		["deleted", "INBOX/Deleted Messages", 0],
		["junk", "INBOX/Spam", 17],
	] as const
).map(([id, path, count]) =>
	makeMailbox({
		accountId: "acc-info",
		mailboxId: id,
		fullPath: path,
		messageCount: count,
	}),
);

export const info = makeAccount({
	accountId: "acc-info",
	email: "info@example.com",
	folderAppointments: [
		{ role: "Trash", mailboxId: "trash", source: "Proposed" },
		{ role: "Sent", source: "None" },
		{ role: "Drafts", source: "None" },
		{ role: "Archive", source: "None" },
		{ role: "Junk", mailboxId: "junk", source: "Flagged" },
	],
});
