import type {
	RemitImapRescanFailureCode,
	RemitImapSpamChecked,
	RemitImapSpamFailureKind,
	RemitImapSpamKind,
	RemitImapSpamModelOutcome,
	RemitImapSpamReason,
	RemitImapSpamReasonName,
	RemitImapSpamSenderScreenRule,
	RemitImapSpamThresholds,
} from "@remit/api-http-client/types.gen.ts";

const REASON_SENTENCES: Record<
	Exclude<RemitImapSpamReasonName, "BackendSymbol">,
	string
> = {
	DmarcFail: "It failed the sender domain's DMARC check.",
	SignerMismatch: "It was signed by a different domain than its sender.",
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
	ModelImpersonation:
		"The model judged that it claims an organisation its sender does not belong to.",
	ModelSpam: "The model judged it spam.",
	ModelClean: "The model judged it legitimate.",
	ListedPhishingLink: "A link in it is on a list of known phishing pages.",
};

const MODEL_REASONS: ReadonlySet<RemitImapSpamReasonName> = new Set([
	"ModelImpersonation",
	"ModelSpam",
	"ModelClean",
]);

export const isModelReason = (reason: RemitImapSpamReason): boolean =>
	MODEL_REASONS.has(reason.name);

export const UNKNOWN_REASON_SENTENCE =
	"Remit ran a check this version can't describe.";

export const CHECK_FAILED_HEADLINE = "Remit couldn't check this message";

export const BASIC_CHECKS_ONLY = "Only the basic checks ran";

const isDescribedReason = (
	name: string,
): name is Exclude<RemitImapSpamReasonName, "BackendSymbol"> =>
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
	reasons: readonly RemitImapSpamReason[],
): RemitImapSpamReason | undefined {
	return reasons.reduce<RemitImapSpamReason | undefined>(
		(top, reason) => (top && top.score >= reason.score ? top : reason),
		undefined,
	);
}

export function topSpamReasonSentence(
	reasons: readonly RemitImapSpamReason[],
): string {
	const top = topSpamReason(reasons);
	if (!top) return "";
	return spamReasonSentence(top.name) ?? UNKNOWN_REASON_SENTENCE;
}

/** What the model said, quoted from its reason, when it answered. */
export function modelSaid(verdict: RemitImapSpamChecked): string | undefined {
	if (verdict.modelOutcome !== "Answered") return undefined;
	const reason = verdict.reasons.find(isModelReason);
	if (!reason || reason.options.length === 0) return undefined;
	return reason.options.join(" ");
}

export const MODEL_SKIP_CAUSES: Record<
	Exclude<RemitImapSpamModelOutcome, "Answered" | "OutOfBand">,
	string
> = {
	NotConfigured: "this account has no model set up.",
	DailyLimit: "this account reached its daily model limit.",
	RateLimited: "the model provider asked Remit to slow down.",
};

/** Why the model did not weigh in on a message it would have helped with. */
export function modelSkipCause(
	verdict: RemitImapSpamChecked,
): string | undefined {
	const outcome = verdict.modelOutcome;
	if (outcome === "Answered" || outcome === "OutOfBand") return undefined;
	return MODEL_SKIP_CAUSES[outcome];
}

export const SPAM_FAILURE_SENTENCES: Record<RemitImapSpamFailureKind, string> =
	{
		Unreachable: "the spam service could not be reached",
		TimedOut: "the spam service did not answer in time",
		ServiceError: "the spam service answered with an error",
		Unparseable: "Remit could not read the spam service's answer",
	};

export const CHECK_AGAIN_FAILURE_SENTENCES: Record<
	RemitImapRescanFailureCode,
	string
> = {
	RateLimited: "try again in a minute.",
	DailyCap: "try again tomorrow (daily model limit).",
	NotSettled:
		"a move is still settling. Remit will retry it once the move lands.",
	NotFound: "the message is gone from the server. No retry for this one.",
	NotPermitted:
		"the server refused access to this message. No retry for this one.",
};

export const SPAM_SCREEN_SENTENCES: Record<
	Exclude<RemitImapSpamSenderScreenRule, "ReportedSender">,
	string
> = {
	NeverSpam: "You marked this sender Never in Spam.",
	Vip: "This sender is a VIP.",
	WellKnown: "You know this sender well.",
	Newsletter: "It is a newsletter from a sender you already get mail from.",
};

export const filterScreenSentence = (filterName: string): string =>
	`Your filter "${filterName}" matched it.`;

export const SPAM_WARN_HEADLINES: Record<RemitImapSpamKind, string> = {
	Spam: "Remit suspects this is spam",
	Phishing: "Remit suspects this message impersonates someone",
};

export const formatSpamScore = (score: number): string => score.toFixed(2);

export const spamScoreSentence = (
	score: number,
	thresholds: RemitImapSpamThresholds,
): string =>
	thresholds.state === "Set"
		? `Score ${formatSpamScore(score)}. Remit warns from ${formatSpamScore(thresholds.cleanBelow)} and moves to Spam from ${formatSpamScore(thresholds.spamAt)}.`
		: `Score ${formatSpamScore(score)}. The spam service applies its own thresholds.`;
