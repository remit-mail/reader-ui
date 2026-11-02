import type { CalendarViewId } from "../components/calendar-types.js";

const parse = (date: string): Date => {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

const iso = (instant: Date): string => instant.toISOString().slice(0, 10);

/** The Monday of the week a `YYYY-MM-DD` date falls in. */
export function weekStart(date: string): string {
	const day = parse(date);
	day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
	return iso(day);
}

/** The `count` dates from `start`, one day apart. */
export function datesFrom(start: string, count: number): string[] {
	const first = parse(start);
	return Array.from({ length: count }, (_, index) => {
		const next = new Date(first);
		next.setUTCDate(first.getUTCDate() + index);
		return iso(next);
	});
}

const format = (
	date: string,
	options: Intl.DateTimeFormatOptions,
	locale: string | undefined,
): string =>
	new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
		parse(date),
	);

/**
 * The toolbar's title for a view on a date. A week that crosses a month names
 * both months, the way Google Calendar does.
 */
export function calendarRangeTitle(
	view: CalendarViewId,
	date: string,
	locale?: string,
): string {
	if (view === "year") return format(date, { year: "numeric" }, locale);
	if (view === "day")
		return format(
			date,
			{ weekday: "long", day: "numeric", month: "long", year: "numeric" },
			locale,
		);
	if (view !== "week")
		return format(date, { month: "long", year: "numeric" }, locale);
	const [first, , , , , , last] = datesFrom(weekStart(date), 7);
	if (first.slice(0, 7) === last.slice(0, 7))
		return format(first, { month: "long", year: "numeric" }, locale);
	if (first.slice(0, 4) === last.slice(0, 4))
		return `${format(first, { month: "short" }, locale)} – ${format(last, { month: "short", year: "numeric" }, locale)}`;
	return `${format(first, { month: "short", year: "numeric" }, locale)} – ${format(last, { month: "short", year: "numeric" }, locale)}`;
}
