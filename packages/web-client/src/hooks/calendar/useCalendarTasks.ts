/**
 * Tasks: read for the window on screen, drawn on their due day, and written
 * one at a time. A task lives in a task list (a `VtodoOnly` collection), never
 * in an event calendar, and is drawn on every view whatever calendars are ticked.
 */
import {
	calendarTaskDetailOperationsDeleteCalendarTaskMutation,
	calendarTaskDetailOperationsGetCalendarTaskOptions,
	calendarTaskDetailOperationsUpdateCalendarTaskMutation,
	calendarTaskOperationsCreateCalendarTaskMutation,
	calendarTaskOperationsListCalendarTasksOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapCalendarTaskResponse,
	RemitImapCreateCalendarTaskInput,
	RemitImapUpdateCalendarTaskInput,
} from "@remit/api-http-client/types.gen.ts";
import type { CalendarTaskData } from "@remit/ui";
import { formatErrorMessage } from "@remit/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getErrorStatus, softErrorStatuses } from "../../lib/error-classifier";
import { useInvalidateCalendarReads } from "./useCalendarWrites";
import type { CalendarWindow } from "./window";

/** A task as the grid draws it, on its due day. */
export const toTaskData = (
	task: RemitImapCalendarTaskResponse,
): CalendarTaskData => ({
	calendarTaskId: task.calendarTaskId,
	calendarId: task.calendarId,
	title: task.summary,
	due: task.allDay ? task.due.slice(0, 10) : task.dueAt,
	allDay: task.allDay,
	completed: task.completed,
});

const TASK_META = softErrorStatuses(400, 404, 412);

export function useCalendarTasks(window: CalendarWindow, enabled = true) {
	const { data, error, refetch } = useQuery({
		...calendarTaskOperationsListCalendarTasksOptions({
			query: { from: window.from, to: window.to },
		}),
		meta: softErrorStatuses(400, 404),
		enabled,
	});
	const tasks = useMemo(() => data?.items ?? [], [data?.items]);
	return { tasks, error, refetch };
}

export type CalendarTaskRead =
	| { kind: "loading" }
	| { kind: "found"; task: RemitImapCalendarTaskResponse }
	| { kind: "gone" }
	| { kind: "failed"; error: unknown; retry: () => void };

/** One task by its id, the way the popup opens it from the address. */
export function useCalendarTask(calendarTaskId: string): CalendarTaskRead {
	const { data, error, refetch } = useQuery({
		...calendarTaskDetailOperationsGetCalendarTaskOptions({
			path: { calendarTaskId },
		}),
		meta: softErrorStatuses(404),
		retry: false,
	});
	if (data) return { kind: "found", task: data };
	if (error === null) return { kind: "loading" };
	if (getErrorStatus(error) === 404) return { kind: "gone" };
	return {
		kind: "failed",
		error,
		retry: () => {
			void refetch();
		},
	};
}

export type TaskWriteOutcome =
	| { kind: "written" }
	| { kind: "refused"; message: string };

const refused = (error: unknown): TaskWriteOutcome => ({
	kind: "refused",
	message:
		getErrorStatus(error) === 412
			? "This task changed while you were looking at it. Close it and open it again."
			: formatErrorMessage(error),
});

type TaskRef = Pick<
	RemitImapCalendarTaskResponse,
	"calendarTaskId" | "calendarId" | "etag"
>;

export function useCalendarTaskWrites() {
	const invalidate = useInvalidateCalendarReads();
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
		(task: TaskRef, patch: RemitImapUpdateCalendarTaskInput) =>
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
		(task: TaskRef) =>
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
