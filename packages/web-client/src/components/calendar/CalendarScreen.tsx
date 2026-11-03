import type { RemitImapCalendarSchedulingSend } from "@remit/api-http-client/types.gen.ts";
import {
	CalendarGrid,
	CalendarInvitationsNotSent,
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
	initialFocus,
	isoWeek,
	NewEventSquare,
	Segmented,
	type SegmentOption,
	weekStart,
	zonedMoment,
} from "@remit/ui";
import { Loader2 } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
	calendarInstanceId,
	calendarTaskIdOf,
	deviceTimeZone,
	useCalendarTaskWrites,
	useSendsFollowUp,
} from "../../hooks/calendar";
import { drawnRange } from "../../hooks/calendar/draft-session";
import { useDraftSession } from "../../hooks/calendar/useDraftSession";
import { useCalendarData } from "../../hooks/useCalendarData";
import { useCalendarSidePane } from "../../hooks/useCalendarSidePane";
import {
	readCalendarDensity,
	writeCalendarDensity,
} from "../../lib/calendar-density";
import { calendarEventReportHref } from "../../lib/calendar-report";
import {
	calendarViewMountsAgenda,
	isoDate,
	shownCalendarView,
	stepCalendarDate,
} from "../../lib/calendar-route";
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
		tasks,
	} = useCalendarData({ view, date, calendarIds, enabled: drawsGrid });
	const { updateTask } = useCalendarTaskWrites();
	const toggleTask = useCallback(
		(eventId: string) => {
			const task = tasks.find(
				(candidate) => candidate.calendarTaskId === calendarTaskIdOf(eventId),
			);
			if (!task) return;
			void updateTask(task, { completed: !task.completed });
		},
		[tasks, updateTask],
	);
	const [sends, setSends] = useState<RemitImapCalendarSchedulingSend[]>([]);
	const trackSends = useCallback(
		(next: readonly RemitImapCalendarSchedulingSend[]) => setSends([...next]),
		[],
	);
	const followUp = useSendsFollowUp(sends);
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
		openEvent,
		openNewEvent,
		closeToView,
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

	const hasDetail = isWriting;
	const sidePane = useCalendarSidePane(isPhone);
	const {
		session,
		dispatch,
		takeGesture,
		setOrigin,
		requestClose,
		carriedFocus,
		focusSaved,
	} = useDraftSession({
		layers: {
			eventPopup: openedEvent !== undefined,
			sidebar: isWriting,
			nav: sidePane.navOpen,
		},
		isPhone,
		closeToView,
		closeNav: () => sidePane.setNavOpen(false),
		drawnEvents: events,
	});
	const moreOptions = useCallback(
		(focusedLabel: string) => {
			if (session.mode !== "quick") return;
			carriedFocus.current = focusedLabel;
			dispatch({ type: "expand" });
			openNewEvent(searchFromRange(session.draft.range, deviceTimeZone()));
		},
		[session, carriedFocus, dispatch, openNewEvent],
	);
	const sessionValue = useMemo(
		() => ({
			session,
			dispatch,
			requestClose,
			carriedFocus,
			focusSaved,
			trackSends,
		}),
		[session, dispatch, requestClose, carriedFocus, focusSaved, trackSends],
	);
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
	const shown = shownCalendarView(view, isPhone);
	const pickSlot = (slot: CalendarSlotPick) =>
		dispatch({ type: "new-event", range: slot });
	const yearCounts = useMemo(() => {
		const counts: Record<string, number> = {};
		if (shown !== "year") return counts;
		const zone = deviceTimeZone();
		for (const event of events) {
			const day = event.allDay
				? event.start.slice(0, 10)
				: zonedMoment(event.start, zone).date;
			counts[day] = (counts[day] ?? 0) + 1;
		}
		return counts;
	}, [events, shown]);
	const timeGridDays =
		shown === "day"
			? [date]
			: shown === "week"
				? datesFrom(weekStart(date), 7)
				: undefined;
	const selectedEventId = openedEvent
		? calendarInstanceId(
				openedEvent.calendarObjectId,
				openedEvent.recurrenceId ?? "",
			)
		: "";
	const newEventRef = useRef<HTMLButtonElement>(null);
	const newEvent = useCallback(() => {
		const today = isoDate(new Date());
		const minutes = new Date().getHours() * 60;
		const days = timeGridDays ?? [date];
		const slot = initialFocus(days, today, minutes);
		setOrigin(
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: newEventRef.current,
		);
		if (openedEvent) closeToView();
		dispatch({ type: "new-event", range: clickRange(slot.date, slot.minute) });
	}, [timeGridDays, date, openedEvent, closeToView, setOrigin, dispatch]);
	const weekNumber =
		shown === "week" || shown === "day"
			? isoWeek(shown === "week" ? weekStart(date) : date)
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
	) : shown === "year" ? (
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
			canMove={(id) => calendarTaskIdOf(id) === undefined && moves.canMove(id)}
			onMoveEvent={moves.onMoveEvent}
			onToggleTask={toggleTask}
		/>
	) : (
		<CalendarGrid
			date={date}
			events={events}
			colorByCalendarId={colorByCalendarId}
			density={density}
			selectedEventId={selectedEventId}
			timeZone={deviceTimeZone()}
			now={now}
			onSelectEvent={selectEvent}
			onPickSlot={pickSlot}
			dayHref={dayHref}
			onZoomDay={zoomToDay}
			canMove={(id) => calendarTaskIdOf(id) === undefined && moves.canMove(id)}
			onMoveEvent={moves.onMoveEvent}
		/>
	);

	return (
		<CalendarSessionContext.Provider value={sessionValue}>
			<div className="flex h-full min-h-0 flex-col bg-surface text-fg">
				<CalendarScreenToolbar
					view={shown}
					views={isPhone ? PHONE_VIEWS : undefined}
					title={
						isPhone && shown === "day"
							? new Intl.DateTimeFormat(undefined, {
									weekday: "short",
									day: "numeric",
									month: "short",
									timeZone: "UTC",
								}).format(new Date(`${date}T00:00:00Z`))
							: calendarRangeTitle(shown, date)
					}
					weekNumber={weekNumber}
					onChangeView={goToView}
					onPrev={() => goToDate(stepCalendarDate(date, shown, -1))}
					onNext={() => goToDate(stepCalendarDate(date, shown, 1))}
					onToday={goToToday}
					touch={isPhone}
					sidePane={{
						open: isPhone ? sidePane.navOpen : sidePane.open,
						controls: CALENDAR_SIDE_PANE_ID,
						onToggle: sidePane.toggle,
					}}
					trailing={
						shown === "week" || shown === "day" ? (
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
							{!isWriting && (
								<PendingSuggestions onChangeFirst={changeSuggestionFirst} />
							)}
							<div
								data-calendar-body=""
								className="flex min-h-0 min-w-0 flex-1 flex-col"
							>
								{moves.banner}
								{followUp.missed.length > 0 && (
									<div className="p-2">
										<CalendarInvitationsNotSent
											missed={followUp.missed}
											onRetry={() => void followUp.retry()}
											reportHref={calendarEventReportHref(
												`Invitations not sent to ${followUp.missed.join(", ")}`,
											)}
											onDismiss={() => setSends([])}
										/>
									</div>
								)}
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
							onSaved={focusSaved}
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
