import type { CalendarSlotPick } from "../components/calendar-types.js";
import { rangeMinutes, SNAP_MINUTES, slotRange } from "./calendar-slot-pick.js";

/** How long a finger holds still before a slot is selected, as in Google Calendar. */
export const HOLD_MS = 500;

/** How far a finger may drift during the hold before it counts as a scroll. */
export const SCROLL_SLOP_PX = 8;

export type Press =
	| { phase: "pending"; x: number; y: number; at: number }
	| { phase: "held" }
	| { phase: "scrolled" };

export function pressStart(x: number, y: number, at: number): Press {
	return { phase: "pending", x, y, at };
}

/** A finger that moves during the hold is scrolling, and never selects. */
export function pressMove(press: Press, x: number, y: number): Press {
	if (press.phase !== "pending") return press;
	return Math.hypot(x - press.x, y - press.y) > SCROLL_SLOP_PX
		? { phase: "scrolled" }
		: press;
}

/** A hold that outlasted the delay without moving becomes a selection. */
export function pressTick(press: Press, now: number): Press {
	if (press.phase !== "pending") return press;
	return now - press.at >= HOLD_MS ? { phase: "held" } : press;
}

/**
 * A handle dragged by `deltaY` pixels, in quarter-hour steps. The other end
 * stays put, and the block never gets shorter than a quarter hour.
 */
export function stepHandle(
	range: CalendarSlotPick,
	edge: "start" | "end",
	deltaY: number,
	hourHeight: number,
): CalendarSlotPick {
	const steps = Math.round((deltaY / hourHeight) * (60 / SNAP_MINUTES));
	const { start, end } = rangeMinutes(range);
	const moved = steps * SNAP_MINUTES;
	if (edge === "start") {
		const next = Math.min(Math.max(0, start + moved), end - SNAP_MINUTES);
		return slotRange(range.date, next, end);
	}
	const next = Math.max(Math.min(1440, end + moved), start + SNAP_MINUTES);
	return slotRange(range.date, start, next);
}
