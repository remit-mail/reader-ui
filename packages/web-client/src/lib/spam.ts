import type {
	RemitImapLabelSummaryResponse,
	RemitImapMessageSpamVerdict,
	RemitImapSpamChecked,
	RemitImapSpamKind,
} from "@remit/api-http-client/types.gen.ts";
import type { LabelChipData, ThreadRowSpam } from "@remit/ui";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";

const KIND_COLOURS: Record<RemitImapSpamKind, string> = {
	Spam: "Orange",
	Phishing: "Red",
};

/**
 * The Remit label a verdict of this kind applies, as the message carries it.
 * A row read before the label landed still names the kind, in its own colour.
 */
export const spamLabelFor = (
	kind: RemitImapSpamKind,
	labels: readonly RemitImapLabelSummaryResponse[] | undefined,
): LabelChipData =>
	labels?.find((label) => label.name === kind) ?? {
		labelId: `remit-${kind}`,
		name: kind,
		color: KIND_COLOURS[kind],
	};

/** A verdict that warned about the message or sent it to Spam. */
export const flaggedVerdict = (
	verdict: RemitImapMessageSpamVerdict,
): (RemitImapSpamChecked & { action: "Warn" | "Junk" }) | undefined =>
	verdict.state === "Checked" && verdict.action !== "None"
		? { ...verdict, action: verdict.action }
		: undefined;

/** The row's one spam mark: the Remit label, and whether Remit only warned. */
export const spamRowMark = (row: {
	spamVerdict: RemitImapMessageSpamVerdict;
	labels?: RemitImapLabelSummaryResponse[];
}): ThreadRowSpam | undefined => {
	const verdict = flaggedVerdict(row.spamVerdict);
	if (!verdict) return undefined;
	return {
		label: spamLabelFor(verdict.kind, row.labels),
		action: verdict.action,
	};
};

/** Whether the message view raises the spam banner and the rail for it. */
export const raisesSpamWarning = (
	verdict: RemitImapMessageSpamVerdict,
	inSpamFolder: boolean,
): boolean => {
	if (verdict.state === "Failed") return true;
	if (verdict.state !== "Checked") return false;
	if (verdict.action === "Warn") return true;
	return verdict.action === "Junk" && !inSpamFolder;
};

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
