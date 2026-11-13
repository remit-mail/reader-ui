import type {
	RemitImapLabelSummaryResponse,
	RemitImapSpamChecked,
	RemitImapThreadMessageResponse,
} from "@remit/api-http-client/types.gen.ts";
import { overviewDays } from "../../lib/spam-overview";
import { makeLabel } from "../../test-support/fixtures";
import {
	HOUR,
	type MailWorld,
	mailWorld,
	PERSONAL,
	threadRow,
	WORK,
} from "./mail-world";

export const SPAM_LABEL_ID = "lbl-remit-spam";
export const PHISHING_LABEL_ID = "lbl-remit-phishing";

const spamLabel: RemitImapLabelSummaryResponse = {
	labelId: SPAM_LABEL_ID,
	name: "Spam",
	color: "Orange",
};

const phishingLabel: RemitImapLabelSummaryResponse = {
	labelId: PHISHING_LABEL_ID,
	name: "Phishing",
	color: "Red",
};

export const warnPhishing: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.68,
	action: "Warn",
	kind: "Phishing",
	modelOutcome: "OutOfBand",
	reasons: [
		{
			name: "SignerMismatch",
			symbol: "SignerMismatch",
			score: 0.4,
			options: ["gmail.example"],
		},
		{ name: "DmarcFail", symbol: "DmarcFail", score: 0.28, options: [] },
	],
};

const warnSpam: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.61,
	action: "Warn",
	kind: "Spam",
	modelOutcome: "DailyLimit",
	reasons: [
		{
			name: "LinkTextMismatch",
			symbol: "LinkTextMismatch",
			score: 0.35,
			options: ["shop.example -> deals-now.example"],
		},
		{
			name: "FirstContactDomain",
			symbol: "FirstContactDomain",
			score: 0.26,
			options: ["deals-now.example"],
		},
	],
};

const junkSpam: RemitImapSpamChecked = {
	state: "Checked",
	score: 0.93,
	action: "Junk",
	kind: "Spam",
	modelOutcome: "Answered",
	reasons: [
		{ name: "ProviderSpam", symbol: "ProviderSpam", score: 0.5, options: [] },
		{
			name: "ModelSpam",
			symbol: "ModelSpam",
			score: 0.43,
			options: ["It promises a prize for a contest the reader never entered."],
		},
	],
};

export const PARCEL_ROW: RemitImapThreadMessageResponse = {
	...threadRow({
		id: "parcel",
		accountId: PERSONAL,
		fromName: "Mondial Relay",
		fromEmail: "delivery.notice@gmail.example",
		subject: "Your parcel could not be delivered",
		snippet: "Pay the outstanding redelivery fee within 24 hours.",
		category: "transactional",
		ago: 35 * 60_000,
	}),
	spamVerdict: warnPhishing,
	labels: [phishingLabel],
};

const spamRows: RemitImapThreadMessageResponse[] = [
	PARCEL_ROW,
	{
		...threadRow({
			id: "deals",
			accountId: WORK,
			fromName: "Deals Now",
			fromEmail: "offers@deals-now.example",
			subject: "Only today: 80% off everything",
			snippet: "Click before midnight to claim your discount.",
			category: "marketing",
			ago: 3 * HOUR,
		}),
		spamVerdict: warnSpam,
		labels: [spamLabel],
	},
	{
		...threadRow({
			id: "prize",
			accountId: PERSONAL,
			role: "Junk",
			fromName: "Prize Desk",
			fromEmail: "winner@prize-desk.example",
			subject: "You have won a holiday",
			snippet: "Confirm your details to claim it.",
			category: "marketing",
			ago: 6 * HOUR,
		}),
		spamVerdict: junkSpam,
		labels: [spamLabel],
	},
];

/** The default world, with the Remit labels and three flagged messages. */
export const spamWorld = (overrides: Partial<MailWorld> = {}): MailWorld => {
	const base = mailWorld();
	const days = overviewDays(new Date());
	const day = (index: number) => days[index] ?? "";
	return mailWorld({
		labels: [
			makeLabel({ ...spamLabel, folders: [] }),
			makeLabel({ ...phishingLabel, folders: [] }),
		],
		threads: [...base.threads, ...spamRows],
		classifierStats: {
			...base.classifierStats,
			examined: 240,
			spamByDay: [
				{ date: day(20), action: "Junk", kind: "Spam", count: 3 },
				{ date: day(20), action: "Warn", kind: "Spam", count: 1 },
				{ date: day(25), action: "Warn", kind: "Phishing", count: 2 },
				{ date: day(29), action: "Junk", kind: "Spam", count: 4 },
				{ date: day(29), action: "Warn", kind: "Spam", count: 2 },
			],
			spamScoreBands: [
				{ from: 0.1, count: 200 },
				{ from: 0.45, count: 5 },
				{ from: 0.9, count: 7 },
			],
		},
		...overrides,
	});
};
