import type {
	RemitImapLabelSummaryResponse,
	RemitImapMessageSpamVerdict,
	RemitImapSpamChecked,
	RemitImapSpamKind,
} from "@remit/api-http-client/types.gen.ts";
import type { ThreadRowSpam } from "@remit/ui";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";

const SPAM_KINDS: readonly RemitImapSpamKind[] = ["Phishing", "Spam"];

/**
 * The Remit Spam or Phishing label the message carries, found by name. The
 * label, not the verdict, says Remit flagged the message: Not spam removes it.
 */
export const remitSpamLabel = (
	labels: readonly RemitImapLabelSummaryResponse[] | undefined,
): RemitImapLabelSummaryResponse | undefined =>
	SPAM_KINDS.flatMap(
		(kind) => labels?.filter((label) => label.name === kind) ?? [],
	)[0];

/** A checked verdict that warned about the message or sent it to Spam. */
export const flaggedVerdict = (
	verdict: RemitImapMessageSpamVerdict,
): (RemitImapSpamChecked & { action: "Warn" | "Junk" }) | undefined =>
	verdict.state === "Checked" && verdict.action !== "None"
		? { ...verdict, action: verdict.action }
		: undefined;

/**
 * The row's one spam mark: the Remit label it carries, suspected while the
 * message sits outside a Spam folder.
 */
export const spamRowMark = (
	row: { mailboxId: string; labels?: RemitImapLabelSummaryResponse[] },
	junkMailboxIds: ReadonlySet<string>,
): ThreadRowSpam | undefined => {
	const label = remitSpamLabel(row.labels);
	if (!label) return undefined;
	return { label, suspected: !junkMailboxIds.has(row.mailboxId) };
};

/**
 * Whether the message view raises the spam banner and the rail for it: a
 * failed check, or a Remit label on a message outside Spam.
 */
export const raisesSpamWarning = (
	row: {
		spamVerdict: RemitImapMessageSpamVerdict;
		labels?: RemitImapLabelSummaryResponse[];
	},
	inSpamFolder: boolean,
): boolean =>
	row.spamVerdict.state === "Failed" ||
	(remitSpamLabel(row.labels) !== undefined &&
		row.spamVerdict.state === "Checked" &&
		!inSpamFolder);

export const spamReportHref = (title: string, detail: string): string =>
	buildGitHubIssueUrl(
		buildBugReportContext({
			title: `Spam check: ${title}`,
			errorMessage: `${title}. ${detail}`,
		}),
	);

export const unknownReasonReportHref = (symbol: string): string =>
	spamReportHref(
		`Unknown spam reason ${symbol}`,
		`The spam check named ${symbol}, which this version has no sentence for.`,
	);
