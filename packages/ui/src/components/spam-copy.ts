import type {
	SpamFailureKind,
	SpamKind,
	SpamReason,
	SpamReasonName,
	SpamSenderScreenRule,
} from "./spam-contract.js";
import type {
	CheckAgainFailureCause,
	SpamThresholds,
} from "./spam-proposed.js";

const REASON_SENTENCES: Record<
	Exclude<SpamReasonName, "BackendSymbol">,
	string
> = {
	DmarcFail: "It failed the sender domain's DMARC check.",
	ReplyToMismatch: "Replies would go to a different domain than the sender's.",
	LinkTextMismatch: "A link's text shows one domain and opens another.",
	LinkDomainDistant: "A link leads to a domain unrelated to the sender's.",
	PunycodeDomain:
		"A domain in it is written in punycode, which can hide lookalike letters.",
	MixedScriptDomain: "A domain in it mixes letters from different alphabets.",
	ConfusableDomains: "Two different domains in it look the same.",
	SingleOffDomainLink: "Its only link leads away from the sender's domain.",
	GeneratedName: "The sender's address looks machine-generated.",
	FirstContactDomain: "The sender's domain has sent you nothing before.",
	RecentlyRegisteredDomain: "The sender's domain was registered recently.",
	UnknownRegistrationDate:
		"The sender's domain has no public registration date.",
	ClassifierSpam: "Remit's classifier rated it as likely spam.",
	ClassifierPhishing: "Remit's classifier rated it as likely phishing.",
	ProviderSpam: "Your provider marked it as spam.",
	DisplayNameForeignAddress:
		"The display name spells out an address at another domain.",
	DisplayNameLookalike:
		"The display name looks like a different domain's name.",
};

export const UNKNOWN_REASON_SENTENCE =
	"Remit ran a check this version can't describe.";

export const CHECK_FAILED_HEADLINE = "Remit couldn't check this message";

export const BASIC_CHECKS_ONLY = "Only the basic checks ran";

const isDescribedReason = (
	name: string,
): name is Exclude<SpamReasonName, "BackendSymbol"> =>
	Object.hasOwn(REASON_SENTENCES, name);

/**
 * The one sentence a reason reads as, wherever it shows. A backend symbol, or
 * a name this version does not know, yields `undefined`: the caller shows the
 * raw symbol and a report link instead of a guess.
 */
export function spamReasonSentence(name: string): string | undefined {
	return isDescribedReason(name) ? REASON_SENTENCES[name] : undefined;
}

export function topSpamReason(
	reasons: readonly SpamReason[],
): SpamReason | undefined {
	return reasons.reduce<SpamReason | undefined>(
		(top, reason) => (top && top.score >= reason.score ? top : reason),
		undefined,
	);
}

export function topSpamReasonSentence(reasons: readonly SpamReason[]): string {
	const top = topSpamReason(reasons);
	if (!top) return "";
	return spamReasonSentence(top.name) ?? UNKNOWN_REASON_SENTENCE;
}

export const SPAM_FAILURE_SENTENCES: Record<SpamFailureKind, string> = {
	Unreachable: "the spam service could not be reached",
	TimedOut: "the spam service did not answer in time",
	ServiceError: "the spam service answered with an error",
	Unparseable: "Remit could not read the spam service's answer",
};

export const CHECK_AGAIN_FAILURE_SENTENCES: Record<
	CheckAgainFailureCause,
	string
> = {
	RateLimited: "try again in a minute.",
	DailyCap: "try again tomorrow (daily model limit).",
	NotFound: "the message is gone from the server. No retry for this one.",
	NotPermitted:
		"the server refused access to this message. No retry for this one.",
};

export const SPAM_SCREEN_SENTENCES: Record<
	Exclude<SpamSenderScreenRule, "ReportedSender">,
	string
> = {
	NeverSpam: "You marked this sender Never in Spam.",
	Vip: "This sender is a VIP.",
	WellKnown: "You know this sender well.",
	Newsletter: "It is a newsletter from a sender you already get mail from.",
};

export const filterScreenSentence = (filterName: string): string =>
	`Your filter "${filterName}" matched it.`;

export const SPAM_WARN_HEADLINES: Record<SpamKind, string> = {
	Spam: "Remit suspects this is spam",
	Phishing: "Remit suspects this message impersonates someone",
};

export const formatSpamScore = (score: number): string => score.toFixed(2);

export const spamScoreSentence = (
	score: number,
	thresholds: SpamThresholds,
): string =>
	`Score ${formatSpamScore(score)}. Remit warns from ${formatSpamScore(thresholds.warn)} and moves to Spam from ${formatSpamScore(thresholds.junk)}.`;

export const SCORE_RANGE_ERROR = "Scores run from 0 to 1.";

export const THRESHOLD_ORDER_ERROR =
	"Warn from must be below Move to Spam from. Nothing was saved.";

export interface ThresholdDraft {
	warn: string;
	junk: string;
}

export type ThresholdValidation =
	| { ok: true; thresholds: SpamThresholds }
	| { ok: false; errors: Partial<Record<keyof ThresholdDraft, string>> };

const parseScore = (raw: string): number | undefined => {
	if (raw.trim() === "") return undefined;
	const value = Number(raw);
	return Number.isFinite(value) && value >= 0 && value <= 1 ? value : undefined;
};

/** Checks a threshold draft the way Save does before anything is stored. */
export function validateThresholds(draft: ThresholdDraft): ThresholdValidation {
	const warn = parseScore(draft.warn);
	const junk = parseScore(draft.junk);
	if (warn === undefined || junk === undefined) {
		return {
			ok: false,
			errors: {
				...(warn === undefined ? { warn: SCORE_RANGE_ERROR } : {}),
				...(junk === undefined ? { junk: SCORE_RANGE_ERROR } : {}),
			},
		};
	}
	if (warn >= junk)
		return { ok: false, errors: { warn: THRESHOLD_ORDER_ERROR } };
	return { ok: true, thresholds: { warn, junk } };
}
