import { addDays } from "./agenda-time.js";
import { SNAP_MINUTES } from "./calendar-slot-pick.js";
import type { ZonedMoment } from "./time-grid-layout.js";

const DAY = 1440;

/** A pointer travel in pixels as whole quarter hours. */
export function snappedMinutes(deltaY: number, hourHeight: number): number {
	return Math.round(((deltaY / hourHeight) * 60) / SNAP_MINUTES) * SNAP_MINUTES;
}

function shift(moment: ZonedMoment, minutes: number): ZonedMoment {
	const total = moment.minute + minutes;
	const days = Math.floor(total / DAY);
	return { date: addDays(moment.date, days), minute: total - days * DAY };
}

const span = (start: ZonedMoment, end: ZonedMoment): number => {
	let days = 0;
	let cursor = start.date;
	while (cursor < end.date) {
		cursor = addDays(cursor, 1);
		days += 1;
	}
	return days * DAY + end.minute - start.minute;
};

/**
 * A timed event moved by whole days and quarter hours. It keeps its length,
 * and its start lands on a quarter hour.
 */
export function moveTimed(
	start: ZonedMoment,
	end: ZonedMoment,
	dayDelta: number,
	minuteDelta: number,
): { start: ZonedMoment; end: ZonedMoment } {
	const length = span(start, end);
	const moved = shift(
		{ date: addDays(start.date, dayDelta), minute: start.minute },
		minuteDelta,
	);
	const snapped = {
		date: moved.date,
		minute: Math.round(moved.minute / SNAP_MINUTES) * SNAP_MINUTES,
	};
	const startAt = snapped.minute === DAY ? shift(snapped, 0) : snapped;
	return { start: startAt, end: shift(startAt, length) };
}

/** A timed event's end dragged by quarter hours, never shorter than one. */
export function resizeTimed(
	start: ZonedMoment,
	end: ZonedMoment,
	minuteDelta: number,
): ZonedMoment {
	const length = Math.max(span(start, end) + minuteDelta, SNAP_MINUTES);
	const minutes = Math.round(length / SNAP_MINUTES) * SNAP_MINUTES;
	return shift(start, minutes);
}

/** An all-day event, first and last day inclusive, moved by whole days. */
export function moveDays(
	first: string,
	last: string,
	dayDelta: number,
): { first: string; last: string } {
	return { first: addDays(first, dayDelta), last: addDays(last, dayDelta) };
}

/** An all-day event's last day dragged across days, never before its first. */
export function resizeDays(
	first: string,
	last: string,
	dayDelta: number,
): string {
	const next = addDays(last, dayDelta);
	return next < first ? first : next;
}
