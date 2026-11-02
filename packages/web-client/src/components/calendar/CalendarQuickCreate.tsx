import {
	CalendarPopover,
	CalendarQuickCreateCard,
	type EventDraft,
} from "@remit/ui";
import {
	type Dispatch,
	type PointerEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import {
	anchorZoneFor,
	createInputFromDraft,
	deviceTimeZone,
	UNZONED_CALENDAR,
	useCalendars,
	useCalendarWrites,
} from "../../hooks/calendar";
import type {
	DraftSession,
	SessionAction,
	SessionDraft,
} from "../../hooks/calendar/draft-session";
import { calendarEventReportHref } from "../../lib/calendar-report";

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
		guests: "",
		notes: "",
		repeat: "",
	};
}

export interface CalendarQuickCreateProps {
	session: Extract<DraftSession, { mode: "quick" }>;
	dispatch: Dispatch<SessionAction>;
	onMoreOptions: () => void;
	onSaved: (calendarObjectId: string) => void;
	/** The sheet on a phone wraps the card itself. */
	render?: (card: ReactNode) => ReactNode;
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
	render,
	touch = false,
}: CalendarQuickCreateProps) {
	const headingId = useId();
	const titleRef = useRef<HTMLInputElement>(null);
	const failureRef = useRef<HTMLDivElement>(null);
	const [problem, setProblem] = useState("");
	const {
		calendars: all,
		defaultCalendarId,
		timeZoneByCalendarId,
	} = useCalendars();
	const calendars = all.filter((calendar) => !calendar.readOnly);
	const { createEvent } = useCalendarWrites();
	const { draft } = session;
	const fallbackCalendar =
		calendars.find((calendar) => calendar.id === defaultCalendarId)?.id ??
		calendars[0]?.id ??
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
	const cardRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const remember = (event: FocusEvent) => {
			if (event.target instanceof HTMLElement)
				lastFocused.current = event.target;
		};
		card.addEventListener("focusin", remember);
		return () => card.removeEventListener("focusin", remember);
	}, []);
	const rangeKey = `${draft.range.date}T${draft.range.startTime}/${draft.range.endDate}T${draft.range.endTime}`;
	useEffect(() => {
		const field = lastFocused.current;
		if (rangeKey === "" || !field || document.activeElement === field) return;
		field.focus();
	}, [rangeKey]);

	const save = () => {
		const built = createInputFromDraft(eventDraftOf(draft), {
			clock: deviceTimeZone(),
			anchor: anchorZoneFor(
				timeZoneByCalendarId[draft.calendarId] ?? UNZONED_CALENDAR,
			),
		});
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
				fields={draft}
				calendars={calendars}
				onChange={(fields) => dispatch({ type: "change", draft: fields })}
				onSave={save}
				onMoreOptions={onMoreOptions}
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

	if (render) return <>{render(card())}</>;

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
