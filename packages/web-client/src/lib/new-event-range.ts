/**
 * The range a new event's sidebar holds, as the `/new` address spells it:
 * `start` and `end` as ISO 8601 with an offset, or civil dates for an all-day
 * range. The address is the only owner of the range (R2), so a reload of the
 * sidebar comes back on it.
 */
import type { CalendarSlotPick } from "@remit/ui";
import { z } from "zod";
import { addDays, isoAtInZone, isoOnClock } from "../hooks/calendar/window";
import { calendarSearchSchema } from "./calendar-route";

const instantWithOffset = z.iso.datetime({ offset: true, local: false });
const civilDate = z.iso.date();

const bound = z
	.unknown()
	.transform((value) => {
		const read = z.union([instantWithOffset, civilDate]).safeParse(value);
		return read.success ? read.data : undefined;
	})
	.optional();

export const newEventSearchSchema = calendarSearchSchema.extend({
	start: bound,
	end: bound,
});

export type NewEventSearch = z.infer<typeof newEventSearchSchema>;

const isCivil = (value: string): boolean => civilDate.safeParse(value).success;

/** The 09:00 to 10:00 a sidebar opens on when the address names no range it can read. */
export function defaultRange(date: string): CalendarSlotPick {
	return {
		date,
		endDate: date,
		startTime: "09:00",
		endTime: "10:00",
		allDay: false,
	};
}

/**
 * The range `start` and `end` name, read on the device's clock. Anything
 * missing, unreadable or backwards falls back to the URL date's working hour.
 */
export function rangeFromSearch(
	start: string | undefined,
	end: string | undefined,
	date: string,
	clock: string,
): CalendarSlotPick {
	if (start === undefined || end === undefined) return defaultRange(date);
	if (isCivil(start) && isCivil(end)) {
		const last = addDays(end, -1);
		if (last < start) return defaultRange(date);
		return {
			date: start,
			endDate: last,
			startTime: "",
			endTime: "",
			allDay: true,
		};
	}
	if (isCivil(start) || isCivil(end)) return defaultRange(date);
	if (Date.parse(end) <= Date.parse(start)) return defaultRange(date);
	const from = isoOnClock(start, clock);
	const to = isoOnClock(end, clock);
	return {
		date: from.slice(0, 10),
		endDate: to.slice(0, 10),
		startTime: from.slice(11, 16),
		endTime: to.slice(11, 16),
		allDay: false,
	};
}

/** How a range is written back into `start` and `end`. */
export function searchFromRange(
	range: CalendarSlotPick,
	clock: string,
): { start: string; end: string } {
	if (range.allDay)
		return { start: range.date, end: addDays(range.endDate, 1) };
	return {
		start: isoAtInZone(range.date, range.startTime, clock),
		end: isoAtInZone(range.endDate, range.endTime, clock),
	};
}
