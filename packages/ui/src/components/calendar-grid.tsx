import "../calendar.css";
import type { CalendarRef, EventInput } from "@fullcalendar/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import { type MouseEvent, useEffect, useMemo, useRef } from "react";
import { calendarEventBodyClasses } from "../lib/calendar-event-shell.js";
import {
	isDraggedSelection,
	pointPick,
	rangePick,
} from "../lib/calendar-slot-pick.js";
import { cn } from "../lib/cn.js";
import type { Density } from "./app-shell-types.js";
import { CalendarEventChipContent } from "./calendar-event-chip-content.js";
import type {
	CalendarColorId,
	CalendarEventData,
	CalendarSlotPick,
	CalendarTaskData,
	RsvpState,
	ZoneCertainty,
} from "./calendar-types.js";

/**
 * A month of days, drawn by the calendar engine and styled entirely through
 * its per-element `*Class` props. The day and the week are the kit's own time
 * grid (`CalendarTimeGrid`); only the month uses the engine.
 *
 * The component is presentational. It holds no events of its own, reads no
 * clock of its own, and every gesture leaves through a callback.
 */

const PLUGINS = [dayGridPlugin, interactionPlugin];

const MAX_EVENTS: Record<Density, number> = { comfortable: 3, compact: 2 };

const FALLBACK_COLOR: CalendarColorId = "cal-1";

export interface CalendarGridProps {
	/** A day in the month on screen; changing it moves the grid. */
	date: string;
	events: CalendarEventData[];
	/** Which calendar owns which hue. Anything missing falls back to cal-1. */
	colorByCalendarId: Record<string, CalendarColorId>;
	density: Density;
	selectedEventId: string;
	/** IANA zone the grid's clock runs on, and the zone a pick is read in. */
	timeZone: string;
	/** The instant the grid calls now: the today marker reads it. */
	now: string;
	onSelectEvent: (eventId: string) => void;
	onPickSlot: (pick: CalendarSlotPick) => void;
	dayHref: (date: string) => string;
	onZoomDay: (date: string) => void;
	/** Whether an event may be dragged to other days; its calendar takes writes. */
	canMove?: (eventId: string) => boolean;
	/** A stored event dropped on other days, or stretched across more. */
	onMoveEvent?: (eventId: string, range: CalendarSlotPick) => void;
	/** Tasks due in the month, each on its due day. */
	tasks?: readonly CalendarTaskData[];
	onSelectTask?: (calendarTaskId: string) => void;
	className?: string;
}

/**
 * What drawing one event needs, keyed by id. The engine renders the element and
 * hands the callback its own `EventApi`, so the data is looked up rather than
 * smuggled through `extendedProps` and cast back out.
 */
interface GridEvent {
	color: CalendarColorId;
	rsvp: RsvpState;
	status: "confirmed" | "tentative";
	hasThread: boolean;
	isRecurring: boolean;
	zoneCertainty: ZoneCertainty;
}

/** The placeholder the engine drags under the pointer, which is not one of ours. */
const MIRROR_EVENT: GridEvent = {
	color: FALLBACK_COLOR,
	rsvp: "accepted",
	status: "confirmed",
	hasThread: false,
	isRecurring: false,
	zoneCertainty: "local",
};

const isoDayInZone = (instant: Date, timeZone: string): string =>
	new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(instant);

const isModifiedClick = (click: MouseEvent<HTMLElement>): boolean =>
	click.button !== 0 ||
	click.metaKey ||
	click.ctrlKey ||
	click.shiftKey ||
	click.altKey;

export function CalendarGrid({
	date,
	events,
	colorByCalendarId,
	density,
	selectedEventId,
	timeZone,
	now,
	onSelectEvent,
	onPickSlot,
	dayHref,
	onZoomDay,
	canMove = () => false,
	onMoveEvent,
	tasks = [],
	onSelectTask,
	className,
}: CalendarGridProps) {
	const calendarRef = useRef<CalendarRef>(null);

	useEffect(() => {
		calendarRef.current?.getApi().gotoDate(date);
	}, [date]);

	const taskById = useMemo(
		() => new Map(tasks.map((task) => [task.calendarTaskId, task])),
		[tasks],
	);

	const eventInputs = useMemo<EventInput[]>(
		() => [
			...events.map((event) => ({
				id: event.id,
				title: event.title,
				start: event.start,
				end: event.end,
				allDay: event.allDay,
				editable: onMoveEvent !== undefined && canMove(event.id),
			})),
			...tasks.map((task) => ({
				id: task.calendarTaskId,
				title: task.title,
				start: task.due,
				allDay: task.allDay,
				editable: false,
			})),
		],
		[events, tasks, canMove, onMoveEvent],
	);

	const dropped = (info: {
		event: { id: string; startStr: string; endStr: string; allDay: boolean };
		revert: () => void;
	}) => {
		info.revert();
		onMoveEvent?.(
			info.event.id,
			rangePick(
				info.event.startStr,
				info.event.endStr === "" ? info.event.startStr : info.event.endStr,
				info.event.allDay,
			),
		);
	};

	const byId = useMemo(
		() =>
			new Map<string, GridEvent>(
				events.map((event) => [
					event.id,
					{
						color: colorByCalendarId[event.calendarId] ?? FALLBACK_COLOR,
						rsvp: event.myRsvp,
						status: event.status,
						hasThread: event.threadId !== "",
						isRecurring: event.recurrenceRule !== "",
						zoneCertainty: event.zoneCertainty,
					},
				]),
			),
		[events, colorByCalendarId],
	);

	const lookup = (id: string) => byId.get(id) ?? MIRROR_EVENT;

	return (
		<div
			data-testid="calendar-grid"
			className={cn("h-full min-h-0 w-full text-fg", className)}
		>
			<FullCalendar
				ref={calendarRef}
				plugins={PLUGINS}
				initialView="dayGridMonth"
				initialDate={date}
				now={now}
				timeZone={timeZone}
				height="100%"
				headerToolbar={false}
				firstDay={1}
				fixedWeekCount={false}
				selectable
				editable={false}
				/* Events take focus and answer Enter, the way the toolbar's controls
				   do — the grid is not reachable by pointer only. */
				eventInteractive
				expandRows
				dayMaxEvents={MAX_EVENTS[density]}
				dayCellTopContent={(info) => {
					const day = isoDayInZone(info.date, timeZone);
					return (
						<a
							href={dayHref(day)}
							aria-label={`Open ${info.date.toLocaleDateString("en-GB", { dateStyle: "full", timeZone })}`}
							className="hover:underline"
							onClick={(click) => {
								if (isModifiedClick(click)) return;
								click.preventDefault();
								onZoomDay(day);
							}}
						>
							{Number(day.slice(8))}
						</a>
					);
				}}
				dayCellDidMount={(info) => {
					/* The engine hides a day number from assistive tech unless it is its
					   own nav link, and a link inside a hidden wrapper is unreachable. */
					info.el
						.querySelector(":scope [aria-hidden='true']:has(> a)")
						?.removeAttribute("aria-hidden");
					/* A press on the link must not start the engine's cell click: it
					   finishes a task after the pointer is up, by which time the link
					   has already moved the view and the cell it wants is gone. */
					const link = info.el.querySelector("a");
					for (const type of ["mousedown", "touchstart", "pointerdown"]) {
						link?.addEventListener(type, (press) => press.stopPropagation());
					}
				}}
				moreLinkClick="popover"
				moreLinkText={(num) => `+${num}`}
				displayEventEnd={false}
				eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
				dayHeaderFormat={{ weekday: "short" }}
				events={eventInputs}
				eventClick={(info) =>
					taskById.has(info.event.id)
						? onSelectTask?.(info.event.id)
						: onSelectEvent(info.event.id)
				}
				eventDrop={dropped}
				eventResize={dropped}
				eventDidMount={(info) => {
					info.el.setAttribute(
						taskById.has(info.event.id) ? "data-task-id" : "data-event-id",
						info.event.id,
					);
				}}
				/* A point is `dateClick`'s and a dragged run of days is `select`'s;
				   acting on both would report a point twice. */
				dateClick={(info) => onPickSlot(pointPick(info.dateStr, info.allDay))}
				select={(info) => {
					if (!isDraggedSelection(info.startStr, info.endStr, true, 0)) {
						info.view.calendar.unselect();
						return;
					}
					onPickSlot(rangePick(info.startStr, info.endStr, true));
				}}
				/* ---- chrome, all of it ours ---- */
				viewClass="bg-surface"
				tableClass="border-line"
				tableHeaderClass="bg-surface"
				fillerClass="border-line"
				dayHeaderRowClass="h-pane-header"
				dayHeaderClass={(info) =>
					cn(
						"border-b border-line bg-surface",
						info.isToday ? "text-accent" : "text-fg-subtle",
					)
				}
				dayHeaderInnerClass="px-1 py-1 text-2xs font-semibold uppercase tracking-wider"
				dayHeaderDividerClass="border-b border-line"
				dayCellClass={(info) =>
					cn("border-line", info.isOther && "bg-surface-sunken")
				}
				dayCellTopInnerClass={(info) =>
					cn(
						"px-1 py-0.5 text-2xs tabular-nums",
						info.isToday ? "font-semibold text-accent" : "text-fg-muted",
					)
				}
				dayRowClass="border-line"
				highlightClass="bg-accent-soft"
				moreLinkClass="rounded-sm bg-surface-sunken text-2xs font-semibold text-fg-muted hover:bg-line hover:text-fg"
				moreLinkInnerClass="px-1 py-0.5"
				popoverClass="rounded-lg border border-line bg-surface-raised shadow-xl shadow-black/20"
				popoverCloseClass="text-fg-subtle hover:text-fg"
				eventClass={(info) =>
					cn(
						calendarEventBodyClasses({
							color: lookup(info.event.id).color,
							layout: "row",
							density: "compact",
							rsvp: lookup(info.event.id).rsvp,
							status: lookup(info.event.id).status,
							selected: info.event.id === selectedEventId,
							stacked: false,
						}),
						"my-px cursor-pointer px-1 py-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
					)
				}
				eventContent={(info) => {
					const task = taskById.get(info.event.id);
					if (task)
						return (
							<span
								className={cn(
									"flex min-w-0 items-center gap-1 truncate",
									task.completed && "line-through opacity-60",
								)}
							>
								<span aria-hidden="true">{task.completed ? "☑" : "☐"}</span>
								<span className="truncate">
									{task.title === "" ? "(No title)" : task.title}
								</span>
							</span>
						);
					const event = lookup(info.event.id);
					return (
						<CalendarEventChipContent
							title={info.event.title}
							timeText={density === "compact" ? "" : info.timeText}
							layout="row"
							rsvp={event.rsvp}
							hasThread={event.hasThread}
							isRecurring={event.isRecurring}
							zoneCertainty={event.zoneCertainty}
						/>
					);
				}}
			/>
		</div>
	);
}
