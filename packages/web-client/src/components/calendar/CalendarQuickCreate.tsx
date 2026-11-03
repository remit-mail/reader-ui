import {
	CalendarPopover,
	CalendarQuickCreateCard,
	CalendarSheet,
	type EventDraft,
	type QuickCreateMode,
	type QuickTaskFields,
} from "@remit/ui";
import {
	type Dispatch,
	type PointerEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import {
	anchorZoneFor,
	createInputFromDraft,
	deviceTimeZone,
	isoAtInZone,
	UNZONED_CALENDAR,
	useCalendarSenders,
	useCalendars,
	useCalendarTaskWrites,
	useCalendarWrites,
	useGuestSuggestions,
} from "../../hooks/calendar";
import type {
	DraftSession,
	SessionAction,
	SessionDraft,
} from "../../hooks/calendar/draft-session";
import { calendarEventReportHref } from "../../lib/calendar-report";
import { useBackCloses } from "../../routing";
import { useOptionalCalendarSession } from "./CalendarSession";

export const SETTINGS_HREF = "/settings/calendars";

/** The session's draft as the editor and the write read it. */
export function eventDraftOf(draft: SessionDraft): EventDraft {
	return {
		title: draft.title,
		date: draft.range.date,
		startTime: draft.range.startTime,
		endDate: draft.range.endDate,
		endTime: draft.range.endTime,
		allDay: draft.range.allDay,
		calendarId: draft.calendarId,
		location: draft.location,
		guests: draft.guests,
		notes: "",
		repeat: "",
	};
}

export interface CalendarQuickCreateProps {
	session: Extract<DraftSession, { mode: "quick" }>;
	dispatch: Dispatch<SessionAction>;
	/** Carries the label of the field that had focus, so the sidebar can keep it. */
	onMoreOptions: (focusedLabel: string) => void;
	onSaved: (calendarObjectId: string) => void;
	/** On a phone the card sits in a sheet along the bottom. */
	touch?: boolean;
}

/**
 * The small popup on a new range. It sends nothing until Save, and a failure
 * keeps every field and says why.
 */
export function CalendarQuickCreate({
	session,
	dispatch,
	onMoreOptions,
	onSaved,
	touch = false,
}: CalendarQuickCreateProps) {
	const headingId = useId();
	const titleRef = useRef<HTMLInputElement>(null);
	const failureRef = useRef<HTMLDivElement>(null);
	const [problem, setProblem] = useState("");
	const {
		calendars: all,
		taskLists,
		defaultCalendarId,
		timeZoneByCalendarId,
	} = useCalendars();
	const calendars = all.filter((calendar) => !calendar.readOnly);
	const { createEvent } = useCalendarWrites();
	const { createTask } = useCalendarTaskWrites();
	const { defaultSenderId } = useCalendarSenders();
	const [guestQuery, setGuestQuery] = useState("");
	const guestSuggestions = useGuestSuggestions(guestQuery);
	const calendarSession = useOptionalCalendarSession();
	const { draft } = session;
	const [mode, setMode] = useState<QuickCreateMode>("event");
	const [taskFields, setTaskFields] = useState<QuickTaskFields>({
		title: "",
		dueDate: "",
		dueTime: "",
		description: "",
		calendarId: "",
	});
	const switchMode = (next: QuickCreateMode) => {
		if (next === mode) return;
		setMode(next);
		if (next === "event") {
			dispatch({
				type: "change",
				draft: { ...draft, title: taskFields.title },
			});
			return;
		}
		setTaskFields((current) => ({
			...current,
			title: draft.title,
			dueDate: draft.range.date,
			dueTime: draft.range.allDay ? "" : draft.range.startTime,
			calendarId:
				current.calendarId === ""
					? (taskLists[0]?.id ?? "")
					: current.calendarId,
		}));
	};
	const fallbackCalendar =
		calendars.find((calendar) => calendar.id === defaultCalendarId)?.id ??
		calendars[0]?.id ??
		"";
	const organizerAccountId =
		defaultSenderId ??
		calendars.find((calendar) => calendar.id === draft.calendarId)?.accountId ??
		"";

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		if (draft.calendarId !== "" || fallbackCalendar === "") return;
		dispatch({
			type: "change",
			draft: { ...draft, calendarId: fallbackCalendar },
		});
	}, [draft, fallbackCalendar, dispatch]);

	useEffect(() => {
		if (session.status === "failed") failureRef.current?.focus();
	}, [session.status]);

	const lastFocused = useRef<HTMLElement | null>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	useBackCloses(touch, () => {
		dispatch({ type: "outside" });
		return true;
	});
	const rangeKey = `${draft.range.date}T${draft.range.startTime}/${draft.range.endDate}T${draft.range.endTime}`;
	useEffect(() => {
		const sheet = sheetRef.current;
		if (rangeKey === "") return;
		const block = document.querySelector<HTMLElement>("[data-draft-block]");
		const grid = document.querySelector<HTMLElement>(
			"[role='grid'][aria-label='Time grid']",
		);
		if (!sheet || !block || !grid) return;
		const overlap =
			block.getBoundingClientRect().bottom -
			sheet.getBoundingClientRect().top +
			16;
		if (overlap > 0) grid.scrollTop += overlap;
	}, [rangeKey]);
	const cardRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const remember = (event: FocusEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLSelectElement
			)
				lastFocused.current = event.target;
		};
		card.addEventListener("focusin", remember);
		return () => card.removeEventListener("focusin", remember);
	}, []);
	useEffect(() => {
		const field = lastFocused.current;
		if (rangeKey === "" || !field || document.activeElement === field) return;
		field.focus();
	}, [rangeKey]);

	const saveTask = () => {
		if (taskFields.title.trim() === "") {
			setProblem("Give the task a title before saving it.");
			titleRef.current?.focus();
			return;
		}
		setProblem("");
		dispatch({ type: "save" });
		const clock = deviceTimeZone();
		const allDay = taskFields.dueTime === "";
		void createTask({
			calendarId: taskFields.calendarId,
			summary: taskFields.title.trim(),
			description: taskFields.description,
			allDay,
			due: allDay
				? taskFields.dueDate
				: isoAtInZone(taskFields.dueDate, taskFields.dueTime, clock),
			...(allDay ? {} : { timeZone: anchorZoneFor(UNZONED_CALENDAR) }),
		}).then((outcome) => {
			if (outcome.kind === "written") {
				dispatch({ type: "saved" });
				return;
			}
			dispatch({
				type: "save-failed",
				problem: `Couldn't save the task: ${outcome.message}`,
			});
		});
	};

	const save = () => {
		if (mode === "task") {
			saveTask();
			return;
		}
		const built = createInputFromDraft(
			eventDraftOf(draft),
			{
				clock: deviceTimeZone(),
				anchor: anchorZoneFor(
					timeZoneByCalendarId[draft.calendarId] ?? UNZONED_CALENDAR,
				),
			},
			organizerAccountId,
		);
		if (!built.ok) {
			setProblem(built.problem);
			titleRef.current?.focus();
			return;
		}
		setProblem("");
		dispatch({ type: "save" });
		void createEvent(built.input).then((outcome) => {
			if (outcome.kind === "created") {
				dispatch({ type: "saved" });
				calendarSession?.trackSends(outcome.sends);
				onSaved(outcome.calendarObjectId);
				return;
			}
			dispatch({
				type: "save-failed",
				problem:
					outcome.kind === "conflict"
						? "This calendar changed while you were writing. Close the form and try again."
						: `Couldn't save this event: ${outcome.message}`,
			});
		});
	};

	const card = (dragHandle?: {
		onPointerDown: (event: PointerEvent<HTMLElement>) => void;
	}) => (
		<div ref={cardRef}>
			<CalendarQuickCreateCard
				headingId={headingId}
				mode={mode}
				onMode={switchMode}
				fields={draft}
				taskFields={taskFields}
				onTaskChange={setTaskFields}
				calendars={calendars}
				taskLists={taskLists}
				guestSuggestions={guestSuggestions}
				onGuestQuery={setGuestQuery}
				onChange={(fields) => dispatch({ type: "change", draft: fields })}
				onSave={save}
				onMoreOptions={() =>
					onMoreOptions(lastFocused.current?.getAttribute("aria-label") ?? "")
				}
				onClose={() => dispatch({ type: "outside" })}
				saving={session.status === "saving"}
				problem={problem}
				failure={
					session.status === "failed"
						? {
								text: session.problem,
								reportHref: calendarEventReportHref(session.problem),
								onRetry: save,
							}
						: undefined
				}
				failureRef={failureRef}
				titleRef={titleRef}
				settingsHref={SETTINGS_HREF}
				dragHandle={dragHandle}
				touch={touch}
			/>
		</div>
	);

	if (touch)
		return (
			<CalendarSheet
				labelledBy={headingId}
				onDismiss={() => dispatch({ type: "outside" })}
				sheetRef={sheetRef}
			>
				{card()}
			</CalendarSheet>
		);

	return (
		<CalendarPopover
			anchor="[data-draft-block]"
			anchorKey={rangeKey}
			labelledBy={headingId}
			wrapTab
			header={(handle) => card(handle)}
		>
			{null}
		</CalendarPopover>
	);
}
