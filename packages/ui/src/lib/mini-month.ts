import { datesFrom, weekStart } from "./calendar-range.js";
import { isoWeek } from "./iso-week.js";

export interface MiniMonthDay {
	date: string;
	day: number;
	inMonth: boolean;
	isToday: boolean;
	inRange: boolean;
}

export interface MiniMonthWeek {
	weekNumber: number;
	days: MiniMonthDay[];
}

export interface MiniMonthInput {
	/** Any `YYYY-MM-DD` in the month to draw. */
	month: string;
	today: string;
	/** The range on the grid, inclusive; empty strings mark none. */
	rangeStart: string;
	rangeEnd: string;
}

/** The first of the month a date is in, moved by a number of months. */
export function shiftMonth(date: string, months: number): string {
	const [year, month] = date.split("-").map(Number);
	const index = year * 12 + (month - 1) + months;
	const nextYear = Math.floor(index / 12);
	const nextMonth = (index % 12) + 1;
	return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

/**
 * The weeks a month spans, Monday first, each with its ISO week number. The
 * days around the month fill its first and last week, the way a paper
 * calendar prints them.
 */
export function miniMonthWeeks({
	month,
	today,
	rangeStart,
	rangeEnd,
}: MiniMonthInput): MiniMonthWeek[] {
	const first = `${month.slice(0, 7)}-01`;
	const last = shiftMonth(first, 1);
	const weeks: MiniMonthWeek[] = [];
	let start = weekStart(first);
	while (start < last) {
		const days = datesFrom(start, 7).map((date) => ({
			date,
			day: Number(date.slice(8)),
			inMonth: date.slice(0, 7) === first.slice(0, 7),
			isToday: date === today,
			inRange: rangeStart !== "" && date >= rangeStart && date <= rangeEnd,
		}));
		weeks.push({ weekNumber: isoWeek(start), days });
		start = datesFrom(start, 8)[7];
	}
	return weeks;
}
