import {
	CalendarDays,
	FolderTree,
	Funnel,
	Inbox,
	Palette,
	ShieldAlert,
	Sparkles,
	Tag,
	Users,
} from "../icons.js";
import type { CheckAgainFailure } from "./check-again-panel.js";
import type { LabelChipData } from "./label-chip.js";
import type { SettingsNavItem } from "./settings-screen.js";
import type { SpamListRow } from "./spam-check-again-screen.js";
import type { SpamChecked, SpamFailed, SpamReason } from "./spam-contract.js";
import type { SpamThresholds } from "./spam-copy.js";
import type { SpamDay } from "./spam-daily-chart.js";
import type { NeverInSpamSender } from "./spam-senders-page.js";
import type { SpamFlaggedMessage } from "./spam-settings-page.js";

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

export const warnSpamVerdict: SpamChecked = {
	state: "Checked",
	score: 0.72,
	action: "Warn",
	kind: "Spam",
	modelCalled: false,
	reasons: [
		{
			name: "LinkTextMismatch",
			score: 0.3,
			options: ["bank.example -> login-check.example"],
		},
		{
			name: "FirstContactDomain",
			score: 0.25,
			options: ["sender-domain.example"],
		},
		{ name: "ProviderSpam", score: 0.17, options: [] },
	],
};

export const warnPhishingVerdict: SpamChecked = {
	state: "Checked",
	score: 0.68,
	action: "Warn",
	kind: "Phishing",
	modelCalled: false,
	reasons: [
		{
			name: "DisplayNameForeignAddress",
			score: 0.4,
			options: ['"support@bank.example" <x@other.example>'],
		},
		{ name: "DmarcFail", score: 0.28, options: [] },
	],
};

export const junkPhishingVerdict: SpamChecked = {
	state: "Checked",
	score: 0.93,
	action: "Junk",
	kind: "Phishing",
	modelCalled: false,
	reasons: [
		{
			name: "DisplayNameForeignAddress",
			score: 0.45,
			options: ['"support@bank.example" <x@other.example>'],
		},
		{ name: "DmarcFail", score: 0.3, options: [] },
	],
};

export const modelJudgedVerdict: SpamChecked = {
	state: "Checked",
	score: 0.61,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
	reasons: [
		{
			name: "RecentlyRegisteredDomain",
			score: 0.35,
			options: ["registered 2026-11-02"],
		},
	],
};

export const nowJunkVerdict: SpamChecked = {
	state: "Checked",
	score: 0.88,
	action: "Junk",
	kind: "Spam",
	modelCalled: false,
	reasons: warnSpamVerdict.reasons,
};

export const warnOnlyAboveJunkVerdict: SpamChecked = {
	state: "Checked",
	score: 0.9,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
	reasons: [
		{
			name: "LinkTextMismatch",
			score: 0.5,
			options: ["bank.example -> login-check.example"],
		},
		{
			name: "FirstContactDomain",
			score: 0.4,
			options: ["sender-domain.example"],
		},
	],
};

export const unknownReasonVerdict: SpamChecked = {
	state: "Checked",
	score: 0.55,
	action: "Warn",
	kind: "Spam",
	modelCalled: true,
	reasons: [
		{ name: "ProviderSpam", score: 0.3, options: [] },
		JSON.parse('{ "name": "reason_name", "score": 0.25, "options": [] }'),
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
	(_, i) => {
		const n = phishingPattern[i % phishingPattern.length] ?? 0;
		return {
			date: isoDay(29 - i),
			moved: n,
			warned: i % 7 === 3 ? 1 : 0,
			markedNotSpam: 0,
		};
	},
);

export const spamSettingsNavFixture: SettingsNavItem[] = [
	{ id: "accounts", label: "Accounts", icon: <Inbox className="size-4" /> },
	{
		id: "senders",
		label: "Senders & Rules",
		icon: <Users className="size-4" />,
	},
	{
		id: "folders",
		label: "Folder roles",
		icon: <FolderTree className="size-4" />,
	},
	{ id: "filters", label: "Filters", icon: <Funnel className="size-4" /> },
	{ id: "labels", label: "Labels", icon: <Tag className="size-4" /> },
	{
		id: "classification",
		label: "Mail classification",
		icon: <Sparkles className="size-4" />,
	},
	{
		id: "spam",
		label: "Spam & phishing",
		icon: <ShieldAlert className="size-4" />,
	},
	{
		id: "calendars",
		label: "Calendars",
		icon: <CalendarDays className="size-4" />,
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: <Palette className="size-4" />,
	},
];

const reasonRotation: SpamReason[][] = [
	[{ name: "LinkTextMismatch", score: 0.4, options: [] }],
	[{ name: "FirstContactDomain", score: 0.3, options: [] }],
	[{ name: "DisplayNameForeignAddress", score: 0.4, options: [] }],
	[{ name: "ProviderSpam", score: 0.3, options: [] }],
	[{ name: "DmarcFail", score: 0.3, options: [] }],
	[{ name: "RecentlyRegisteredDomain", score: 0.3, options: [] }],
];

const flaggedDates = [
	"2026-11-13",
	"2026-11-13",
	"2026-11-13",
	"2026-11-12",
	"2026-11-12",
	"2026-11-12",
	"2026-11-11",
	"2026-11-11",
	"2026-11-11",
	"2026-11-10",
];

export const latestFlaggedFixture: SpamFlaggedMessage[] = flaggedDates.map(
	(date, i) => {
		const phishing = i === 2 || i === 6;
		const label = phishing ? phishingLabelFixture : spamLabelFixture;
		return {
			messageId: `flagged-${i}`,
			senderName: "Sender name",
			subject: "Subject line",
			reasons: reasonRotation[i % reasonRotation.length] ?? [],
			date,
			label,
			action: i % 3 === 1 ? "Warn" : "Junk",
			href: `/mail/label/${label.labelId}/thread-${i}/flagged-${i}`,
		};
	},
);

const listTimes = [
	"09:14",
	"08:52",
	"Yesterday",
	"Yesterday",
	"Mon",
	"Mon",
	"Sun",
	"Sat",
];

export const spamListRowsFixture: SpamListRow[] = listTimes.map(
	(timeLabel, i) => ({
		thread: {
			id: `spam-row-${i}`,
			fromName: "Sender name",
			fromEmail: "sender@example.com",
			subject: "Subject line",
			snippet: "Snippet of the first line of the body",
			timeLabel,
			isRead: i > 1,
		},
		label: spamLabelFixture,
		action: i % 3 === 0 ? "Warn" : "Junk",
	}),
);

export const neverInSpamSendersFixture: NeverInSpamSender[] = [1, 2, 3, 4].map(
	(day) => ({
		name: "Sender name",
		email: `sender${day}@example.com`,
		since: `2026-11-0${day}`,
	}),
);
