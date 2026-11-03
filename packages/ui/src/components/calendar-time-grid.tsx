import { TriangleAlert } from "lucide-react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { calendarColorClasses } from "../lib/calendar-color.js";
import { calendarEventBodyClasses } from "../lib/calendar-event-shell.js";
import {
	allDayRange,
	clickRange,
	isDrag,
	minuteAt,
	rangeMinutes,
	timedRange,
} from "../lib/calendar-slot-pick.js";
import { cn } from "../lib/cn.js";
import {
	moveDays,
	moveTimed,
	resizeDays,
	resizeTimed,
	snappedMinutes,
} from "../lib/event-drag.js";
import {
	type GridSlot,
	initialFocus,
	moveFocus,
	stretchRange,
} from "../lib/grid-keyboard.js";
import {
	HOLD_MS,
	type Press,
	pressMove,
	pressStart,
	pressTick,
	stepHandle,
} from "../lib/long-press.js";
import {
	layoutAllDay,
	layoutDay,
	type ZonedMoment,
	zonedMoment,
} from "../lib/time-grid-layout.js";
import type { Density } from "./app-shell-types.js";
import { CalendarEventChipContent } from "./calendar-event-chip-content.js";
import type {
	CalendarColorId,
	CalendarEventData,
	CalendarSlotPick,
} from "./calendar-types.js";

/** What a reader did on the grid, for whoever holds the draft to decide. */
export type GridGesture =
	| { type: "drag"; range: CalendarSlotPick }
	| { type: "drag-cancel" }
	| { type: "drag-end"; range: CalendarSlotPick }
	| { type: "click"; range: CalendarSlotPick; origin: HTMLElement | null }
	| { type: "keyboard"; range: CalendarSlotPick; origin: HTMLElement | null };

/** The one range the grid draws over the events: a selection, or the draft being edited. */
export interface GridDraft {
	range: CalendarSlotPick;
	title: string;
	/** `selection` is solid, as a range being picked; `draft` is dashed and labelled. */
	tone: "selection" | "draft";
	/** A save of this draft failed. */
	warning?: boolean;
	/** Grab handles at both ends, which resize the range. */
	handles?: boolean;
}

export interface CalendarTimeGridProps {
	/** The days in view, `YYYY-MM-DD`. */
	days: readonly string[];
	events: readonly CalendarEventData[];
	colorByCalendarId: Readonly<Record<string, CalendarColorId>>;
	density: Density;
	/** The zone the grid's clock runs on. */
	timeZone: string;
	/** The instant the grid calls now. */
	now: string;
	selectedEventId?: string;
	draft?: GridDraft;
	onGesture: (gesture: GridGesture) => void;
	onSelectEvent: (eventId: string, chip: HTMLElement) => void;
	/** A day heading opens that day. */
	onOpenDay?: (date: string) => void;
	/** A finger selects by holding still, so a scroll never selects. */
	touch?: boolean;
	/** Whether an event may be dragged to a new time; its calendar takes writes. */
	canMove?: (eventId: string) => boolean;
	/** A stored event dropped at a new time or with a new end. */
	onMoveEvent?: (eventId: string, range: CalendarSlotPick) => void;
	/** Ticks or unticks a task drawn on the grid. */
	onToggleTask?: (eventId: string) => void;
	className?: string;
}

const HOUR_HEIGHT: Record<Density, number> = { comfortable: 48, compact: 24 };
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const ALL_DAY_LANE = 22;
const FALLBACK_COLOR: CalendarColorId = "cal-1";

const pad = (value: number): string => String(value).padStart(2, "0");
const clock = (minute: number): string =>
	`${pad(Math.floor(minute / 60) % 24)}:${pad(minute % 60)}`;

const dayLabel = (date: string, options: Intl.DateTimeFormatOptions): string =>
	new Intl.DateTimeFormat(undefined, { ...options, timeZone: "UTC" }).format(
		new Date(`${date}T00:00:00Z`),
	);

/** "Wednesday 4 November, 08:00 to 09:45", for the live region and the focused slot. */
export function describeRange(range: CalendarSlotPick): string {
	const first = dayLabel(range.date, {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
	if (range.allDay) {
		if (range.endDate === range.date) return `${first}, all day`;
		return `${first} to ${dayLabel(range.endDate, { weekday: "long", day: "numeric", month: "long" })}, all day`;
	}
	return `${first}, ${range.startTime} to ${range.endTime}`;
}

function zoneLabel(timeZone: string, now: string): string {
	const part = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		timeZoneName: "short",
	})
		.formatToParts(new Date(now))
		.find((candidate) => candidate.type === "timeZoneName");
	return part?.value ?? "";
}

interface LiftGesture {
	id: string;
	kind: "move" | "resize";
	allDay: boolean;
	pointerId: number;
	x: number;
	y: number;
	startColumn: string;
	start: ZonedMoment;
	end: ZonedMoment;
	first: string;
	last: string;
	dragging: boolean;
	press: Press | null;
	range: CalendarSlotPick | null;
	invalid: boolean;
}

interface PointerGesture {
	kind: "timed" | "all-day" | "handle-start" | "handle-end" | "touch";
	pointerId: number;
	date: string;
	anchorMinute: number;
	x: number;
	y: number;
	dragging: boolean;
	range: CalendarSlotPick | null;
	origin: HTMLElement;
}

/**
 * A day or a week of time, drawn by the kit rather than a calendar engine, so
 * a press, a drag, a hold and the keyboard all reach the grid the same way.
 * Every gesture leaves through `onGesture`; the grid only draws the draft it
 * is handed.
 */
export function CalendarTimeGrid({
	days,
	events,
	colorByCalendarId,
	density,
	timeZone,
	now,
	selectedEventId = "",
	draft,
	onGesture,
	onSelectEvent,
	onOpenDay,
	touch = false,
	canMove = () => false,
	onMoveEvent,
	onToggleTask,
	className,
}: CalendarTimeGridProps) {
	const hourHeight = HOUR_HEIGHT[density];
	const scrollRef = useRef<HTMLDivElement>(null);
	const columnsRef = useRef<HTMLDivElement>(null);
	const allDayRef = useRef<HTMLDivElement>(null);
	const gesture = useRef<PointerGesture | null>(null);
	const press = useRef<Press | null>(null);
	const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const [focusSlot, setFocusSlot] = useState<GridSlot | null>(null);
	const [stretchAnchor, setStretchAnchor] = useState<GridSlot | null>(null);
	const [hasFocus, setHasFocus] = useState(false);
	const [live, setLive] = useState("");
	const focusCellId = useId();
	const today = zonedMoment(now, timeZone);

	const zoned = useMemo(
		() =>
			events.map((event) => ({
				event,
				start: zonedMoment(event.start, timeZone),
				end: zonedMoment(event.end, timeZone),
			})),
		[events, timeZone],
	);
	const timed = zoned.filter((entry) => !entry.event.allDay);
	const allDay = zoned.filter((entry) => entry.event.allDay);
	const byId = useMemo(
		() => new Map(zoned.map((entry) => [entry.event.id, entry.event])),
		[zoned],
	);

	const bars = layoutAllDay(
		days,
		allDay.map((entry) => ({
			id: entry.event.id,
			first: entry.event.start.slice(0, 10),
			last: lastDayOf(entry.event),
		})),
	);
	const draftBar =
		draft?.range.allDay === true
			? layoutAllDay(days, [
					{ id: "draft", first: draft.range.date, last: draft.range.endDate },
				])[0]
			: undefined;
	const laneCount = Math.max(
		1,
		...bars.map((bar) => bar.lane + 1),
		draftBar ? 1 : 0,
	);

	const rangeKey = days.join(",");
	const firstScroll = days.includes(today.date)
		? Math.max(0, today.minute - 90)
		: 8 * 60;
	const firstScrollRef = useRef(firstScroll);
	firstScrollRef.current = firstScroll;
	useLayoutEffect(() => {
		const scroller = scrollRef.current;
		if (!scroller || rangeKey === "") return;
		scroller.scrollTop = (firstScrollRef.current / 60) * hourHeight;
	}, [rangeKey, hourHeight]);

	const rootRef = useRef<HTMLDivElement>(null);
	const lift = useRef<LiftGesture | null>(null);
	const liftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const suppressClick = useRef(false);
	const [lifted, setLifted] = useState<{
		id: string;
		range: CalendarSlotPick;
		invalid: boolean;
	} | null>(null);

	const endLift = useCallback(() => {
		lift.current = null;
		clearTimeout(liftTimer.current);
		setLifted(null);
	}, []);

	const endGesture = useCallback(() => {
		gesture.current = null;
		press.current = null;
		clearTimeout(holdTimer.current);
	}, []);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			if (lift.current?.dragging) {
				event.preventDefault();
				event.stopImmediatePropagation();
				suppressClick.current = true;
				endLift();
				return;
			}
			if (!gesture.current) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			endGesture();
			onGesture({ type: "drag-cancel" });
		};
		window.addEventListener("keydown", onKey, true);
		return () => window.removeEventListener("keydown", onKey, true);
	}, [endGesture, endLift, onGesture]);

	useEffect(() => {
		const scroller = scrollRef.current;
		if (!scroller) return;
		const holdScroll = (event: TouchEvent) => {
			if (
				press.current?.phase === "held" ||
				gesture.current?.dragging ||
				lift.current?.dragging
			)
				event.preventDefault();
		};
		scroller.addEventListener("touchmove", holdScroll, { passive: false });
		return () => scroller.removeEventListener("touchmove", holdScroll);
	}, []);

	const columnAt = (clientX: number): string | undefined => {
		const container = columnsRef.current;
		if (!container) return undefined;
		const box = container.getBoundingClientRect();
		const index = Math.floor(((clientX - box.left) / box.width) * days.length);
		return days[Math.min(days.length - 1, Math.max(0, index))];
	};

	const minuteOf = (clientY: number): number => {
		const container = columnsRef.current;
		if (!container) return 0;
		return minuteAt(
			clientY - container.getBoundingClientRect().top,
			hourHeight,
		);
	};

	const announce = (range: CalendarSlotPick) => setLive(describeRange(range));

	const startLift = (
		event: ReactPointerEvent<HTMLElement>,
		data: CalendarEventData,
		kind: "move" | "resize",
	) => {
		event.stopPropagation();
		if (event.button !== 0 || !canMove(data.id) || !onMoveEvent) return;
		const column = columnAt(event.clientX);
		if (!column) return;
		capturePointer(event.currentTarget, event.pointerId);
		const byFinger = touch && event.pointerType === "touch";
		lift.current = {
			id: data.id,
			kind,
			allDay: data.allDay,
			pointerId: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			startColumn: column,
			start: zonedMoment(data.start, timeZone),
			end: zonedMoment(data.end, timeZone),
			first: data.start.slice(0, 10),
			last: lastDayOf(data),
			dragging: false,
			press: byFinger
				? pressStart(event.clientX, event.clientY, Date.now())
				: null,
			range: null,
			invalid: false,
		};
		if (!byFinger) return;
		liftTimer.current = setTimeout(() => {
			const current = lift.current;
			if (!current?.press) return;
			current.press = pressTick(current.press, Date.now() + 1);
			if (current.press.phase !== "held") return;
			current.dragging = true;
			navigator.vibrate?.(10);
			placeLift(current, current.x, current.y);
		}, HOLD_MS);
	};

	const placeLift = (
		current: LiftGesture,
		clientX: number,
		clientY: number,
	) => {
		const dayDelta =
			days.indexOf(columnAt(clientX) ?? current.startColumn) -
			days.indexOf(current.startColumn);
		const minutes = snappedMinutes(clientY - current.y, hourHeight);
		let range: CalendarSlotPick;
		if (current.allDay) {
			const moved =
				current.kind === "move"
					? moveDays(current.first, current.last, dayDelta)
					: {
							first: current.first,
							last: resizeDays(current.first, current.last, dayDelta),
						};
			range = {
				date: moved.first,
				endDate: moved.last,
				startTime: "",
				endTime: "",
				allDay: true,
			};
		} else {
			const moved =
				current.kind === "move"
					? moveTimed(current.start, current.end, dayDelta, minutes)
					: {
							start: current.start,
							end: resizeTimed(current.start, current.end, minutes),
						};
			range = {
				date: moved.start.date,
				endDate: moved.end.date,
				startTime: clock(moved.start.minute),
				endTime: clock(moved.end.minute),
				allDay: false,
			};
		}
		const box = rootRef.current?.getBoundingClientRect();
		const invalid =
			box !== undefined &&
			(clientX < box.left ||
				clientX > box.right ||
				clientY < box.top ||
				clientY > box.bottom);
		current.range = range;
		current.invalid = invalid;
		setLifted({ id: current.id, range, invalid });
	};

	const moveLift = (event: ReactPointerEvent<HTMLElement>) => {
		const current = lift.current;
		if (!current || current.pointerId !== event.pointerId) return;
		if (current.press) {
			current.press = pressMove(current.press, event.clientX, event.clientY);
			if (current.press.phase === "scrolled") {
				endLift();
				return;
			}
			if (current.press.phase !== "held") return;
		} else if (
			!current.dragging &&
			!isDrag(event.clientX - current.x, event.clientY - current.y)
		)
			return;
		current.dragging = true;
		placeLift(current, event.clientX, event.clientY);
	};

	const dropLift = (event: ReactPointerEvent<HTMLElement>) => {
		const current = lift.current;
		if (!current || current.pointerId !== event.pointerId) return;
		if (current.dragging) suppressClick.current = true;
		const { range, invalid, dragging, id } = current;
		endLift();
		if (!dragging || !range || invalid) return;
		announce(range);
		onMoveEvent?.(id, range);
	};

	const startTimed = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		const date = columnAt(event.clientX);
		if (!date) return;
		const origin = event.currentTarget;
		capturePointer(origin, event.pointerId);
		const anchorMinute = minuteOf(event.clientY);
		if (touch && event.pointerType === "touch") {
			press.current = pressStart(event.clientX, event.clientY, Date.now());
			gesture.current = {
				kind: "touch",
				pointerId: event.pointerId,
				date,
				anchorMinute,
				x: event.clientX,
				y: event.clientY,
				dragging: false,
				range: null,
				origin,
			};
			holdTimer.current = setTimeout(() => {
				if (!press.current || !gesture.current) return;
				press.current = pressTick(press.current, Date.now() + 1);
				if (press.current.phase !== "held") return;
				const range = clickRange(date, anchorMinute);
				gesture.current.dragging = true;
				gesture.current.range = range;
				navigator.vibrate?.(10);
				onGesture({ type: "drag", range });
			}, HOLD_MS);
			return;
		}
		gesture.current = {
			kind: "timed",
			pointerId: event.pointerId,
			date,
			anchorMinute,
			x: event.clientX,
			y: event.clientY,
			dragging: false,
			range: null,
			origin,
		};
	};

	const startAllDay = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0 || (touch && event.pointerType === "touch")) return;
		const date = columnAt(event.clientX);
		if (!date) return;
		capturePointer(event.currentTarget, event.pointerId);
		gesture.current = {
			kind: "all-day",
			pointerId: event.pointerId,
			date,
			anchorMinute: 0,
			x: event.clientX,
			y: event.clientY,
			dragging: false,
			range: null,
			origin: event.currentTarget,
		};
	};

	const startHandle = (
		edge: "start" | "end",
		event: ReactPointerEvent<HTMLElement>,
	) => {
		if (!draft) return;
		event.stopPropagation();
		capturePointer(event.currentTarget, event.pointerId);
		gesture.current = {
			kind: edge === "start" ? "handle-start" : "handle-end",
			pointerId: event.pointerId,
			date: draft.range.date,
			anchorMinute: 0,
			x: event.clientX,
			y: event.clientY,
			dragging: true,
			range: draft.range,
			origin: event.currentTarget,
		};
	};

	const movePointer = (event: ReactPointerEvent<HTMLElement>) => {
		const current = gesture.current;
		if (!current || current.pointerId !== event.pointerId) return;
		const dx = event.clientX - current.x;
		const dy = event.clientY - current.y;
		if (current.kind === "touch") {
			if (!press.current) return;
			press.current = pressMove(press.current, event.clientX, event.clientY);
			if (press.current.phase === "scrolled") {
				endGesture();
				return;
			}
			if (press.current.phase !== "held") return;
			const range = stepHandle(
				clickRange(current.date, current.anchorMinute),
				"end",
				dy,
				hourHeight,
			);
			current.range = range;
			onGesture({ type: "drag", range });
			return;
		}
		if (current.kind === "handle-start" || current.kind === "handle-end") {
			if (!draft) return;
			const range = stepHandle(
				current.range ?? draft.range,
				current.kind === "handle-start" ? "start" : "end",
				dy,
				hourHeight,
			);
			onGesture({ type: "drag", range });
			return;
		}
		if (!current.dragging && !isDrag(dx, dy)) return;
		current.dragging = true;
		const range =
			current.kind === "all-day"
				? allDayRange(current.date, columnAt(event.clientX) ?? current.date)
				: timedRange(
						current.date,
						current.anchorMinute,
						minuteOf(event.clientY),
					);
		current.range = range;
		onGesture({ type: "drag", range });
	};

	const endPointer = (event: ReactPointerEvent<HTMLElement>) => {
		const current = gesture.current;
		if (!current || current.pointerId !== event.pointerId) return;
		if (current.kind === "handle-start" || current.kind === "handle-end") {
			const range = draft?.range;
			endGesture();
			if (range) {
				announce(range);
				onGesture({ type: "drag-end", range });
			}
			return;
		}
		if (current.kind === "touch") {
			const range = current.range;
			const tapped = press.current?.phase === "pending";
			endGesture();
			if (range) {
				announce(range);
				onGesture({ type: "drag-end", range });
				return;
			}
			if (tapped)
				onGesture({
					type: "click",
					range: clickRange(current.date, current.anchorMinute),
					origin: current.origin,
				});
			return;
		}
		endGesture();
		if (current.dragging && current.range) {
			announce(current.range);
			onGesture({ type: "drag-end", range: current.range });
			return;
		}
		const range =
			current.kind === "all-day"
				? allDayRange(current.date, current.date)
				: clickRange(current.date, current.anchorMinute);
		onGesture({ type: "click", range, origin: current.origin });
	};

	const cancelPointer = (event: ReactPointerEvent<HTMLElement>) => {
		const current = gesture.current;
		if (!current || current.pointerId !== event.pointerId) return;
		const wasShowing = current.dragging;
		endGesture();
		if (wasShowing) onGesture({ type: "drag-cancel" });
	};

	const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) return;
		setHasFocus(true);
		const slot = focusSlot ?? initialFocus(days, today.date, today.minute);
		if (event.key === "Enter") {
			event.preventDefault();
			const range = stretchAnchor
				? stretchRange(stretchAnchor, slot)
				: clickRange(slot.date, slot.minute);
			const origin = document.getElementById(focusCellId);
			setStretchAnchor(null);
			announce(range);
			onGesture({ type: "keyboard", range, origin });
			return;
		}
		if (event.key === "Escape" && stretchAnchor) {
			event.preventDefault();
			event.stopPropagation();
			setStretchAnchor(null);
			onGesture({ type: "drag-cancel" });
			return;
		}
		const next = moveFocus(slot, event.key, days);
		if (!next) return;
		event.preventDefault();
		setFocusSlot(next);
		scrollSlotIntoView(next.minute);
		if (event.shiftKey) {
			const anchor = stretchAnchor ?? slot;
			setStretchAnchor(anchor);
			const range = stretchRange(anchor, next);
			announce(range);
			onGesture({ type: "drag", range });
			return;
		}
		if (stretchAnchor) {
			setStretchAnchor(null);
			onGesture({ type: "drag-cancel" });
		}
	};

	const scrollSlotIntoView = (minute: number) => {
		const scroller = scrollRef.current;
		if (!scroller) return;
		const top = (minute / 60) * hourHeight;
		if (top < scroller.scrollTop) scroller.scrollTop = top;
		else if (top + hourHeight > scroller.scrollTop + scroller.clientHeight)
			scroller.scrollTop = top + hourHeight - scroller.clientHeight;
	};

	const shownFocus =
		focusSlot && days.includes(focusSlot.date)
			? focusSlot
			: initialFocus(days, today.date, today.minute);

	const chip = (
		event: CalendarEventData,
		layout: "row" | "column",
		tall: boolean,
	) => {
		const color = colorByCalendarId[event.calendarId] ?? FALLBACK_COLOR;
		const timeText =
			event.allDay || (density === "compact" && !tall)
				? ""
				: clock(zonedMoment(event.start, timeZone).minute);
		const movable = onMoveEvent !== undefined && canMove(event.id);
		return (
			<>
				<button
					type="button"
					data-event-id={event.id}
					onPointerDown={(press) => startLift(press, event, "move")}
					onPointerMove={moveLift}
					onPointerUp={dropLift}
					onPointerCancel={endLift}
					onClick={(click) => {
						if (suppressClick.current) {
							suppressClick.current = false;
							return;
						}
						onSelectEvent(event.id, click.currentTarget);
					}}
					aria-label={`${event.task ? "Task: " : ""}${event.title}, ${describeEvent(event, timeZone)}`}
					className={cn(
						calendarEventBodyClasses({
							color,
							layout,
							density: "compact",
							rsvp: event.myRsvp,
							status: event.status,
							selected: event.id === selectedEventId,
							stacked: false,
						}),
						"h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
						touch && "touch-pan-y",
						lifted?.id === event.id && "opacity-40",
						event.task && "pl-5",
						event.task?.completed && "line-through opacity-60",
					)}
				>
					<CalendarEventChipContent
						title={event.title === "" ? "(No title)" : event.title}
						timeText={timeText}
						layout={layout}
						rsvp={event.myRsvp}
						hasThread={event.threadId !== ""}
						isRecurring={event.recurrenceRule !== ""}
						zoneCertainty={event.zoneCertainty}
					/>
				</button>
				{event.task && (
					<input
						type="checkbox"
						aria-label={event.title === "" ? "(No title)" : event.title}
						checked={event.task.completed}
						onPointerDown={(press) => press.stopPropagation()}
						onClick={(click) => click.stopPropagation()}
						onChange={() => onToggleTask?.(event.id)}
						className="absolute top-1 left-1 z-10 size-3.5 accent-current"
					/>
				)}
				{movable && (
					<span
						aria-hidden="true"
						data-resize-handle=""
						onPointerDown={(press) => startLift(press, event, "resize")}
						onPointerMove={moveLift}
						onPointerUp={dropLift}
						onPointerCancel={endLift}
						className={cn(
							"absolute",
							layout === "column"
								? "inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
								: "inset-y-0 right-0 w-1.5 cursor-ew-resize",
						)}
						style={{ touchAction: "none" }}
					/>
				)}
			</>
		);
	};

	const ghostLabel = (range: CalendarSlotPick): string =>
		range.allDay
			? dayLabel(range.date, { weekday: "short", day: "numeric" })
			: `${dayLabel(range.date, { weekday: "short", day: "numeric" })} · ${range.startTime} – ${range.endTime}`;

	const ghost = (range: CalendarSlotPick, invalid: boolean) => (
		<div
			data-lifted-event=""
			className={cn(
				"pointer-events-none absolute inset-0 z-30 flex flex-col overflow-hidden rounded-sm border-2 border-accent bg-accent-soft px-1.5 py-0.5 text-xs text-fg shadow-lg",
				invalid && "border-dashed opacity-60",
			)}
		>
			<span className="truncate font-medium tabular-nums">
				{ghostLabel(range)}
			</span>
		</div>
	);

	const draftBlock = (body: ReactNode, extra: string) => {
		if (!draft) return null;
		const hue = calendarColorClasses("cal-1");
		return (
			<div
				data-draft-block=""
				className={cn(
					"pointer-events-auto absolute z-20 flex flex-col overflow-hidden rounded-sm px-1.5 py-0.5 text-xs shadow-md",
					draft.tone === "draft"
						? cn("border-2 border-dashed bg-surface/90", hue.border, hue.text)
						: "bg-accent text-accent-fg",
					extra,
				)}
			>
				{body}
			</div>
		);
	};

	const draftTitle = draft?.title === "" ? "New event" : (draft?.title ?? "");

	const handle = (edge: "start" | "end") => (
		<span
			data-handle={edge}
			aria-hidden="true"
			onPointerDown={(event) => startHandle(edge, event)}
			onPointerMove={movePointer}
			onPointerUp={endPointer}
			onPointerCancel={cancelPointer}
			className={cn(
				"absolute inset-x-0 cursor-ns-resize",
				edge === "start" ? "top-0" : "bottom-0",
				touch ? "h-6" : "h-2",
			)}
			style={{ touchAction: "none" }}
		>
			{touch && (
				<span
					className={cn(
						"absolute size-3 rounded-full border-2 border-accent bg-surface",
						edge === "start"
							? "top-0 left-3 -translate-y-1/2"
							: "right-3 bottom-0 translate-y-1/2",
					)}
				/>
			)}
		</span>
	);

	const draftContent = draft ? (
		<>
			{draft.tone === "draft" && (
				<span className="text-2xs font-semibold uppercase tracking-wider">
					Draft
				</span>
			)}
			<span className="flex items-center gap-1 truncate font-medium">
				{draft.warning && (
					<TriangleAlert className="size-3.5 shrink-0" aria-label="Not saved" />
				)}
				{draftTitle}
			</span>
			<span className="tabular-nums opacity-90">
				{draft.range.startTime} – {draft.range.endTime}
			</span>
			{draft.handles && (
				<>
					{handle("start")}
					{handle("end")}
				</>
			)}
		</>
	) : null;

	return (
		<div
			ref={rootRef}
			data-testid="calendar-grid"
			className={cn(
				"flex h-full min-h-0 flex-col bg-surface text-fg select-none",
				className,
			)}
		>
			<div className="flex shrink-0 border-b border-line">
				<div className="flex w-14 shrink-0 items-end justify-end pr-2 pb-1 text-2xs text-fg-subtle">
					{zoneLabel(timeZone, now)}
				</div>
				<div
					className="grid flex-1"
					style={{
						gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
					}}
				>
					{days.map((date) => {
						const isToday = date === today.date;
						return (
							<div
								key={date}
								className="flex flex-col items-center gap-0.5 border-l border-line py-1"
							>
								<span
									className={cn(
										"text-2xs font-medium uppercase tracking-wider",
										isToday ? "text-accent" : "text-fg-subtle",
									)}
								>
									{dayLabel(date, { weekday: "short" })}
								</span>
								<button
									type="button"
									onClick={() => onOpenDay?.(date)}
									aria-label={dayLabel(date, {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
									aria-current={isToday ? "date" : undefined}
									className={cn(
										"flex size-9 items-center justify-center rounded-full text-xl tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
										isToday
											? "bg-accent text-accent-fg"
											: "text-fg hover:bg-surface-sunken",
									)}
								>
									{Number(date.slice(8))}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex shrink-0 border-b border-line-strong">
				<div className="flex w-14 shrink-0 items-start justify-end pt-1 pr-2 text-2xs text-fg-subtle">
					All day
				</div>
				<div
					ref={allDayRef}
					data-all-day-row=""
					onPointerDown={startAllDay}
					onPointerMove={movePointer}
					onPointerUp={endPointer}
					onPointerCancel={cancelPointer}
					className="relative flex-1"
					style={{ height: laneCount * ALL_DAY_LANE + 6 }}
				>
					<div
						className="pointer-events-none absolute inset-0 grid"
						style={{
							gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
						}}
					>
						{days.map((date) => (
							<div key={date} className="border-l border-line" />
						))}
					</div>
					{bars.map((bar) => {
						const event = byId.get(bar.id);
						if (!event) return null;
						return (
							<div
								key={bar.id}
								className="absolute px-0.5"
								style={{
									left: `${(bar.startIndex / days.length) * 100}%`,
									width: `${(bar.span / days.length) * 100}%`,
									top: 2 + bar.lane * ALL_DAY_LANE,
									height: ALL_DAY_LANE - 2,
								}}
							>
								{chip(event, "row", false)}
							</div>
						);
					})}
					{lifted?.range.allDay &&
						(() => {
							const bar = layoutAllDay(days, [
								{
									id: "lifted",
									first: lifted.range.date,
									last: lifted.range.endDate,
								},
							])[0];
							if (!bar) return null;
							return (
								<div
									className="absolute px-0.5"
									style={{
										left: `${(bar.startIndex / days.length) * 100}%`,
										width: `${(bar.span / days.length) * 100}%`,
										top: 2,
										height: ALL_DAY_LANE - 2,
									}}
								>
									{ghost(lifted.range, lifted.invalid)}
								</div>
							);
						})()}
					{draftBar && (
						<div
							className="absolute px-0.5"
							style={{
								left: `${(draftBar.startIndex / days.length) * 100}%`,
								width: `${(draftBar.span / days.length) * 100}%`,
								top: 2 + (laneCount - 1) * ALL_DAY_LANE,
								height: ALL_DAY_LANE - 2,
							}}
						>
							{draftBlock(
								<span className="truncate font-medium">{draftTitle}</span>,
								"inset-0",
							)}
						</div>
					)}
				</div>
			</div>

			{/* biome-ignore lint/a11y/useSemanticElements: a time grid is not a table; its cells are positioned, and the grid owns arrow-key focus */}
			<div
				ref={scrollRef}
				role="grid"
				aria-label="Time grid"
				aria-activedescendant={hasFocus ? focusCellId : undefined}
				tabIndex={0}
				onKeyDown={onKeyDown}
				onFocus={(event) => {
					if (
						event.target === event.currentTarget &&
						event.currentTarget.matches(":focus-visible")
					)
						setHasFocus(true);
				}}
				onBlur={() => setHasFocus(false)}
				className="relative min-h-0 flex-1 overflow-y-auto outline-none"
			>
				<div className="flex" style={{ height: 24 * hourHeight }}>
					<div className="relative w-14 shrink-0" aria-hidden="true">
						{HOURS.slice(1).map((hour) => (
							<span
								key={hour}
								className="absolute right-2 -translate-y-1/2 text-2xs tabular-nums text-fg-subtle"
								style={{ top: hour * hourHeight }}
							>
								{pad(hour)}:00
							</span>
						))}
					</div>
					<div
						ref={columnsRef}
						data-time-columns=""
						onPointerDown={startTimed}
						onPointerMove={movePointer}
						onPointerUp={endPointer}
						onPointerCancel={cancelPointer}
						className="relative grid flex-1"
						style={{
							gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
							touchAction: touch ? "pan-y" : undefined,
							backgroundImage: `repeating-linear-gradient(to bottom, var(--color-line) 0 1px, transparent 1px ${hourHeight}px)`,
						}}
					>
						{days.map((date) => {
							const placed = layoutDay(
								date,
								timed.map((entry) => ({
									id: entry.event.id,
									start: entry.start,
									end: entry.end,
								})),
							);
							const draftHere =
								draft && !draft.range.allDay && draft.range.date === date
									? rangeMinutes(draft.range)
									: undefined;
							return (
								<div
									key={date}
									data-date={date}
									className="relative border-l border-line"
								>
									{placed.map((span) => {
										const event = byId.get(span.id);
										if (!event) return null;
										const height = ((span.bottom - span.top) / 60) * hourHeight;
										return (
											<div
												key={span.id}
												className="absolute px-px"
												style={{
													top: (span.top / 60) * hourHeight,
													height: Math.max(height, 12),
													left: `${(span.column / span.columns) * 100}%`,
													width: `${100 / span.columns}%`,
												}}
											>
												{chip(event, "column", height >= 36)}
											</div>
										);
									})}
									{date === today.date && (
										<div
											aria-hidden="true"
											className="pointer-events-none absolute right-0 left-0 z-10 border-t-2 border-danger"
											style={{ top: (today.minute / 60) * hourHeight }}
										>
											<span className="absolute -top-[5px] -left-1 size-2 rounded-full bg-danger" />
										</div>
									)}
									{hasFocus && shownFocus.date === date && (
										// biome-ignore lint/a11y/useSemanticElements: the one row the active descendant lives in
										<div
											role="row"
											tabIndex={-1}
											className="pointer-events-none absolute right-0 left-0 z-30"
											style={{
												top: (shownFocus.minute / 60) * hourHeight,
												height: hourHeight / 4,
											}}
										>
											{/* biome-ignore lint/a11y/useSemanticElements: the focused slot, named for the grid's active descendant */}
											<div
												id={focusCellId}
												role="gridcell"
												tabIndex={-1}
												aria-label={describeRange(
													clickRange(shownFocus.date, shownFocus.minute),
												).replace(/ to .*/, "")}
												className="h-full rounded-xs ring-2 ring-ring"
											/>
										</div>
									)}
									{lifted &&
										!lifted.range.allDay &&
										lifted.range.date === date &&
										(() => {
											const minutes = rangeMinutes(lifted.range);
											return (
												<div
													className="absolute right-1 left-0"
													style={{
														top: (minutes.start / 60) * hourHeight,
														height: Math.max(
															((minutes.end - minutes.start) / 60) * hourHeight,
															12,
														),
													}}
												>
													{ghost(lifted.range, lifted.invalid)}
												</div>
											);
										})()}
									{draftHere && (
										<div
											className="absolute right-1 left-0"
											style={{
												top: (draftHere.start / 60) * hourHeight,
												height:
													((draftHere.end - draftHere.start) / 60) * hourHeight,
											}}
										>
											{draftBlock(draftContent, "inset-0")}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<div aria-live="polite" className="sr-only">
				{live}
			</div>
		</div>
	);
}

/**
 * Keeps the pointer on the element that took the press. A pointer the browser
 * no longer tracks — a synthetic one, or one already released — cannot be
 * captured, and the gesture carries on without it.
 */
function capturePointer(element: HTMLElement, pointerId: number): void {
	try {
		element.setPointerCapture(pointerId);
	} catch {
		// Not a live pointer: nothing to capture.
	}
}

function lastDayOf(event: CalendarEventData): string {
	const end = event.end.slice(0, 10);
	if (!event.allDay) return end;
	const [year, month, day] = end.split("-").map(Number);
	const previous = new Date(Date.UTC(year, month - 1, day - 1));
	const last = previous.toISOString().slice(0, 10);
	return last < event.start.slice(0, 10) ? event.start.slice(0, 10) : last;
}

function describeEvent(event: CalendarEventData, timeZone: string): string {
	if (event.allDay) return "all day";
	const start = zonedMoment(event.start, timeZone);
	const end = zonedMoment(event.end, timeZone);
	return `${clock(start.minute)} to ${clock(end.minute)}`;
}
