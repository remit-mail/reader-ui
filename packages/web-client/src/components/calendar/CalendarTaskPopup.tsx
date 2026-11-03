import type { RemitImapCalendarTaskResponse } from "@remit/api-http-client/types.gen.ts";
import {
	type CalendarFailure,
	CalendarPopover,
	type CalendarTaskFields,
	CalendarTaskPopupCard,
} from "@remit/ui";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
	deviceTimeZone,
	isoAtInZone,
	isoOnClock,
	type TaskWriteOutcome,
	useCalendars,
	useCalendarTask,
	useCalendarTaskWrites,
} from "../../hooks/calendar";
import { calendarEventReportHref } from "../../lib/calendar-report";
import { useCalendarNavigation } from "../../routing";
import { CalendarLoadFailed } from "./CalendarLoadFailed";

const dueText = (due: string, allDay: boolean): string => {
	const date = new Date(`${due.slice(0, 10)}T00:00:00Z`);
	const day = new Intl.DateTimeFormat(undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: "UTC",
	}).format(date);
	return allDay ? `Due ${day}` : `Due ${day} · ${due.slice(11, 16)}`;
};

/** The task the address names, in a popup beside its chip. */
export function CalendarTaskPopup({
	calendarTaskId,
}: {
	calendarTaskId: string;
}) {
	const read = useCalendarTask(calendarTaskId);
	const { closeToView } = useCalendarNavigation();
	const headingId = useId();
	const closeRef = useRef<HTMLButtonElement>(null);
	const gone = read.kind === "gone";

	useEffect(() => {
		if (gone) closeRef.current?.focus();
	}, [gone]);

	if (read.kind === "loading") return null;
	if (read.kind === "found") return <OpenTask task={read.task} />;
	if (read.kind === "failed")
		return (
			<CalendarPopover anchor={null} anchorKey="failed" labelledBy={headingId}>
				<div id={headingId} className="p-4">
					<CalendarLoadFailed
						title="Couldn't open this task"
						error={read.error}
						onRetry={read.retry}
						compact
					/>
				</div>
			</CalendarPopover>
		);
	return (
		<CalendarPopover anchor={null} anchorKey="gone" labelledBy={headingId}>
			<div className="flex flex-col gap-3 p-4">
				<h2 id={headingId} className="text-base font-medium text-fg">
					This task was deleted or moved
				</h2>
				<button
					ref={closeRef}
					type="button"
					onClick={closeToView}
					className="self-end rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
				>
					Close
				</button>
			</div>
		</CalendarPopover>
	);
}

function OpenTask({ task }: { task: RemitImapCalendarTaskResponse }) {
	const { taskLists } = useCalendars();
	const { closeToView } = useCalendarNavigation();
	const { updateTask, deleteTask, isWriting } = useCalendarTaskWrites();
	const headingId = useId();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const [failure, setFailure] = useState<CalendarFailure | undefined>();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const { calendarTaskId } = task;

	useLayoutEffect(() => {
		setAnchor(
			document.querySelector<HTMLElement>(
				`[data-task-id="${CSS.escape(calendarTaskId)}"]`,
			),
		);
	}, [calendarTaskId]);

	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	const clock = deviceTimeZone();
	const shownDue = task.allDay ? task.due : isoOnClock(task.due, clock);
	const fields: CalendarTaskFields = {
		title: task.summary,
		dueDate: shownDue.slice(0, 10),
		dueTime: task.allDay ? "" : shownDue.slice(11, 16),
		description: task.description,
	};

	const settle = (retry: () => void) => (outcome: TaskWriteOutcome) => {
		if (outcome.kind === "written") {
			setFailure(undefined);
			return;
		}
		const text = `Couldn't save the task: ${outcome.message}`;
		setFailure({
			text,
			reportHref: calendarEventReportHref(text),
			onRetry: retry,
		});
	};

	const toggle = () => {
		void updateTask(task, { completed: !task.completed }).then(settle(toggle));
	};

	const save = (next: CalendarTaskFields) => {
		void updateTask(task, {
			summary: next.title,
			description: next.description,
			allDay: next.dueTime === "",
			due:
				next.dueTime === ""
					? next.dueDate
					: isoAtInZone(next.dueDate, next.dueTime, clock),
		}).then(settle(() => save(next)));
	};

	const remove = () => {
		void deleteTask(task).then((outcome) => {
			if (outcome.kind === "written") {
				closeToView();
				return;
			}
			settle(remove)(outcome);
		});
	};

	return (
		<CalendarPopover
			anchor={anchor}
			anchorKey={`${calendarTaskId}:${anchor ? "chip" : "none"}`}
			labelledBy={headingId}
		>
			<CalendarTaskPopupCard
				headingId={headingId}
				headingRef={headingRef}
				fields={fields}
				dueText={dueText(shownDue, task.allDay)}
				listName={
					taskLists.find((list) => list.id === task.calendarId)?.name ?? "Tasks"
				}
				completed={task.completed}
				onToggle={toggle}
				onSave={save}
				onDelete={remove}
				onClose={closeToView}
				busy={isWriting}
				failure={failure}
			/>
		</CalendarPopover>
	);
}
