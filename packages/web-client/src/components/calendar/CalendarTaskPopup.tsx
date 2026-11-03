import {
	type CalendarFailure,
	CalendarPopover,
	type CalendarTaskFields,
	CalendarTaskPopupCard,
} from "@remit/ui";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
	calendarTaskIdOf,
	deviceTimeZone,
	isoAtInZone,
	isoOnClock,
	type TaskWriteOutcome,
	useCalendars,
	useCalendarTaskWrites,
} from "../../hooks/calendar";
import { useCalendarData } from "../../hooks/useCalendarData";
import { calendarEventReportHref } from "../../lib/calendar-report";
import { useCalendarAddress, useCalendarNavigation } from "../../routing";

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
export function CalendarTaskPopup({ eventId }: { eventId: string }) {
	const { view, date, calendarIds } = useCalendarAddress();
	const { tasks } = useCalendarData({ view, date, calendarIds });
	const { taskLists } = useCalendars();
	const { closeToView } = useCalendarNavigation();
	const { updateTask, deleteTask, isWriting } = useCalendarTaskWrites();
	const headingId = useId();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const [failure, setFailure] = useState<CalendarFailure | undefined>();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const task = tasks.find(
		(candidate) => candidate.calendarTaskId === calendarTaskIdOf(eventId),
	);

	useLayoutEffect(() => {
		setAnchor(
			task
				? document.querySelector<HTMLElement>(
						`[data-event-id="${CSS.escape(eventId)}"]`,
					)
				: null,
		);
	}, [task, eventId]);

	useEffect(() => {
		if (task) headingRef.current?.focus();
	}, [task]);

	if (!task) return null;

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
			anchorKey={`${eventId}:${anchor ? "chip" : "none"}`}
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
