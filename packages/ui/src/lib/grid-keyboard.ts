import type { CalendarSlotPick } from "../components/calendar-types.js";
import { clockAt, SNAP_MINUTES, slotRange } from "./calendar-slot-pick.js";

/** The quarter hour the grid's keyboard focus sits on. */
export interface GridSlot {
	date: string;
	minute: number;
}

const LAST_SLOT = 1440 - SNAP_MINUTES;

/** The grid's tab stop: the current hour of today, or of the first day in view. */
export function initialFocus(
	days: readonly string[],
	today: string,
	nowMinute: number,
): GridSlot {
	return {
		date: days.includes(today) ? today : days[0],
		minute: Math.floor(nowMinute / 60) * 60,
	};
}

/** Where an arrow key moves the focus: a quarter hour up or down, a day across. */
export function moveFocus(
	slot: GridSlot,
	key: string,
	days: readonly string[],
): GridSlot | null {
	const index = days.indexOf(slot.date);
	switch (key) {
		case "ArrowUp":
			return { ...slot, minute: Math.max(0, slot.minute - SNAP_MINUTES) };
		case "ArrowDown":
			return {
				...slot,
				minute: Math.min(LAST_SLOT, slot.minute + SNAP_MINUTES),
			};
		case "ArrowLeft":
			return { ...slot, date: days[Math.max(0, index - 1)] };
		case "ArrowRight":
			return { ...slot, date: days[Math.min(days.length - 1, index + 1)] };
		default:
			return null;
	}
}

const order = (a: GridSlot, b: GridSlot): number =>
	a.date === b.date ? a.minute - b.minute : a.date < b.date ? -1 : 1;

/**
 * The range Shift and the arrows stretch out, from the slot the stretch began
 * on to the focused slot, both included.
 */
export function stretchRange(
	anchor: GridSlot,
	focus: GridSlot,
): CalendarSlotPick {
	const [first, last] =
		order(anchor, focus) <= 0 ? [anchor, focus] : [focus, anchor];
	if (first.date === last.date)
		return slotRange(first.date, first.minute, last.minute + SNAP_MINUTES);
	const end = slotRange(last.date, last.minute, last.minute + SNAP_MINUTES);
	return {
		date: first.date,
		startTime: clockAt(first.minute),
		endDate: end.endDate,
		endTime: end.endTime,
		allDay: false,
	};
}
