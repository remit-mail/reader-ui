/**
 * The spam verdict as reader's API states it (`typespec/lib/models/Spam.tsp`,
 * RFC 041). Every spam component reads these types from here and nowhere else,
 * so moving to the published client changes this file alone: each declaration
 * becomes a re-export of the generated one.
 */

export const SPAM_REASON_NAMES = [
	"DmarcFail",
	"ReplyToMismatch",
	"LinkTextMismatch",
	"LinkDomainDistant",
	"PunycodeDomain",
	"MixedScriptDomain",
	"ConfusableDomains",
	"SingleOffDomainLink",
	"GeneratedName",
	"FirstContactDomain",
	"RecentlyRegisteredDomain",
	"UnknownRegistrationDate",
	"ClassifierSpam",
	"ClassifierPhishing",
	"ProviderSpam",
	"DisplayNameForeignAddress",
	"DisplayNameLookalike",
] as const;

export type SpamReasonName = (typeof SPAM_REASON_NAMES)[number];

export type SpamAction = "None" | "Warn" | "Junk";

export type SpamKind = "Spam" | "Phishing";

export const SPAM_FAILURE_KINDS = [
	"Unreachable",
	"TimedOut",
	"ServiceError",
	"Unparseable",
] as const;

export type SpamFailureKind = (typeof SPAM_FAILURE_KINDS)[number];

export const SPAM_SENDER_SCREEN_RULES = [
	"ReportedSender",
	"NeverSpam",
	"Vip",
	"WellKnown",
	"Newsletter",
] as const;

export type SpamSenderScreenRule = (typeof SPAM_SENDER_SCREEN_RULES)[number];

export interface SpamReason {
	name: SpamReasonName;
	score: number;
	options: string[];
}

export interface SpamChecked {
	state: "Checked";
	score: number;
	action: SpamAction;
	kind: SpamKind;
	reasons: SpamReason[];
	modelCalled: boolean;
}

export interface SpamFailed {
	state: "Failed";
	kind: SpamFailureKind;
}

export interface SpamScreenBySender {
	rule: SpamSenderScreenRule;
}

export interface SpamScreenByFilter {
	rule: "Filter";
	filterId: string;
}

export type SpamScreen = SpamScreenBySender | SpamScreenByFilter;

export interface SpamVerdictNotChecked {
	state: "NotChecked";
}

export interface SpamVerdictScreenedOut {
	state: "ScreenedOut";
	screen: SpamScreen;
}

export type MessageSpamVerdict =
	| SpamVerdictNotChecked
	| SpamVerdictScreenedOut
	| SpamChecked
	| SpamFailed;
