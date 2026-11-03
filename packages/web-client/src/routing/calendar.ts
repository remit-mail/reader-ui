import type { CalendarViewId } from "@remit/ui";
import {
	useBlocker,
	useNavigate,
	useParams,
	useRouter,
	useSearch,
} from "@tanstack/react-router";
import { useCallback, useMemo, useRef } from "react";
import {
	type CalendarSearch,
	canonicalCalendarParams,
	isoDate,
} from "../lib/calendar-route";
import { useRetainOpenPanels } from "./fragment";

const VIEW_ROUTE = "/calendar/$view/$date" as const;

declare module "@tanstack/react-router" {
	interface HistoryState {
		/** This entry was opened from the calendar view, so Back returns to it. */
		openedFromView?: boolean;
	}
}
const SUGGESTION_ROUTE =
	"/calendar/$view/$date/suggestion/$suggestionId" as const;
const TASK_ROUTE = "/calendar/$view/$date/task/$calendarTaskId" as const;

/** Which zoom the calendar is at, on which day, over which calendars. */
export interface CalendarAddress {
	view: CalendarViewId;
	/** `YYYY-MM-DD`. */
	date: string;
	/** The calendars ticked in the query; empty means every one of them. */
	calendarIds: readonly string[];
}

/**
 * The calendar the address names.
 *
 * The route canonicalises its own segments before anything mounts, so what
 * arrives here is always a view the ladder has and a day the calendar has —
 * the fallbacks below only cover the frame before the router has resolved
 * the params.
 */
export function useCalendarAddress(): CalendarAddress {
	const params = useParams({ from: VIEW_ROUTE, shouldThrow: false });
	const search = useSearch({ from: VIEW_ROUTE, shouldThrow: false });
	const view = params?.view ?? "";
	const date = params?.date ?? "";
	const calendarIds = search?.calendarId;
	return useMemo(() => {
		const canonical = canonicalCalendarParams(
			{ view, date },
			isoDate(new Date()),
		);
		return { ...canonical, calendarIds: calendarIds ?? [] };
	}, [view, date, calendarIds]);
}

/** The event the reading pane has open, and the instance of it, if any. */
export interface OpenCalendarEvent {
	calendarObjectId: string;
	/** One instance of a series; absent on the series itself. */
	recurrenceId: string | undefined;
}

export function useOpenCalendarEvent(): OpenCalendarEvent | undefined {
	const event = useParams({
		from: "/calendar/$view/$date/$calendarObjectId",
		shouldThrow: false,
	});
	const instance = useParams({
		from: "/calendar/$view/$date/$calendarObjectId/$recurrenceId",
		shouldThrow: false,
	});
	const calendarObjectId = event?.calendarObjectId;
	const recurrenceId = instance?.recurrenceId;
	return useMemo(
		() => (calendarObjectId ? { calendarObjectId, recurrenceId } : undefined),
		[calendarObjectId, recurrenceId],
	);
}

/** The task the popup has open, if the address names one. */
export function useOpenCalendarTask(): string | undefined {
	return useParams({ from: TASK_ROUTE, shouldThrow: false })?.calendarTaskId;
}

/** Whether the composer is up, which is a route rather than a flag. */
export function useChangingSuggestionId(): string | undefined {
	return useParams({ from: SUGGESTION_ROUTE, shouldThrow: false })
		?.suggestionId;
}

/** The stored event the sidebar is editing, if the address has one open. */
export function useEditingEvent(): OpenCalendarEvent | undefined {
	const series = useParams({
		from: "/calendar/$view/$date/$calendarObjectId/edit",
		shouldThrow: false,
	});
	const occurrence = useParams({
		from: "/calendar/$view/$date/$calendarObjectId/$recurrenceId/edit",
		shouldThrow: false,
	});
	const calendarObjectId =
		series?.calendarObjectId ?? occurrence?.calendarObjectId;
	const recurrenceId = occurrence?.recurrenceId;
	return useMemo(
		() => (calendarObjectId ? { calendarObjectId, recurrenceId } : undefined),
		[calendarObjectId, recurrenceId],
	);
}

/** The range `/new` names in its query, unread until a sidebar reads it. */
export function useNewEventBounds():
	| { start: string | undefined; end: string | undefined }
	| undefined {
	const search = useSearch({
		from: "/calendar/$view/$date/new",
		shouldThrow: false,
	});
	const start = search?.start;
	const end = search?.end;
	const open = search !== undefined;
	return useMemo(() => (open ? { start, end } : undefined), [open, start, end]);
}

export function useIsWritingEvent(): boolean {
	const editing = useEditingEvent();
	const composer = useParams({
		from: "/calendar/$view/$date/new",
		shouldThrow: false,
	});
	const changing = useParams({
		from: SUGGESTION_ROUTE,
		shouldThrow: false,
	});
	return (
		composer !== undefined || changing !== undefined || editing !== undefined
	);
}

export interface CalendarNavigation {
	/** Change zoom, keeping the day on screen. */
	goToView: (view: CalendarViewId) => void;
	/** Home, from every view and every distance away. */
	goToToday: () => void;
	/** The same view on another day. */
	goToDate: (date: string) => void;
	/** The calendars to draw; every one of them clears the query. */
	setCalendarIds: (calendarIds: readonly string[]) => void;
	/**
	 * The day the strip has scrolled to, written by `replace`. Scrolling is not
	 * somewhere the reader went — Back belongs to the screen they arrived from,
	 * not to every row they passed on the way down.
	 */
	setAnchorDate: (date: string) => void;
	/** Out of the list and into the grid for one day. */
	zoomToDay: (date: string) => void;
	dayHref: (date: string) => string;
	/**
	 * One occurrence names the series it belongs to and the instance under it;
	 * a resource that does not recur names only itself.
	 */
	openEvent: (calendarObjectId: string, recurrenceId?: string) => void;
	/** A task in its popup, by its own segment. */
	openTask: (calendarTaskId: string) => void;
	/**
	 * Back to the view from an event popup or a sidebar: Back when the view is
	 * the entry before, else the view by replace.
	 */
	closeToView: () => void;
	/** The advanced sidebar on a new event over a range, as `start` and `end`. */
	openNewEvent: (bounds: { start: string; end: string }) => void;
	/** A new range for the open sidebar, by replace. */
	setNewEventBounds: (bounds: { start: string; end: string }) => void;
	/** The advanced sidebar on a stored event. */
	openEditor: (calendarObjectId: string, recurrenceId?: string) => void;
	changeSuggestionFirst: (suggestionId: string, date: string) => void;
}

/**
 * Every move the calendar makes, as an address.
 *
 * Prev, next, today and the zoom switch are navigations rather than state
 * changes, so the address always names what is on screen and a link to it
 * reopens exactly that. Each one carries the open panes across the way the nav
 * does, so the reader keeps their chrome moving through the week.
 */
export function useCalendarNavigation(): CalendarNavigation {
	const navigate = useNavigate();
	const router = useRouter();
	const retainPanels = useRetainOpenPanels();
	const { view, date } = useCalendarAddress();
	const openedEvent = useOpenCalendarEvent();
	const openedTask = useOpenCalendarTask();
	const popupOpen = openedEvent !== undefined || openedTask !== undefined;

	const goTo = useCallback(
		(params: { view: CalendarViewId; date: string }) => {
			navigate({
				to: VIEW_ROUTE,
				params,
				search: true,
				hash: retainPanels,
			});
		},
		[navigate, retainPanels],
	);

	const dayHref = useCallback(
		(next: string) =>
			router.buildLocation({
				to: VIEW_ROUTE,
				params: { view: "day", date: next },
				search: true,
				hash: retainPanels,
			}).href,
		[router, retainPanels],
	);

	return useMemo(
		() => ({
			goToView: (next: CalendarViewId) => goTo({ view: next, date }),
			goToToday: () => goTo({ view, date: isoDate(new Date()) }),
			goToDate: (next: string) => goTo({ view, date: next }),
			setCalendarIds: (calendarIds: readonly string[]) =>
				navigate({
					to: VIEW_ROUTE,
					params: { view, date },
					search: (previous: CalendarSearch) => ({
						...previous,
						calendarId: calendarIds.length === 0 ? undefined : [...calendarIds],
					}),
					hash: true,
					replace: true,
				}),
			setAnchorDate: (next: string) => {
				// An open popup is a child of the view; rewriting the day under
				// it would close it, so the strip waits until it is gone.
				if (popupOpen) return;
				navigate({
					to: VIEW_ROUTE,
					params: { view, date: next },
					search: true,
					hash: retainPanels,
					replace: true,
				});
			},
			zoomToDay: (next: string) => navigate({ href: dayHref(next) }),
			dayHref,
			openEvent: (calendarObjectId: string, recurrenceId?: string) =>
				recurrenceId === undefined || recurrenceId === ""
					? navigate({
							to: "/calendar/$view/$date/$calendarObjectId",
							params: { view, date, calendarObjectId },
							search: true,
							hash: retainPanels,
							replace: popupOpen,
							state: { openedFromView: true },
						})
					: navigate({
							to: "/calendar/$view/$date/$calendarObjectId/$recurrenceId",
							params: { view, date, calendarObjectId, recurrenceId },
							search: true,
							hash: retainPanels,
							replace: popupOpen,
							state: { openedFromView: true },
						}),
			openTask: (calendarTaskId: string) =>
				navigate({
					to: TASK_ROUTE,
					params: { view, date, calendarTaskId },
					search: true,
					hash: retainPanels,
					replace: popupOpen,
					state: { openedFromView: true },
				}),
			closeToView: () => {
				if (router.state.location.state.openedFromView === true) {
					router.history.back();
					return;
				}
				navigate({
					to: VIEW_ROUTE,
					params: { view, date },
					search: (previous: CalendarSearch) => ({
						calendarId: previous.calendarId,
					}),
					hash: retainPanels,
					replace: true,
				});
			},
			openNewEvent: (bounds: { start: string; end: string }) =>
				navigate({
					to: "/calendar/$view/$date/new",
					params: { view, date },
					search: (previous: CalendarSearch) => ({ ...previous, ...bounds }),
					hash: retainPanels,
					replace: popupOpen,
					state: { openedFromView: true },
				}),
			setNewEventBounds: (bounds: { start: string; end: string }) =>
				navigate({
					to: "/calendar/$view/$date/new",
					params: { view, date },
					search: (previous: CalendarSearch) => ({ ...previous, ...bounds }),
					hash: true,
					replace: true,
					state: (previous) => previous,
				}),
			openEditor: (calendarObjectId: string, recurrenceId?: string) =>
				recurrenceId === undefined || recurrenceId === ""
					? navigate({
							to: "/calendar/$view/$date/$calendarObjectId/edit",
							params: { view, date, calendarObjectId },
							search: true,
							hash: retainPanels,
							replace: popupOpen,
							state: { openedFromView: true },
						})
					: navigate({
							to: "/calendar/$view/$date/$calendarObjectId/$recurrenceId/edit",
							params: { view, date, calendarObjectId, recurrenceId },
							search: true,
							hash: retainPanels,
							replace: popupOpen,
							state: { openedFromView: true },
						}),
			changeSuggestionFirst: (suggestionId: string, on: string) =>
				navigate({
					to: SUGGESTION_ROUTE,
					params: { view, date: on, suggestionId },
					search: true,
					hash: retainPanels,
				}),
		}),
		[goTo, navigate, dayHref, retainPanels, view, date, router, popupOpen],
	);
}

/**
 * Leave the mail for one event on the calendar, on the day it falls, so the
 * reader lands where the grid already shows what is around it. The panes are
 * not carried: the calendar is a different surface, as the nav treats it.
 */
export function useOpenEventOnCalendar(): (
	date: string,
	calendarObjectId: string,
	recurrenceId: string,
) => void {
	const navigate = useNavigate();
	return useCallback(
		(date: string, calendarObjectId: string, recurrenceId: string) => {
			if (recurrenceId === "") {
				navigate({
					to: "/calendar/$view/$date/$calendarObjectId",
					params: { view: "day", date, calendarObjectId },
				});
				return;
			}
			navigate({
				to: "/calendar/$view/$date/$calendarObjectId/$recurrenceId",
				params: { view: "day", date, calendarObjectId, recurrenceId },
			});
		},
		[navigate],
	);
}

export function useChangeSuggestionOnCalendar(): (
	date: string,
	suggestionId: string,
) => void {
	const navigate = useNavigate();
	return useCallback(
		(date: string, suggestionId: string) => {
			navigate({
				to: SUGGESTION_ROUTE,
				params: { view: "day", date, suggestionId },
			});
		},
		[navigate],
	);
}

/**
 * Back answered by a layer that holds no address of its own: the phone's
 * quick-create sheet, or an editor that asks before a touched draft goes.
 * Only Back is caught, and only while `onBack` says it answered it; a
 * navigation the app starts is never blocked.
 */
export function useBackCloses(active: boolean, onBack: () => boolean): void {
	const latest = useRef(onBack);
	latest.current = onBack;
	useBlocker({
		shouldBlockFn: ({ action }) => {
			if (action !== "BACK") return false;
			return latest.current();
		},
		enableBeforeUnload: false,
		disabled: !active,
	});
}
