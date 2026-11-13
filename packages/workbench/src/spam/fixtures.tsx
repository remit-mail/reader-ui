import type {
	LabelChipData,
	SettingsNavItem,
	SpamDay,
	SpamFlaggedMessage,
	SpamReason,
	SpamReasonName,
} from "@remit/ui";
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
} from "@remit/ui/icons";
import type { SpamListRow } from "./spam-check-again-screen";
import type { NeverInSpamSender } from "./spam-senders-page";

export const spamLabel: LabelChipData = {
	labelId: "label-spam",
	name: "Spam",
	color: "Orange",
};

export const phishingLabel: LabelChipData = {
	labelId: "label-phishing",
	name: "Phishing",
	color: "Red",
};

export const settingsNav: SettingsNavItem[] = [
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

const DAY_MS = 24 * 60 * 60 * 1000;
const LAST_DAY = Date.UTC(2026, 10, 13);

const isoDay = (offset: number): string =>
	new Date(LAST_DAY - offset * DAY_MS).toISOString().slice(0, 10);

const spamPattern = [3, 5, 2, 6, 4, 1, 0, 4, 7, 3, 5, 2, 3, 6, 4];
const phishingPattern = [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0, 1];

export const spamDays: SpamDay[] = Array.from({ length: 30 }, (_, i) => {
	const n = spamPattern[i % spamPattern.length] ?? 0;
	return {
		date: isoDay(29 - i),
		moved: n,
		warned: Math.ceil(n / 2),
		markedNotSpam: i % 9 === 4 ? 1 : 0,
	};
});

export const phishingDays: SpamDay[] = Array.from({ length: 30 }, (_, i) => ({
	date: isoDay(29 - i),
	moved: phishingPattern[i % phishingPattern.length] ?? 0,
	warned: i % 7 === 3 ? 1 : 0,
	markedNotSpam: 0,
}));

const reason = (name: SpamReasonName): SpamReason[] => [
	{ name, symbol: name, score: 0.4, options: [] },
];

const reasonRotation: SpamReason[][] = [
	reason("LinkTextMismatch"),
	reason("FirstContactDomain"),
	reason("DisplayNameForeignAddress"),
	reason("ProviderSpam"),
	reason("DmarcFail"),
	reason("RecentlyRegisteredDomain"),
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

export const latestFlagged: SpamFlaggedMessage[] = flaggedDates.map(
	(date, i) => {
		const label = i === 2 || i === 6 ? phishingLabel : spamLabel;
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

export const spamListRows: SpamListRow[] = listTimes.map((timeLabel, i) => ({
	thread: {
		id: `spam-row-${i}`,
		fromName: "Sender name",
		fromEmail: "sender@example.com",
		subject: "Subject line",
		snippet: "Snippet of the first line of the body",
		timeLabel,
		isRead: i > 1,
	},
	label: spamLabel,
	action: i % 3 === 0 ? "Warn" : "Junk",
}));

export const neverInSpamSenders: NeverInSpamSender[] = [1, 2, 3, 4].map(
	(day) => ({
		name: "Sender name",
		email: `sender${day}@example.com`,
		since: `2026-11-0${day}`,
	}),
);
