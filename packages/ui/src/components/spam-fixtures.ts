import type {
	RemitImapSpamChecked,
	RemitImapSpamFailed,
	RemitImapSpamReason,
	RemitImapSpamReasonName,
	RemitImapSpamThresholdsSet,
} from "@remit/api-http-client/types.gen.ts";
import type { CheckAgainFailure } from "./check-again-panel.js";
import type { LabelChipData } from "./label-chip.js";
import type { SpamDay } from "./spam-daily-chart.js";

export const spamThresholdsFixture: RemitImapSpamThresholdsSet = {
	state: "Set",
	cleanBelow: 0.4,
	spamAt: 0.85,
};

export const spamLabelFixture: LabelChipData = {
	labelId: "label-spam",
	name: "Spam",
	color: "Orange",
};

export const phishingLabelFixture: LabelChipData = {
	labelId: "label-phishing",
	name: "Phishing",
	color: "Red",
};

const reason = (
	name: RemitImapSpamReasonName,
	score: number,
	options: string[] = [],
): RemitImapSpamReason => ({ name, symbol: name, score, options });

export const warnSpamVerdict: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.72,
	action: "Warn",
	kind: "Spam",
	modelOutcome: "OutOfBand",
	reasons: [
		reason("LinkTextMismatch", 0.3, ["bank.example -> login-check.example"]),
		reason("FirstContactDomain", 0.25, ["sender-domain.example"]),
		reason("ProviderSpam", 0.17),
	],
};

export const warnPhishingVerdict: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.68,
	action: "Warn",
	kind: "Phishing",
	modelOutcome: "OutOfBand",
	reasons: [
		reason("DisplayNameForeignAddress", 0.4, [
			'"support@bank.example" <x@other.example>',
		]),
		reason("DmarcFail", 0.28),
	],
};

export const junkPhishingVerdict: RemitImapSpamChecked = {
	...warnPhishingVerdict,
	score: 0.93,
	action: "Junk",
};

export const modelSkippedVerdict: RemitImapSpamChecked = {
	...warnSpamVerdict,
	modelOutcome: "DailyLimit",
};

export const modelJudgedVerdict: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.61,
	action: "Warn",
	kind: "Spam",
	modelOutcome: "Answered",
	reasons: [
		reason("RecentlyRegisteredDomain", 0.35, ["registered 2026-11-02"]),
		reason("ModelSpam", 0.2, [
			"It pushes a payment link from a domain registered last week.",
		]),
	],
};

export const nowJunkVerdict: RemitImapSpamChecked = {
	...warnSpamVerdict,
	score: 0.88,
	action: "Junk",
};

export const warnOnlyAboveJunkVerdict: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.9,
	action: "Warn",
	kind: "Spam",
	modelOutcome: "Answered",
	reasons: [
		reason("LinkTextMismatch", 0.5, ["bank.example -> login-check.example"]),
		reason("FirstContactDomain", 0.4, ["sender-domain.example"]),
	],
};

export const unknownReasonVerdict: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.55,
	action: "Warn",
	kind: "Spam",
	modelOutcome: "Answered",
	reasons: [
		reason("ProviderSpam", 0.3),
		{
			name: "BackendSymbol",
			symbol: "MIME_HTML_ONLY",
			score: 0.25,
			options: [],
		},
	],
};

export const failedVerdict: RemitImapSpamFailed = {
	state: "Failed",
	kind: "TimedOut",
};

export const checkAgainFailuresFixture: CheckAgainFailure[] = [
	{
		messageId: "m-1",
		subject: "Subject line",
		code: "RateLimited",
		retryable: true,
	},
	{
		messageId: "m-2",
		subject: "Subject line",
		code: "RateLimited",
		retryable: true,
	},
	{
		messageId: "m-3",
		subject: "Subject line",
		code: "DailyCap",
		retryable: true,
	},
	{
		messageId: "m-4",
		subject: "Subject line",
		code: "NotFound",
		retryable: false,
	},
];

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_DAY = Date.UTC(2026, 10, 13);

const isoDay = (offset: number): string =>
	new Date(LAST_DAY - offset * DAY_MS).toISOString().slice(0, 10);

const spamPattern = [3, 5, 2, 6, 4, 1, 0, 4, 7, 3, 5, 2, 3, 6, 4];
const phishingPattern = [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0, 1];

export const spamDaysFixture: SpamDay[] = Array.from({ length: 30 }, (_, i) => {
	const n = spamPattern[i % spamPattern.length] ?? 0;
	return {
		date: isoDay(29 - i),
		moved: n,
		warned: Math.ceil(n / 2),
	};
});

export const phishingDaysFixture: SpamDay[] = Array.from(
	{ length: 30 },
	(_, i) => ({
		date: isoDay(29 - i),
		moved: phishingPattern[i % phishingPattern.length] ?? 0,
		warned: i % 7 === 3 ? 1 : 0,
	}),
);
