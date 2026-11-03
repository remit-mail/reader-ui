/**
 * The calendar screen's draft session, with everything that answers to it: the
 * grid's gestures, a press outside the popup, Esc, and where focus goes back
 * to. The reducer in `draft-session.ts` decides; this binds it to the page.
 */
import type { GridGesture } from "@remit/ui";
import {
	type Dispatch,
	type MutableRefObject,
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react";
import {
	type DraftSession,
	draftSessionReducer,
	escapeTarget,
	IDLE,
	type SessionAction,
	type SessionLayers,
} from "./draft-session";

/** Presses the grid answers itself, and the popups they open. */
const GRID_OWNED =
	"[data-calendar-popover], [data-event-id], [data-task-id], [data-time-columns], [data-all-day-row], [role='dialog']";

export interface DraftSessionBindings {
	layers: SessionLayers;
	/** A finger's tap on an empty slot selects nothing; a hold does. */
	isPhone: boolean;
	/** Closes the event popup or the sidebar, back to the view. */
	closeToView: () => void;
	closeNav: () => void;
	/** The events on the grid, so a saved event is focused once it is drawn. */
	drawnEvents: readonly unknown[];
}

export interface DraftSessionHandle {
	session: DraftSession;
	dispatch: Dispatch<SessionAction>;
	takeGesture: (gesture: GridGesture) => void;
	/** The control focus returns to when quick-create closes unsaved. */
	setOrigin: (element: HTMLElement | null) => void;
	/** The sidebar's own close, asked by Esc; it confirms a touched draft. */
	requestClose: MutableRefObject<(() => void) | null>;
	/** The field quick-create had focus in when it expanded, by its label. */
	carriedFocus: MutableRefObject<string>;
	/** Focus the saved event once the grid draws it. */
	focusSaved: (calendarObjectId: string) => void;
}

export function useDraftSession({
	layers,
	isPhone,
	closeToView,
	closeNav,
	drawnEvents,
}: DraftSessionBindings): DraftSessionHandle {
	const [session, dispatch] = useReducer(draftSessionReducer, IDLE);
	const bound = useRef({ session, layers, isPhone, closeToView, closeNav });
	bound.current = { session, layers, isPhone, closeToView, closeNav };
	const origin = useRef<HTMLElement | null>(null);
	const requestClose = useRef<(() => void) | null>(null);
	const carriedFocus = useRef("");
	const saved = useRef(false);
	const wasQuick = useRef(false);
	const [focusAfterSave, setFocusAfterSave] = useState("");

	const takeGesture = useCallback((gesture: GridGesture) => {
		const current = bound.current;
		const idle = current.session.mode === "idle";
		if (
			current.isPhone &&
			gesture.type === "click" &&
			idle &&
			!current.layers.eventPopup
		)
			return;
		const settles =
			gesture.type === "click" ||
			gesture.type === "drag-end" ||
			gesture.type === "keyboard";
		if (settles && current.layers.eventPopup) current.closeToView();
		if (idle && (gesture.type === "click" || gesture.type === "keyboard"))
			origin.current = gesture.origin;
		if (idle && gesture.type === "drag-end")
			origin.current = document.querySelector<HTMLElement>(
				"[role='grid'][aria-label='Time grid']",
			);
		dispatch({ type: "gesture", gesture, layers: current.layers });
	}, []);

	useEffect(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (!(event.target instanceof Element)) return;
			if (event.target.closest(GRID_OWNED)) return;
			if (bound.current.layers.eventPopup) bound.current.closeToView();
			dispatch({ type: "outside" });
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			const { session: now, layers: up } = bound.current;
			const target = escapeTarget(now, up);
			if (target === null || target === "drag") return;
			event.preventDefault();
			if (target === "event-popup") bound.current.closeToView();
			else if (target === "sidebar") requestClose.current?.();
			else if (target === "nav") bound.current.closeNav();
			else dispatch({ type: "escape", layers: up });
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	useEffect(() => {
		const isQuick = session.mode === "quick";
		if (wasQuick.current && session.mode === "idle" && !saved.current)
			origin.current?.focus();
		if (isQuick) saved.current = false;
		wasQuick.current = isQuick;
	}, [session.mode]);

	useEffect(() => {
		if (focusAfterSave === "" || drawnEvents.length === 0) return;
		const chip = document.querySelector<HTMLElement>(
			`[data-event-id^="${CSS.escape(focusAfterSave)}"]`,
		);
		if (!chip) return;
		chip.focus();
		setFocusAfterSave("");
	}, [focusAfterSave, drawnEvents]);

	const sidebarOpen = layers.sidebar;
	useEffect(() => {
		if (!sidebarOpen) dispatch({ type: "sidebar-closed" });
	}, [sidebarOpen]);

	const setOrigin = useCallback((element: HTMLElement | null) => {
		origin.current = element;
	}, []);

	const focusSaved = useCallback((calendarObjectId: string) => {
		saved.current = true;
		setFocusAfterSave(calendarObjectId);
	}, []);

	return {
		session,
		dispatch,
		takeGesture,
		setOrigin,
		requestClose,
		carriedFocus,
		focusSaved,
	};
}
