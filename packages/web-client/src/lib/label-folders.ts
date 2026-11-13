import type {
	RemitImapLabelResponse,
	RemitImapMailboxResponse,
} from "@remit/api-http-client/types.gen.ts";

const parentPath = ({
	fullPath,
	hierarchyDelimiter,
}: RemitImapMailboxResponse) =>
	fullPath.split(hierarchyDelimiter).slice(0, -1).join(hierarchyDelimiter);

/**
 * An account's folders without the label folders and the `_remit` root above
 * them, which the sidebar lists once per label instead.
 */
export function withoutLabelFolders(
	mailboxes: readonly RemitImapMailboxResponse[],
	labels: readonly RemitImapLabelResponse[],
): RemitImapMailboxResponse[] {
	const labelIds = new Set(
		labels.flatMap((label) =>
			label.folders.flatMap((f) =>
				f.state === "Missing" ? [] : [f.mailboxId],
			),
		),
	);
	const roots = new Set(
		mailboxes.filter((mb) => labelIds.has(mb.mailboxId)).map(parentPath),
	);
	return mailboxes.filter(
		(mb) => !labelIds.has(mb.mailboxId) && !roots.has(mb.fullPath),
	);
}
