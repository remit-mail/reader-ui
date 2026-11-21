import type { RemitImapMailboxResponse } from "@remit/api-http-client/types.gen.ts";

export const folderFailure = (
	mailbox: Pick<RemitImapMailboxResponse, "syncStatus" | "syncFailureReason">,
): string | undefined => {
	if (mailbox.syncStatus !== "failed") return undefined;
	const reason = mailbox.syncFailureReason.trim();
	if (reason.length === 0) return "The last change to this folder failed.";
	return `The mail server refused the last change: ${reason}`;
};

export const folderUnavailable = (
	mailbox: Pick<RemitImapMailboxResponse, "statusRefused">,
): string | undefined =>
	mailbox.statusRefused
		? "The mail server refuses to open this folder. Check its permissions on the server, or unsubscribe from it."
		: undefined;
