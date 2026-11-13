import type {
	RemitImapClassifierStats,
	RemitImapSpamKind,
} from "@remit/api-http-client/types.gen.ts";
import type { SpamDay } from "@remit/ui";

export const SPAM_OVERVIEW_DAYS = 30;

const pad = (n: number): string => String(n).padStart(2, "0");

const localDay = (date: Date): string =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const zoneOffset = (date: Date): string => {
	const minutes = -date.getTimezoneOffset();
	const sign = minutes >= 0 ? "+" : "-";
	const abs = Math.abs(minutes);
	return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

/**
 * Local midnight `days - 1` days before `now`, as an ISO 8601 date-time with
 * the reader's zone offset: the stats bucket arrival days in the zone of
 * `since`, so the chart's days are the reader's days.
 */
export const spamOverviewSince = (
	now: Date,
	days = SPAM_OVERVIEW_DAYS,
): string => {
	const start = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() - (days - 1),
	);
	return `${localDay(start)}T00:00:00${zoneOffset(start)}`;
};

/** Every day of the window, oldest first, as the stats name them. */
export const overviewDays = (now: Date, days = SPAM_OVERVIEW_DAYS): string[] =>
	Array.from({ length: days }, (_, i) =>
		localDay(
			new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - (days - 1 - i),
			),
		),
	);

export interface SpamOverview {
	checkedAny: boolean;
	moved: number;
	warned: number;
	spam: SpamDay[];
	phishing: SpamDay[];
}

/**
 * One bar per day for each kind. A day the stats leave out had no verdicts,
 * so it draws as an empty bar rather than closing the gap.
 */
export const buildSpamOverview = (
	stats: Pick<RemitImapClassifierStats, "spamByDay" | "spamScoreBands">,
	days: readonly string[],
): SpamOverview => {
	const daysOf = (kind: RemitImapSpamKind): SpamDay[] =>
		days.map((date) => {
			const count = (action: "Warn" | "Junk") =>
				stats.spamByDay
					.filter(
						(entry) =>
							entry.date === date &&
							entry.kind === kind &&
							entry.action === action,
					)
					.reduce((sum, entry) => sum + entry.count, 0);
			return { date, moved: count("Junk"), warned: count("Warn") };
		});
	const spam = daysOf("Spam");
	const phishing = daysOf("Phishing");
	const total = (pick: (day: SpamDay) => number) =>
		[...spam, ...phishing].reduce((sum, day) => sum + pick(day), 0);
	return {
		checkedAny: stats.spamScoreBands.some((band) => band.count > 0),
		moved: total((day) => day.moved),
		warned: total((day) => day.warned),
		spam,
		phishing,
	};
};
