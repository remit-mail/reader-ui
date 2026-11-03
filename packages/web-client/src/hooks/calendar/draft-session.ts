/**
 * The one draft the calendar holds, and every way it moves.
 *
 * The quick-create popup, the advanced sidebar and the block on the grid all
 * show this one draft. A new selection moves it rather than opening a second.
 * A click outside the popup removes it, typed or not, with nothing kept (M1).
 * Nothing here reaches the API or the address: the screen reads the state and
 * runs the save and the navigations itself.
 */
import type { CalendarSlotPick, GridGesture } from "@remit/ui";

export interface SessionDraft {
	range: CalendarSlotPick;
	title: string;
	location: string;
	calendarId: string;
	/** Guests, comma separated. */
	guests: string;
	/** A task swaps the range for a due date with an optional time. */
	kind: "event" | "task";
	notes: string;
}

export type DraftStatus = "editing" | "saving" | "failed";

export type DraftSession =
	| { mode: "idle"; dragging: CalendarSlotPick | null }
	| {
			mode: "quick";
			dragging: CalendarSlotPick | null;
			draft: SessionDraft;
			status: DraftStatus;
			problem: string;
	  }
	| {
			mode: "sidebar";
			dragging: CalendarSlotPick | null;
			draft: SessionDraft;
	  };

/** What else is up on the screen, which the session does not own but answers to. */
export interface SessionLayers {
	/** An event popup is open over the grid. */
	eventPopup: boolean;
	/** The advanced sidebar is open, on a new event or a stored one. */
	sidebar: boolean;
	/** The nav slide-over is open on a phone. */
	nav: boolean;
}

export type SessionAction =
	| { type: "gesture"; gesture: GridGesture; layers: SessionLayers }
	| { type: "new-event"; range: CalendarSlotPick }
	| { type: "outside" }
	| { type: "escape"; layers: SessionLayers }
	| { type: "change"; draft: SessionDraft }
	| { type: "save" }
	| { type: "saved" }
	| { type: "save-failed"; problem: string }
	| { type: "expand" }
	| { type: "sidebar-range"; range: CalendarSlotPick }
	| { type: "sidebar-closed" };

export const IDLE: DraftSession = { mode: "idle", dragging: null };

const quick = (draft: SessionDraft): DraftSession => ({
	mode: "quick",
	dragging: null,
	draft,
	status: "editing",
	problem: "",
});

const blank = (range: CalendarSlotPick): SessionDraft => ({
	range,
	title: "",
	location: "",
	calendarId: "",
	guests: "",
	kind: "event",
	notes: "",
});

/** Which layer Esc closes: only the top one, a drag first. */
export type EscapeTarget = "drag" | "popup" | "event-popup" | "sidebar" | "nav";

export function escapeTarget(
	session: DraftSession,
	layers: SessionLayers,
): EscapeTarget | null {
	if (session.dragging) return "drag";
	if (session.mode === "quick") return "popup";
	if (layers.eventPopup) return "event-popup";
	if (layers.sidebar) return "sidebar";
	if (layers.nav) return "nav";
	return null;
}

/** A finished range: it opens the draft, or moves the one already open. */
function settleRange(
	session: DraftSession,
	range: CalendarSlotPick,
): DraftSession {
	if (session.mode === "quick")
		return {
			...session,
			dragging: null,
			draft: { ...session.draft, range },
			status: session.status === "saving" ? "saving" : "editing",
		};
	if (session.mode === "sidebar")
		return { ...session, dragging: null, draft: { ...session.draft, range } };
	return quick(blank(range));
}

function onGesture(
	session: DraftSession,
	gesture: GridGesture,
	layers: SessionLayers,
): DraftSession {
	switch (gesture.type) {
		case "drag":
			return { ...session, dragging: gesture.range };
		case "drag-cancel":
			return { ...session, dragging: null };
		case "drag-end":
		case "keyboard":
			if (layers.sidebar && session.mode !== "sidebar")
				return { mode: "sidebar", dragging: null, draft: blank(gesture.range) };
			return settleRange(session, gesture.range);
		case "click":
			if (session.mode === "quick") return IDLE;
			if (session.mode === "sidebar" || layers.sidebar)
				return { ...session, dragging: null };
			if (layers.eventPopup) return { ...session, dragging: null };
			return quick(blank(gesture.range));
	}
}

export function draftSessionReducer(
	session: DraftSession,
	action: SessionAction,
): DraftSession {
	switch (action.type) {
		case "gesture":
			return onGesture(session, action.gesture, action.layers);
		case "new-event":
			return quick(blank(action.range));
		case "outside":
			return session.mode === "quick" ? IDLE : session;
		case "escape": {
			const target = escapeTarget(session, action.layers);
			if (target === "drag") return { ...session, dragging: null };
			if (target === "popup") return IDLE;
			return session;
		}
		case "change":
			if (session.mode === "idle") return session;
			return { ...session, draft: action.draft };
		case "save":
			if (session.mode !== "quick") return session;
			return { ...session, status: "saving", problem: "" };
		case "saved":
			return IDLE;
		case "save-failed":
			if (session.mode !== "quick") return session;
			return { ...session, status: "failed", problem: action.problem };
		case "expand":
			if (session.mode !== "quick") return session;
			return { mode: "sidebar", dragging: null, draft: session.draft };
		case "sidebar-range":
			if (session.mode === "sidebar")
				return { ...session, draft: { ...session.draft, range: action.range } };
			return { mode: "sidebar", dragging: null, draft: blank(action.range) };
		case "sidebar-closed":
			return session.mode === "sidebar" ? IDLE : session;
	}
}

/** The range the grid draws: the one being dragged, else the draft's. */
export function drawnRange(session: DraftSession): CalendarSlotPick | null {
	if (session.dragging) return session.dragging;
	return session.mode === "idle" ? null : session.draft.range;
}
