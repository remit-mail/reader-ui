import {
	CalendarGrid,
	CalendarScreenToolbar,
	type CalendarSlotPick,
	CalendarTimeGrid,
	type CalendarViewId,
	CalendarYear,
	calendarRangeTitle,
	clickRange,
	type Density,
	Dialog,
	datesFrom,
	type GridDraft,
	type GridGesture,
	initialFocus,
	isoWeek,
	NewEventSquare,
	Segmented,
	type SegmentOption,
	weekStart,
	zonedMoment,
} from "@remit/ui";
import { Loader2 } from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import {
	addDays,
	calendarInstanceId,
	deviceTimeZone,
} from "../../hooks/calendar";
import {
	draftSessionReducer,
	drawnRange,
	escapeTarget,
	IDLE,
} from "../../hooks/calendar/draft-session";
import { useCalendarData } from "../../hooks/useCalendarData";
import { useCalendarSidePane } from "../../hooks/useCalendarSidePane";
import {
	readCalendarDensity,
	writeCalendarDensity,
} from "../../lib/calendar-density";
import { calendarViewMountsAgenda, isoDate } from "../../lib/calendar-route";
import { searchFromRange } from "../../lib/new-event-range";
import {
	useCalendarAddress,
	useCalendarNavigation,
	useEditingEvent,
	useIsWritingEvent,
	useOpenCalendarEvent,
} from "../../routing";
import { AgendaView } from "./AgendaView";
import { CalendarLoadFailed } from "./CalendarLoadFailed";
import { CALENDAR_SIDE_PANE_ID, CalendarNavPane } from "./CalendarNavPane";
import { CalendarQuickCreate } from "./CalendarQuickCreate";
import { CalendarSessionContext } from "./CalendarSession";
import { useEventMoves } from "./EventMoves";
import { PendingSuggestions } from "./PendingSuggestions";

/** Presses the grid answers itself, and the popups they open. */
const GRID_OWNED =
	"[data-calendar-popover], [data-event-id], [data-time-columns], [data-all-day-row], [role='dialog']";

const PHONE_VIEWS: CalendarViewId[] = ["day", "month", "agenda"];

const DENSITY_OPTIONS: SegmentOption<Density>[] = [
	{ value: "comfortable", label: "Detail", shortLabel: "Detail" },
	{ value: "compact", label: "Glance", shortLabel: "Glance" },
];

const FAILED_TITLE = {
	year: "Couldn't load this year",
	month: "Couldn't load this month",
	week: "Couldn't load this week",
	day: "Couldn't load this day",
	agenda: "Couldn't load these days",
} as const;

export interface CalendarScreenProps {
	isPhone: boolean;
	/** What the route below the view has open: an event, the editor. */
	detail: ReactNode;
}

/**
 * The calendar's own screen: the toolbar across the top and the view under it,
 * with the grid taking the whole width the panes leave.
 */
export function CalendarScreen({ isPhone, detail }: CalendarScreenProps) {
	const { view, date, calendarIds } = useCalendarAddress();
	const drawsGrid = !calendarViewMountsAgenda(view);
	const {
		events: storedEvents,
		calendars,
		timeZoneByCalendarId,
		colorByCalendarId,
		isLoading,
		error,
		retry,
		instanceOf,
	} = useCalendarData({ view, date, calendarIds, enabled: drawsGrid });
	const moves = useEventMoves(
		storedEvents,
		calendars,
		timeZoneByCalendarId,
		retry,
	);
	const events = moves.events;
	const {
		goToView,
		goToToday,
		goToDate,
		step,
		openEvent,
		openNewEvent,
		closeEvent,
		changeSuggestionFirst,
		zoomToDay,
		dayHref,
	} = useCalendarNavigation();
	const editingEvent = useEditingEvent();
	const routedEvent = useOpenCalendarEvent();
	const openedEvent = editingEvent ? undefined : routedEvent;
	const isWriting = useIsWritingEvent();
	const [density, setDensity] = useState(readCalendarDensity);
	const changeDensity = useCallback((next: Density) => {
		writeCalendarDensity(next);
		setDensity(next);
	}, []);

	const selectEvent = useCallback(
		(eventId: string) => {
			const instance = instanceOf(eventId);
			openEvent(instance.calendarObjectId, instance.recurrenceId);
		},
		[instanceOf, openEvent],
	);

	const pickSlot = useCallback((slot: CalendarSlotPick) => {
		dispatch({ type: "new-event", range: slot });
	}, []);

	const hasDetail = isWriting;
	const [session, dispatch] = useReducer(draftSessionReducer, IDLE);
	const layers = {
		eventPopup: openedEvent !== undefined,
		sidebar: isWriting,
		nav: false,
	};
	const layersRef = useRef(layers);
	layersRef.current = layers;
	const takeGesture = useCallback(
		(gesture: GridGesture) => {
			const settles =
				gesture.type === "click" ||
				gesture.type === "drag-end" ||
				gesture.type === "keyboard";
			if (
				isPhone &&
				gesture.type === "click" &&
				sessionRef.current.mode === "idle" &&
				!layersRef.current.eventPopup
			)
				return;
			if (settles && layersRef.current.eventPopup) closeEvent();
			if (
				(gesture.type === "click" || gesture.type === "keyboard") &&
				sessionRef.current.mode === "idle"
			)
				originRef.current = gesture.origin;
			if (gesture.type === "drag-end" && sessionRef.current.mode === "idle")
				originRef.current = document.querySelector<HTMLElement>(
					"[role='grid'][aria-label='Time grid']",
				);
			dispatch({ type: "gesture", gesture, layers: layersRef.current });
		},
		[closeEvent, isPhone],
	);
	const sessionRef = useRef(session);
	sessionRef.current = session;
	useEffect(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (!(event.target instanceof Element)) return;
			if (event.target.closest(GRID_OWNED)) return;
			if (layersRef.current.eventPopup) closeEvent();
			dispatch({ type: "outside" });
		};
		document.addEventListener("pointerdown", onPointerDown, true);
		return () =>
			document.removeEventListener("pointerdown", onPointerDown, true);
	}, [closeEvent]);
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			const target = escapeTarget(sessionRef.current, layersRef.current);
			if (target === null || target === "drag") return;
			event.preventDefault();
			if (target === "event-popup") closeEvent();
			else if (target === "sidebar") requestClose.current?.();
			else if (target === "nav") sidePaneRef.current?.setNavOpen(false);
			else dispatch({ type: "escape", layers: layersRef.current });
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [closeEvent]);
	const originRef = useRef<HTMLElement | null>(null);
	const savedRef = useRef(false);
	const [focusAfterSave, setFocusAfterSave] = useState("");
	const wasQuick = useRef(false);
	useEffect(() => {
		const isQuick = session.mode === "quick";
		if (wasQuick.current && session.mode === "idle" && !savedRef.current)
			originRef.current?.focus();
		if (isQuick) savedRef.current = false;
		wasQuick.current = isQuick;
	}, [session.mode]);
	useEffect(() => {
		if (focusAfterSave === "" || events.length === 0) return;
		const chip = document.querySelector<HTMLElement>(
			`[data-event-id^="${CSS.escape(focusAfterSave)}"]`,
		);
		if (!chip) return;
		chip.focus();
		setFocusAfterSave("");
	}, [focusAfterSave, events]);
	const requestClose = useRef<(() => void) | null>(null);
	const carriedFocus = useRef("");
	const moreOptions = useCallback(
		(focusedLabel: string) => {
			if (sessionRef.current.mode !== "quick") return;
			carriedFocus.current = focusedLabel;
			const bounds = searchFromRange(
				sessionRef.current.draft.range,
				deviceTimeZone(),
			);
			dispatch({ type: "expand" });
			openNewEvent(bounds);
		},
		[openNewEvent],
	);
	const saved = useCallback((calendarObjectId: string) => {
		savedRef.current = true;
		setFocusAfterSave(calendarObjectId);
	}, []);
	const sessionValue = useMemo(
		() => ({
			session,
			dispatch,
			requestClose,
			carriedFocus,
			focusSaved: saved,
		}),
		[session, saved],
	);
	useEffect(() => {
		if (!isWriting) dispatch({ type: "sidebar-closed" });
	}, [isWriting]);
	const drawn = drawnRange(session);
	const gridDraft: GridDraft | undefined = drawn
		? {
				range: drawn,
				title: session.mode === "idle" ? "" : session.draft.title,
				tone:
					session.mode === "sidebar" && !session.dragging
						? "draft"
						: "selection",
				warning: session.mode === "quick" && session.status === "failed",
				handles: session.mode === "sidebar",
			}
		: undefined;
	const now = new Date().toISOString();
	const yearCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		if (view !== "year") return counts;
		const zone = deviceTimeZone();
		for (const event of events) {
			const day = event.allDay
				? event.start.slice(0, 10)
				: zonedMoment(event.start, zone).date;
			counts[day] = (counts[day] ?? 0) + 1;
		}
		return counts;
	}, [events, view]);
	const timeGridDays =
		view === "day" || (isPhone && view === "week")
			? [date]
			: view === "week"
				? datesFrom(weekStart(date), 7)
				: undefined;
	const selectedEventId = openedEvent
		? calendarInstanceId(
				openedEvent.calendarObjectId,
				openedEvent.recurrenceId ?? "",
			)
		: "";
	const sidePane = useCalendarSidePane(isPhone);
	const phoneDay = isPhone && view === "week";
	const sidePaneRef = useRef(sidePane);
	sidePaneRef.current = sidePane;
	const newEventRef = useRef<HTMLButtonElement>(null);
	const newEvent = useCallback(() => {
		const today = isoDate(new Date());
		const minutes = new Date().getHours() * 60;
		const days = timeGridDays ?? [date];
		const slot = initialFocus(days, today, minutes);
		originRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: newEventRef.current;
		if (layersRef.current.eventPopup) closeEvent();
		dispatch({ type: "new-event", range: clickRange(slot.date, slot.minute) });
	}, [timeGridDays, date, closeEvent]);
	const weekNumber =
		view === "week" || view === "day"
			? isoWeek(view === "week" ? weekStart(date) : date)
			: undefined;

	const body = calendarViewMountsAgenda(view) ? (
		<AgendaView density={density} onPickSlot={pickSlot} />
	) : error !== undefined && error !== null ? (
		<CalendarLoadFailed
			title={FAILED_TITLE[view]}
			error={error}
			onRetry={retry}
		/>
	) : isLoading ? (
		<div
			role="status"
			aria-label="Loading the calendar"
			className="flex h-full items-center justify-center bg-surface"
		>
			<Loader2 className="size-6 animate-spin text-fg-subtle" />
		</div>
	) : view === "year" && !isPhone ? (
		<CalendarYear
			date={date}
			today={isoDate(new Date())}
			counts={yearCounts}
			onPickDay={zoomToDay}
		/>
	) : timeGridDays ? (
		<CalendarTimeGrid
			days={timeGridDays}
			events={events}
			colorByCalendarId={colorByCalendarId}
			density={density}
			timeZone={deviceTimeZone()}
			now={now}
			selectedEventId={selectedEventId}
			draft={gridDraft}
			onGesture={takeGesture}
			onSelectEvent={selectEvent}
			onOpenDay={zoomToDay}
			touch={isPhone}
			canMove={moves.canMove}
			onMoveEvent={moves.onMoveEvent}
		/>
	) : (
		<CalendarGrid
			view={view === "year" ? "month" : view}
			date={date}
			events={events}
			colorByCalendarId={colorByCalendarId}
			density={density}
			selectedEventId={
				openedEvent
					? calendarInstanceId(
							openedEvent.calendarObjectId,
							openedEvent.recurrenceId ?? "",
						)
					: ""
			}
			timeZone={deviceTimeZone()}
			now={new Date().toISOString()}
			onSelectEvent={selectEvent}
			onPickSlot={pickSlot}
			dayHref={dayHref}
			onZoomDay={zoomToDay}
			canMove={moves.canMove}
			onMoveEvent={moves.onMoveEvent}
			onRangeChange={() => {}}
		/>
	);

	return (
		<CalendarSessionContext.Provider value={sessionValue}>
			<div className="flex h-full min-h-0 flex-col bg-surface text-fg">
				<CalendarScreenToolbar
					view={phoneDay ? "day" : isPhone && view === "year" ? "month" : view}
					views={isPhone ? PHONE_VIEWS : undefined}
					title={
						isPhone && timeGridDays?.length === 1
							? new Intl.DateTimeFormat(undefined, {
									weekday: "short",
									day: "numeric",
									month: "short",
									timeZone: "UTC",
								}).format(new Date(`${date}T00:00:00Z`))
							: calendarRangeTitle(view, date)
					}
					weekNumber={weekNumber}
					onChangeView={goToView}
					onPrev={() => (phoneDay ? goToDate(addDays(date, -1)) : step(-1))}
					onNext={() => (phoneDay ? goToDate(addDays(date, 1)) : step(1))}
					onToday={goToToday}
					touch={isPhone}
					sidePane={{
						open: isPhone ? sidePane.navOpen : sidePane.open,
						controls: CALENDAR_SIDE_PANE_ID,
						onToggle: sidePane.toggle,
					}}
					trailing={
						view === "week" || view === "day" ? (
							<Segmented
								ariaLabel="Calendar density"
								options={DENSITY_OPTIONS}
								value={density}
								onChange={changeDensity}
								touch={isPhone}
								className="shrink-0"
							/>
						) : undefined
					}
				/>
				<div className="relative flex min-h-0 flex-1">
					{sidePane.open && (
						<CalendarNavPane onNewEvent={newEvent} newEventRef={newEventRef} />
					)}
					{!(isPhone && hasDetail) && (
						<>
							{isPhone && session.mode === "idle" && (
								<NewEventSquare
									onNewEvent={newEvent}
									newEventRef={newEventRef}
									className="fixed right-4 bottom-[calc(var(--app-tab-bar,0px)+1rem)] z-30 size-14 rounded-full"
								/>
							)}
							{!sidePane.open && !isPhone && (
								<NewEventSquare
									onNewEvent={newEvent}
									newEventRef={newEventRef}
									className="absolute top-2 left-2 z-20"
								/>
							)}
							<PendingSuggestions onChangeFirst={changeSuggestionFirst} />
							<div
								data-calendar-body=""
								className="flex min-h-0 min-w-0 flex-1 flex-col"
							>
								{moves.banner}
								{body}
							</div>
						</>
					)}
					{!hasDetail && detail}
					{session.mode === "quick" && (
						<CalendarQuickCreate
							session={session}
							dispatch={dispatch}
							onMoreOptions={moreOptions}
							onSaved={saved}
							touch={isPhone}
						/>
					)}
					{hasDetail && (
						<aside
							aria-label="Event"
							className={
								isPhone
									? "min-h-0 min-w-0 flex-1"
									: "w-[26rem] shrink-0 border-l border-line"
							}
						>
							{detail}
						</aside>
					)}
				</div>
			</div>
			{moves.prompt}
			{isPhone && (
				<Dialog
					open={sidePane.navOpen}
					onClose={() => sidePane.setNavOpen(false)}
					title="Calendars"
					anchor="left"
				>
					<CalendarNavPane
						onNewEvent={newEvent}
						onPicked={() => sidePane.setNavOpen(false)}
						className="w-full"
					/>
				</Dialog>
			)}
		</CalendarSessionContext.Provider>
	);
}
