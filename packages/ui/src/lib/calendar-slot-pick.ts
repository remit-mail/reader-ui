import type { CalendarSlotPick } from "../components/calendar-types.js";
import { addDays } from "./agenda-time.js";
import { addMinutesToClock } from "./event-phrase.js";

/** How long a new event is when nobody said — the hour every other path starts from. */
export const DRAFT_MINUTES = 60;

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/**
 * A pick is read off the ISO strings the calendar hands the callback, never off
 * its `Date`. The grid runs in the calendar's own zone; a `Date` read through
 * `getHours()` is that instant in the host's zone, so a UTC runner would draft
 * 09:00 for a click on 11:00.
 */
export function rangePick(
	startStr: string,
	endStr: string,
	allDay: boolean,
): CalendarSlotPick {
	if (allDay) {
		const date = startStr.slice(0, 10);
		const last = addDays(endStr.slice(0, 10), -1);
		return { ...allDayPick(startStr), endDate: last < date ? date : last };
	}
	return {
		date: startStr.slice(0, 10),
		endDate: endStr.slice(0, 10),
		startTime: startStr.slice(11, 16),
		endTime: endStr.slice(11, 16),
		allDay: false,
	};
}

/** A single point on the grid, an hour long because nothing said otherwise. */
export function pointPick(dateStr: string, allDay: boolean): CalendarSlotPick {
	if (allDay) return allDayPick(dateStr);
	const startTime = dateStr.slice(11, 16);
	const endTime = addMinutesToClock(startTime, DRAFT_MINUTES);
	const date = dateStr.slice(0, 10);
	return {
		date,
		endDate: endTime < startTime ? addDays(date, 1) : date,
		startTime,
		endTime,
		allDay: false,
	};
}

function allDayPick(dateStr: string): CalendarSlotPick {
	return {
		date: dateStr.slice(0, 10),
		endDate: dateStr.slice(0, 10),
		startTime: "",
		endTime: "",
		allDay: true,
	};
}

/**
 * Whether a selection was dragged across the grid rather than landing on it.
 * One slot, or one day, is as small as a selection gets, which is exactly what
 * a click leaves behind — and a click is already a pick of its own.
 */
export function isDraggedSelection(
	startStr: string,
	endStr: string,
	allDay: boolean,
	slotMinutes: number,
): boolean {
	const span = Date.parse(endStr) - Date.parse(startStr);
	if (allDay) return Math.round(span / MS_PER_DAY) > 1;
	return span / MS_PER_MINUTE > slotMinutes;
}

/** Every range on the grid snaps to a quarter hour, as in Google Calendar. */
export const SNAP_MINUTES = 15;

/** A press that travels less than this is a click, not a drag. */
export const CLICK_THRESHOLD_PX = 4;

const MINUTES_PER_DAY = 1440;

/** Whether a press moved far enough to be a drag. */
export function isDrag(dx: number, dy: number): boolean {
	return Math.hypot(dx, dy) >= CLICK_THRESHOLD_PX;
}

/** The quarter hour a vertical offset falls in, from midnight. */
export function minuteAt(offsetY: number, hourHeight: number): number {
	const minutes = (offsetY / hourHeight) * 60;
	const snapped = Math.floor(minutes / SNAP_MINUTES) * SNAP_MINUTES;
	return Math.min(Math.max(snapped, 0), MINUTES_PER_DAY - SNAP_MINUTES);
}

const pad = (value: number): string => String(value).padStart(2, "0");

/** `HH:MM` for minutes from midnight. */
export function clockAt(minutes: number): string {
	return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Minutes from midnight for `HH:MM`. */
export function minutesOf(clock: string): number {
	const [hours, minutes] = clock.split(":").map(Number);
	return hours * 60 + minutes;
}

/**
 * A timed range dragged in one column, from the slot pressed to the slot the
 * pointer is over, inclusive of both. A drag that runs to the bottom ends at
 * midnight, which is the next day's `00:00`.
 */
export function timedRange(
	date: string,
	anchorMinute: number,
	currentMinute: number,
): CalendarSlotPick {
	const start = Math.min(anchorMinute, currentMinute);
	const end = Math.max(anchorMinute, currentMinute) + SNAP_MINUTES;
	return slotRange(date, start, end);
}

/** A range on one day from minutes, rolling an end at midnight onto the next day. */
export function slotRange(
	date: string,
	startMinute: number,
	endMinute: number,
): CalendarSlotPick {
	const atMidnight = endMinute >= MINUTES_PER_DAY;
	return {
		date,
		endDate: atMidnight ? addDays(date, 1) : date,
		startTime: clockAt(startMinute),
		endTime: atMidnight ? "00:00" : clockAt(endMinute),
		allDay: false,
	};
}

/** The hour a click lands on: from the quarter pressed, an hour long. */
export function clickRange(date: string, minute: number): CalendarSlotPick {
	return slotRange(date, minute, minute + DRAFT_MINUTES);
}

/** An all-day range across whichever days the drag covered, in either direction. */
export function allDayRange(anchor: string, current: string): CalendarSlotPick {
	const [first, last] =
		anchor <= current ? [anchor, current] : [current, anchor];
	return {
		date: first,
		endDate: last,
		startTime: "",
		endTime: "",
		allDay: true,
	};
}

/** Minutes the range covers on its first day, end exclusive. */
export function rangeMinutes(range: CalendarSlotPick): {
	start: number;
	end: number;
} {
	const start = minutesOf(range.startTime);
	const end =
		range.endDate > range.date ? MINUTES_PER_DAY : minutesOf(range.endTime);
	return { start, end };
}
