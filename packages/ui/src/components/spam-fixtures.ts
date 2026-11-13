import type { CheckAgainFailure } from "./check-again-panel.js";
import type { LabelChipData } from "./label-chip.js";
import type {
	SpamChecked,
	SpamFailed,
	SpamReason,
	SpamReasonName,
} from "./spam-contract.js";
import type { SpamDay, SpamThresholds } from "./spam-proposed.js";

export const spamThresholdsFixture: SpamThresholds = { warn: 0.4, junk: 0.85 };

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
	name: SpamReasonName,
	score: number,
	options: string[] = [],
): SpamReason => ({ name, symbol: name, score, options });

export const warnSpamVerdict: SpamChecked = {
	state: "Checked",
	score: 0.72,
	action: "Warn",
	kind: "Spam",
	modelCalled: false,
	reasons: [
		reason("LinkTextMismatch", 0.3, ["bank.example -> login-check.example"]),
		reason("FirstContactDomain", 0.25, ["sender-domain.example"]),
		reason("ProviderSpam", 0.17),
	],
};

export const warnPhishingVerdict: SpamChecked = {
	state: "Checked",
	score: 0.68,
	action: "Warn",
	kind: "Phishing",
	modelCalled: false,
	reasons: [
		reason("DisplayNameForeignAddress", 0.4, [
			'"support@bank.example" <x@other.example>',
		]),
		reason("DmarcFail", 0.28),
	],
};

export const junkPhishingVerdict: SpamChecked = {
	...warnPhishingVerdict,
	score: 0.93,
	action: "Junk",
};

export const modelJudgedVerdict: SpamChecked = {
	state: "Checked",
	score: 0.61,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
	reasons: [
		reason("RecentlyRegisteredDomain", 0.35, ["registered 2026-11-02"]),
	],
};

export const nowJunkVerdict: SpamChecked = {
	...warnSpamVerdict,
	score: 0.88,
	action: "Junk",
};

export const warnOnlyAboveJunkVerdict: SpamChecked = {
	state: "Checked",
	score: 0.9,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
	reasons: [
		reason("LinkTextMismatch", 0.5, ["bank.example -> login-check.example"]),
		reason("FirstContactDomain", 0.4, ["sender-domain.example"]),
	],
};

export const unknownReasonVerdict: SpamChecked = {
	state: "Checked",
	score: 0.55,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
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

export const failedVerdict: SpamFailed = { state: "Failed", kind: "TimedOut" };

export const checkAgainFailuresFixture: CheckAgainFailure[] = [
	{ messageId: "m-1", subject: "Subject line", cause: "RateLimited" },
	{ messageId: "m-2", subject: "Subject line", cause: "RateLimited" },
	{ messageId: "m-3", subject: "Subject line", cause: "DailyCap" },
	{ messageId: "m-4", subject: "Subject line", cause: "NotFound" },
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
		markedNotSpam: i % 9 === 4 ? 1 : 0,
	};
});

export const phishingDaysFixture: SpamDay[] = Array.from(
	{ length: 30 },
	(_, i) => ({
		date: isoDay(29 - i),
		moved: phishingPattern[i % phishingPattern.length] ?? 0,
		warned: i % 7 === 3 ? 1 : 0,
		markedNotSpam: 0,
	}),
);
