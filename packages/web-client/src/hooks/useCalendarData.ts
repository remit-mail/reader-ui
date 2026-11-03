/**
 * What the calendar surfaces read, and the only place they read it from.
 *
 * The seam is here, and not inside the grid, because the grid is presentational
 * and expands no recurrence of its own — the server returns instances and this
 * turns them into what the kit draws. Every caller keeps the call it makes.
 */
import type {
	CalendarColorId,
	CalendarDescriptor,
	CalendarEventData,
	CalendarTaskData,
	CalendarViewId,
} from "@remit/ui";
import { useCallback, useMemo } from "react";
import {
	type CalendarInstanceRef,
	calendarInstanceId,
	calendarWindow,
	readCalendarInstanceId,
	useCalendarEventWindow,
	useCalendarSelection,
	useDrawnEvents,
	usePrefetchAdjacentWindows,
} from "./calendar";
import { toTaskData, useCalendarTasks } from "./calendar/useCalendarTasks";

export interface CalendarDataRequest {
	view: CalendarViewId;
	/** The day the view is centred on, `YYYY-MM-DD`. */
	date: string;
	/** The calendars the address has ticked; empty means every one of them. */
	calendarIds: readonly string[];
	/**
	 * False where the zoom on screen draws nothing from this window. The agenda
	 * rolls its own range a week at a time, so asking for this view's week as
	 * well would fetch a window nothing renders — and the address rewriting on
	 * every scroll would ask again, with its neighbours, all the way down.
	 */
	enabled?: boolean;
}

export interface CalendarData {
	calendars: CalendarDescriptor[];
	events: CalendarEventData[];
	colorByCalendarId: Record<string, CalendarColorId>;
	/** The zone each collection's times are read on — never the device's. */
	timeZoneByCalendarId: Record<string, string>;
	isLoading: boolean;
	/** A refusal the calendar renders itself. Null when every read succeeded. */
	error: unknown;
	retry: () => void;
	/** The tasks due in the window, as the API returned them. */
	storedTasks: ReturnType<typeof useCalendarTasks>["tasks"];
	/** The same tasks, as the grid draws them. */
	tasks: CalendarTaskData[];
	/** The resource and occurrence behind an event the grid selected. */
	instanceOf: (eventId: string) => CalendarInstanceRef;
	/** The events that leave their time free rather than busy. */
	freeIds: ReadonlySet<string>;
}

export function useCalendarData({
	view,
	date,
	calendarIds,
	enabled = true,
}: CalendarDataRequest): CalendarData {
	const {
		calendars,
		colorByCalendarId,
		timeZoneByCalendarId,
		shown,
		narrowed,
		resolved,
		isLoading,
	} = useCalendarSelection(calendarIds);

	const window = calendarWindow(view, date);
	const active = enabled && resolved;
	const events = useCalendarEventWindow({
		...window,
		calendarIds: narrowed,
		enabled: active,
	});
	usePrefetchAdjacentWindows(view, date, narrowed, active);

	const drawnEvents = useDrawnEvents(
		events.instances,
		timeZoneByCalendarId,
		shown,
	);
	const taskRead = useCalendarTasks(window, active);
	const storedTasks = taskRead.tasks;
	const tasks = useMemo(() => storedTasks.map(toTaskData), [storedTasks]);
	const refetchEvents = events.refetch;
	const refetchTasks = taskRead.refetch;
	const retry = useCallback(() => {
		refetchEvents();
		void refetchTasks();
	}, [refetchEvents, refetchTasks]);

	const freeIds = useMemo(
		() =>
			new Set(
				events.instances
					.filter((instance) => instance.transparency === "Transparent")
					.map((instance) =>
						calendarInstanceId(
							instance.calendarObjectId,
							instance.recurrenceId,
						),
					),
			),
		[events.instances],
	);

	return {
		calendars,
		events: drawnEvents,
		colorByCalendarId,
		timeZoneByCalendarId,
		isLoading: isLoading || events.isLoading,
		error: events.error ?? taskRead.error,
		retry,
		storedTasks,
		tasks,
		instanceOf: readCalendarInstanceId,
		freeIds,
	};
}
