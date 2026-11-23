import type { ThreadRowData, WizardMessage } from "@remit/ui";
import type { BulkActionTarget } from "./bulk-actions";

/** A ticked row, as the wizard's samples and its clause prefill read it. */
export interface WizardSelectionMessage
	extends WizardMessage,
		BulkActionTarget {
	/** Sender address — the properties prefill matches on it. */
	email: string;
	isRead: boolean;
}

/**
 * The ticked rows of a thread list, as the wizard reads them. The brief and
 * Flagged both list rows from every account and hand their selection over the
 * same way, so they read it from here rather than each keeping a copy that has
 * to learn about a new field twice.
 */
export const wizardSelectionFrom = (
	rows: readonly ThreadRowData[],
	selectedIds: ReadonlySet<string>,
): WizardSelectionMessage[] =>
	rows
		.filter((row) => selectedIds.has(row.id))
		.map((row) => {
			if (!row.accountId || !row.mailboxId)
				throw new Error("Selected message has no original placement");
			return {
				id: row.id,
				sender: row.fromName,
				email: row.fromEmail,
				isRead: row.isRead ?? false,
				subject: row.subject,
				date: row.timeLabel,
				accountId: row.accountId,
				mailboxId: row.mailboxId,
			};
		});
