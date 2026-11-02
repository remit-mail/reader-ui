/**
 * Whether the calendar's side pane is up: the address decides, and this
 * device's last choice speaks where the address is silent about it, the way
 * `resolveRailOpen` seeds the intelligence rail.
 */
import type { PanelFragment } from "../routing";

export const SIDE_PANE_PREF_KEY = "remit:calendar-side-pane";

export function readSidePanePref(): boolean {
	try {
		return localStorage.getItem(SIDE_PANE_PREF_KEY) !== "closed";
	} catch {
		return true;
	}
}

export function writeSidePanePref(open: boolean): void {
	try {
		localStorage.setItem(SIDE_PANE_PREF_KEY, open ? "open" : "closed");
	} catch {
		// Storage unavailable — the address still holds the choice.
	}
}

/**
 * The rail is mail's pane and says nothing about this one, so an address
 * naming only the rail is silent here.
 */
export function resolveSidePaneOpen(
	panels: readonly PanelFragment[],
	prefersOpen: boolean,
): boolean {
	if (panels.includes("sidebar")) return true;
	const speaks = panels.some((panel) => panel !== "intelligence");
	return !speaks && prefersOpen;
}
