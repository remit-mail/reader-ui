/**
 * Tasks: read for the window on screen, drawn on their due day, and written
 * one at a time. A task lives in a task list (a `VtodoOnly` collection), never
 * in an event calendar, and is drawn on every view whatever calendars are ticked.
 */
import {
	calendarTaskDetailOperationsDeleteCalendarTaskMutation,
	calendarTaskDetailOperationsUpdateCalendarTaskMutation,
	calendarTaskOperationsCreateCalendarTaskMutation,
	calendarTaskOperationsListCalendarTasksOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapCalendarTaskResponse,
	RemitImapCreateCalendarTaskInput,
	RemitImapUpdateCalendarTaskInput,
} from "@remit/api-http-client/types.gen.ts";
import type { CalendarEventData } from "@remit/ui";
import { formatErrorMessage } from "@remit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getErrorStatus, softErrorStatuses } from "../../lib/error-classifier";
import type { CalendarWindow } from "./window";
import { addDays, isoOnClock } from "./window";

const TASK_PREFIX = "task:";

/** The grid's id for a task, kept apart from every event id. */
export const calendarTaskEventId = (calendarTaskId: string): string =>
	`${TASK_PREFIX}${calendarTaskId}`;

/** The task an id names, or `undefined` for an event. */
export const calendarTaskIdOf = (eventId: string): string | undefined =>
	eventId.startsWith(TASK_PREFIX)
		? eventId.slice(TASK_PREFIX.length)
		: undefined;

/** A task as the grid draws it: an all-day entry on its day, or a short block at its time. */
export function toTaskEventData(
	task: RemitImapCalendarTaskResponse,
	clockZone: string,
): CalendarEventData {
	const date = task.due.slice(0, 10);
	const start = task.allDay ? date : isoOnClock(task.due, clockZone);
	const end = task.allDay
		? addDays(date, 1)
		: isoOnClock(
				new Date(Date.parse(task.dueAt) + 30 * 60_000).toISOString(),
				clockZone,
			);
	return {
		id: calendarTaskEventId(task.calendarTaskId),
		calendarId: task.calendarId,
		title: task.summary,
		start,
		end,
		allDay: task.allDay,
		location: "",
		notes: task.description,
		attendees: [],
		myRsvp: "accepted",
		threadId: "",
		threadSubject: "",
		timeZone: "",
		zoneCertainty: "explicit",
		recurrenceRule: "",
		seriesId: "",
		seriesException: false,
		status: "confirmed",
		task: { completed: task.completed },
	};
}

const TASK_META = softErrorStatuses(400, 404, 412);

export function useCalendarTasks(window: CalendarWindow, enabled = true) {
	const { data, error } = useQuery({
		...calendarTaskOperationsListCalendarTasksOptions({
			query: { from: window.from, to: window.to },
		}),
		meta: softErrorStatuses(400, 404),
		enabled,
	});
	const tasks = useMemo(() => data?.items ?? [], [data?.items]);
	return { tasks, error };
}

export type TaskWriteOutcome =
	| { kind: "written" }
	| { kind: "refused"; message: string };

const TASK_LIST_ID = "calendarTaskOperationsListCalendarTasks";

const refused = (error: unknown): TaskWriteOutcome => ({
	kind: "refused",
	message:
		getErrorStatus(error) === 412
			? "This task changed while you were looking at it. Close it and open it again."
			: formatErrorMessage(error),
});

export function useCalendarTaskWrites() {
	const queryClient = useQueryClient();
	const invalidate = useCallback(() => {
		void queryClient.invalidateQueries({
			predicate: (query) => {
				const head = query.queryKey[0];
				return (
					typeof head === "object" &&
					head !== null &&
					(head as { _id?: unknown })._id === TASK_LIST_ID
				);
			},
		});
	}, [queryClient]);
	const create = useMutation({
		...calendarTaskOperationsCreateCalendarTaskMutation(),
		meta: TASK_META,
		onSuccess: invalidate,
	});
	const update = useMutation({
		...calendarTaskDetailOperationsUpdateCalendarTaskMutation(),
		meta: TASK_META,
		onSuccess: invalidate,
	});
	const remove = useMutation({
		...calendarTaskDetailOperationsDeleteCalendarTaskMutation(),
		meta: TASK_META,
		onSuccess: invalidate,
	});

	const createTask = useCallback(
		(input: RemitImapCreateCalendarTaskInput) =>
			create
				.mutateAsync({ body: input })
				.then((): TaskWriteOutcome => ({ kind: "written" }))
				.catch(refused),
		[create],
	);
	const updateTask = useCallback(
		(
			task: Pick<
				RemitImapCalendarTaskResponse,
				"calendarTaskId" | "calendarId" | "etag"
			>,
			patch: RemitImapUpdateCalendarTaskInput,
		) =>
			update
				.mutateAsync({
					path: { calendarTaskId: task.calendarTaskId },
					query: { calendarId: task.calendarId },
					headers: { "If-Match": task.etag },
					body: patch,
				})
				.then((): TaskWriteOutcome => ({ kind: "written" }))
				.catch(refused),
		[update],
	);
	const deleteTask = useCallback(
		(
			task: Pick<
				RemitImapCalendarTaskResponse,
				"calendarTaskId" | "calendarId" | "etag"
			>,
		) =>
			remove
				.mutateAsync({
					path: { calendarTaskId: task.calendarTaskId },
					query: { calendarId: task.calendarId },
					headers: { "If-Match": task.etag },
				})
				.then((): TaskWriteOutcome => ({ kind: "written" }))
				.catch(refused),
		[remove],
	);
	return {
		createTask,
		updateTask,
		deleteTask,
		isWriting: create.isPending || update.isPending || remove.isPending,
	};
}
