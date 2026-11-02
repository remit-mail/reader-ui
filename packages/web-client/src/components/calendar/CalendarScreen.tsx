import {
	CalendarGrid,
	CalendarScreenToolbar,
	type CalendarSlotPick,
	CalendarTimeGrid,
	calendarRangeTitle,
	type Density,
	Dialog,
	datesFrom,
	type GridDraft,
	type GridGesture,
	isoWeek,
	NewEventSquare,
	Segmented,
	type SegmentOption,
	weekStart,
} from "@remit/ui";
import { Loader2 } from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react";
import { calendarInstanceId, deviceTimeZone } from "../../hooks/calendar";
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
import { calendarViewMountsAgenda } from "../../lib/calendar-route";
import {
	useCalendarAddress,
	useCalendarNavigation,
	useIsWritingEvent,
	useOpenCalendarEvent,
} from "../../routing";
import { AgendaView } from "./AgendaView";
import { CalendarComposeSeedProvider } from "./CalendarComposeSeed";
import { CalendarLoadFailed } from "./CalendarLoadFailed";
import { CALENDAR_SIDE_PANE_ID, CalendarNavPane } from "./CalendarNavPane";
import { PendingSuggestions } from "./PendingSuggestions";

/** Presses the grid answers itself, and the popups they open. */
const GRID_OWNED =
	"[data-calendar-popover], [data-event-id], [data-time-columns], [data-all-day-row], [role='dialog']";

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
	const { events, colorByCalendarId, isLoading, error, retry, instanceOf } =
		useCalendarData({ view, date, calendarIds, enabled: drawsGrid });
	const {
		goToView,
		goToToday,
		step,
		openEvent,
		openComposer,
		closeEvent,
		changeSuggestionFirst,
		zoomToDay,
		dayHref,
	} = useCalendarNavigation();
	const openedEvent = useOpenCalendarEvent();
	const isWriting = useIsWritingEvent();
	const [density, setDensity] = useState(readCalendarDensity);
	const changeDensity = useCallback((next: Density) => {
		writeCalendarDensity(next);
		setDensity(next);
	}, []);
	const [pick, setPick] = useState<CalendarSlotPick | undefined>(undefined);

	const selectEvent = useCallback(
		(eventId: string) => {
			const instance = instanceOf(eventId);
			openEvent(instance.calendarObjectId, instance.recurrenceId);
		},
		[instanceOf, openEvent],
	);

	const pickSlot = useCallback(
		(slot: CalendarSlotPick) => {
			setPick(slot);
			openComposer();
		},
		[openComposer],
	);

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
			if (settles && layersRef.current.eventPopup) closeEvent();
			dispatch({ type: "gesture", gesture, layers: layersRef.current });
		},
		[closeEvent],
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
			else dispatch({ type: "escape", layers: layersRef.current });
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [closeEvent]);
	useEffect(() => {
		if (session.mode !== "quick") return;
		setPick(session.draft.range);
		dispatch({ type: "expand" });
		openComposer();
	}, [session, openComposer]);
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
			}
		: undefined;
	const now = new Date().toISOString();
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
	const newEventRef = useRef<HTMLButtonElement>(null);
	const newEvent = useCallback(() => {
		setPick(undefined);
		openComposer();
	}, [openComposer]);
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
		/>
	) : (
		<CalendarGrid
			view={view}
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
			onRangeChange={() => {}}
		/>
	);

	return (
		<CalendarComposeSeedProvider pick={pick}>
			<div className="flex h-full min-h-0 flex-col bg-surface text-fg">
				<CalendarScreenToolbar
					view={view}
					title={calendarRangeTitle(view, date)}
					weekNumber={weekNumber}
					onChangeView={goToView}
					onPrev={() => step(-1)}
					onNext={() => step(1)}
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
								{body}
							</div>
						</>
					)}
					{!hasDetail && detail}
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
		</CalendarComposeSeedProvider>
	);
}
