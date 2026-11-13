import type {
	RemitImapLabelResponse,
	RemitImapMailboxResponse,
} from "@remit/api-http-client/types.gen.ts";

/** One account's folders, split into its folder tree and the label folders. */
export interface AccountFolders {
	shown: RemitImapMailboxResponse[];
	/** The label folders, and the root above them, which the label entries list instead. */
	hidden: RemitImapMailboxResponse[];
}

const parentPath = (mailbox: RemitImapMailboxResponse): string | undefined => {
	const delimiter = mailbox.hierarchyDelimiter;
	if (!delimiter) return undefined;
	const index = mailbox.fullPath.lastIndexOf(delimiter);
	return index > 0 ? mailbox.fullPath.slice(0, index) : undefined;
};

/**
 * Split an account's folders into the tree the sidebar shows and the label
 * folders it hides. A folder is a label folder when a label names its mailbox
 * id. The folder above a label folder is the label root, hidden only while
 * every folder under it is a label folder, so a folder the user filed there
 * keeps its parent on screen.
 */
export function splitLabelFolders(
	mailboxes: readonly RemitImapMailboxResponse[],
	labels: readonly RemitImapLabelResponse[],
): AccountFolders {
	const labelFolderIds = new Set(
		labels.flatMap((label) =>
			label.folders.flatMap((folder) =>
				folder.state === "Missing" ? [] : [folder.mailboxId],
			),
		),
	);
	const isLabelFolder = (mailbox: RemitImapMailboxResponse): boolean =>
		labelFolderIds.has(mailbox.mailboxId);

	const roots = new Set<string>();
	for (const mailbox of mailboxes) {
		if (!isLabelFolder(mailbox)) continue;
		const parent = parentPath(mailbox);
		if (parent !== undefined) roots.add(parent);
	}
	for (const mailbox of mailboxes) {
		if (isLabelFolder(mailbox)) continue;
		const parent = parentPath(mailbox);
		if (parent !== undefined) roots.delete(parent);
	}

	const shown: RemitImapMailboxResponse[] = [];
	const hidden: RemitImapMailboxResponse[] = [];
	for (const mailbox of mailboxes) {
		if (isLabelFolder(mailbox) || roots.has(mailbox.fullPath)) {
			hidden.push(mailbox);
			continue;
		}
		shown.push(mailbox);
	}
	return { shown, hidden };
}
