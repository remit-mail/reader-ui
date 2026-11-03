import {
	type CalendarDescriptor,
	type CalendarEventData,
	CalendarFailureBlock,
	type CalendarSlotPick,
	Dialog,
	type RecurrenceScope,
	RecurrenceScopePrompt,
} from "@remit/ui";
import { X } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
	deviceTimeZone,
	isoAtInZone,
	useMoveEvent,
} from "../../hooks/calendar";
import { formatEventWhen } from "../../lib/calendar-format";
import { calendarEventReportHref } from "../../lib/calendar-report";

const CONFLICT = "This calendar changed while you were writing.";

interface Drop {
	event: CalendarEventData;
	range: CalendarSlotPick;
}

export interface EventMoves {
	/** The events with a drop that is still saving drawn where it landed. */
	events: CalendarEventData[];
	canMove: (eventId: string) => boolean;
	onMoveEvent: (eventId: string, range: CalendarSlotPick) => void;
	/** The failure above the grid, when the last drop did not save. */
	banner: ReactNode;
	/** The scope question for a repeating event. */
	prompt: ReactNode;
}

const placed = (event: CalendarEventData, range: CalendarSlotPick) => {
	if (range.allDay)
		return {
			...event,
			start: `${range.date}T00:00:00`,
			end: `${addDay(range.endDate)}T00:00:00`,
		};
	const zone = deviceTimeZone();
	return {
		...event,
		start: isoAtInZone(range.date, range.startTime, zone),
		end: isoAtInZone(range.endDate, range.endTime, zone),
	};
};

function addDay(date: string): string {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day + 1))
		.toISOString()
		.slice(0, 10);
}

/**
 * Dragging a stored event: the drop shows where it landed while it saves, a
 * repeating event asks its scope first, and a failure puts it back and says so.
 */
export function useEventMoves(
	events: CalendarEventData[],
	calendars: CalendarDescriptor[],
	timeZoneByCalendarId: Record<string, string>,
	reloadWeek: () => void,
): EventMoves {
	const move = useMoveEvent();
	const [pending, setPending] = useState<Map<string, CalendarSlotPick>>(
		() => new Map(),
	);
	const [asking, setAsking] = useState<Drop | undefined>();
	const [failure, setFailure] = useState<
		{ text: string; retry: () => void; conflict: boolean } | undefined
	>();
	const failureRef = useRef<HTMLDivElement>(null);
	const readOnly = useMemo(
		() =>
			new Set(
				calendars
					.filter((calendar) => calendar.readOnly)
					.map((calendar) => calendar.id),
			),
		[calendars],
	);

	const run = useCallback(
		(drop: Drop, scope: RecurrenceScope | undefined) => {
			setAsking(undefined);
			setFailure(undefined);
			setPending((current) => new Map(current).set(drop.event.id, drop.range));
			void move(
				drop.event,
				drop.range,
				scope,
				timeZoneByCalendarId[drop.event.calendarId] ?? "",
			).then((outcome) => {
				setPending((current) => {
					const next = new Map(current);
					next.delete(drop.event.id);
					return next;
				});
				if (outcome.kind === "written") return;
				setFailure({
					text:
						outcome.kind === "conflict"
							? CONFLICT
							: `Couldn't move ${drop.event.title}: ${outcome.message}`,
					retry: () => run(drop, scope),
					conflict: outcome.kind === "conflict",
				});
				requestAnimationFrame(() => failureRef.current?.focus());
			});
		},
		[move, timeZoneByCalendarId],
	);

	const onMoveEvent = useCallback(
		(eventId: string, range: CalendarSlotPick) => {
			const event = events.find((candidate) => candidate.id === eventId);
			if (!event) return;
			const drop = { event, range };
			if (event.seriesId !== "") {
				setAsking(drop);
				return;
			}
			run(drop, undefined);
		},
		[events, run],
	);

	const drawn = useMemo(
		() =>
			pending.size === 0
				? events
				: events.map((event) => {
						const range = pending.get(event.id);
						return range ? placed(event, range) : event;
					}),
		[events, pending],
	);

	const banner = failure && (
		<div className="flex items-start gap-2 border-b border-line px-3 py-2">
			<div className="min-w-0 flex-1">
				<CalendarFailureBlock
					focusRef={failureRef}
					failure={{
						text: failure.text,
						reportHref: calendarEventReportHref(failure.text),
						onRetry: failure.conflict
							? () => {
									setFailure(undefined);
									reloadWeek();
								}
							: failure.retry,
						retryLabel: failure.conflict ? "Reload the week" : undefined,
					}}
				/>
			</div>
			<button
				type="button"
				aria-label="Dismiss"
				onClick={() => setFailure(undefined)}
				className="flex size-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-sunken"
			>
				<X className="size-4" />
			</button>
		</div>
	);

	const prompt = (
		<Dialog
			open={asking !== undefined}
			onClose={() => setAsking(undefined)}
			title="Move a repeating event"
		>
			{asking && (
				<RecurrenceScopePrompt
					title={asking.event.title}
					ruleText="It repeats"
					instanceText={formatEventWhen(asking.event)}
					onChoose={(scope) => run(asking, scope)}
					onCancel={() => setAsking(undefined)}
				/>
			)}
		</Dialog>
	);

	return {
		events: drawn,
		canMove: (eventId: string) => {
			const event = events.find((candidate) => candidate.id === eventId);
			return event !== undefined && !readOnly.has(event.calendarId);
		},
		onMoveEvent,
		banner,
		prompt,
	};
}
