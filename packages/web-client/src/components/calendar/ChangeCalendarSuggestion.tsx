import type { RemitImapCalendarSuggestionResponse } from "@remit/api-http-client/types.gen.ts";
import {
	CalendarClashStrip,
	CalendarEventSidebar,
	type CalendarFailure,
	CalendarFailureNote,
	EmptyState,
	type EventDraft,
	EventEditorPane,
} from "@remit/ui";
import { useEffect, useState } from "react";
import {
	acceptEditedInputFromDrafts,
	anchorZoneFor,
	deviceTimeZone,
	draftFromSuggestion,
	UNZONED_CALENDAR,
	useCalendarSuggestionAnswers,
	useCalendars,
	useDraftClashes,
	usePendingCalendarSuggestion,
} from "../../hooks/calendar";
import { calendarReportHref } from "../../lib/calendar-report";
import { useOptionalCalendarSession } from "./CalendarSession";

const TITLE = "Add from mail";

const AMBIGUOUS_NOTICE =
	"The invitation named a time zone nothing could resolve. The time below is as the mail wrote it — check it before adding.";

export interface ChangeCalendarSuggestionProps {
	suggestionId: string;
	onClose: () => void;
}

export function ChangeCalendarSuggestion({
	suggestionId,
	onClose,
}: ChangeCalendarSuggestionProps) {
	const {
		suggestion: pending,
		isLoading,
		error,
	} = usePendingCalendarSuggestion(suggestionId);
	const found = pending ?? undefined;
	const [held, setHeld] = useState<
		RemitImapCalendarSuggestionResponse | undefined
	>(undefined);
	if (found !== undefined && held === undefined) setHeld(found);
	const suggestion = held ?? found;

	if (suggestion !== undefined)
		return (
			<SuggestionEditor
				key={suggestion.suggestionId}
				suggestion={suggestion}
				onClose={onClose}
			/>
		);

	if (error !== null) {
		const text = "Couldn't read what your mail is waiting on.";
		return (
			<EventEditorPane title={TITLE} onClose={onClose}>
				<CalendarFailureNote
					text={`${text} Close this and try again.`}
					reportHref={calendarReportHref(text)}
					className="m-row-inset"
				/>
			</EventEditorPane>
		);
	}

	return (
		<EventEditorPane title={TITLE} onClose={onClose}>
			<EmptyState
				message={
					isLoading
						? "Reading the suggestion…"
						: "This suggestion is no longer waiting on you. It was answered, or a later message replaced it."
				}
			/>
		</EventEditorPane>
	);
}

interface SuggestionEditorProps {
	suggestion: RemitImapCalendarSuggestionResponse;
	onClose: () => void;
}

function SuggestionEditor({ suggestion, onClose }: SuggestionEditorProps) {
	const {
		calendars: held,
		defaultCalendarId,
		timeZoneByCalendarId,
	} = useCalendars();
	const calendars = held.filter((calendar) => !calendar.readOnly);
	const answers = useCalendarSuggestionAnswers();
	const [seed] = useState<EventDraft>(() =>
		draftFromSuggestion(suggestion, "", deviceTimeZone()),
	);
	const [draft, setDraft] = useState<EventDraft>(seed);
	const dispatch = useOptionalCalendarSession()?.dispatch;
	useEffect(() => {
		dispatch?.({
			type: "sidebar-range",
			range: {
				date: seed.date,
				endDate: seed.endDate,
				startTime: seed.allDay ? "" : seed.startTime,
				endTime: seed.allDay ? "" : seed.endTime,
				allDay: seed.allDay,
			},
		});
	}, [seed, dispatch]);
	const [problem, setProblem] = useState("");
	const [failure, setFailure] = useState<CalendarFailure | undefined>();
	const clashes = useDraftClashes(draft);

	const initialCalendarId = calendars.some(
		(calendar) => calendar.id === defaultCalendarId,
	)
		? defaultCalendarId
		: (calendars[0]?.id ?? "");
	useEffect(() => {
		if (initialCalendarId === "") return;
		setDraft((current) =>
			current.calendarId === ""
				? { ...current, calendarId: initialCalendarId }
				: current,
		);
	}, [initialCalendarId]);

	const save = () => {
		const built = acceptEditedInputFromDrafts(suggestion, seed, draft, {
			clock: deviceTimeZone(),
			anchor: anchorZoneFor(
				timeZoneByCalendarId[draft.calendarId] ?? UNZONED_CALENDAR,
			),
		});
		if (!built.ok) {
			setProblem(built.problem);
			return;
		}
		setProblem("");
		void answers
			.acceptEdited(suggestion.suggestionId, built.input)
			.then((answer) => {
				if (answer.kind === "answered") {
					onClose();
					return;
				}
				const text = `Couldn't add this to your calendar: ${answer.message}`;
				setFailure({
					text,
					reportHref: calendarReportHref(text),
					onRetry: save,
				});
			});
	};

	return (
		<CalendarEventSidebar
			heading={TITLE}
			draft={draft}
			onChange={(next) => {
				setDraft(next);
				dispatch?.({
					type: "sidebar-range",
					range: {
						date: next.date,
						endDate: next.endDate,
						startTime: next.allDay ? "" : next.startTime,
						endTime: next.allDay ? "" : next.endTime,
						allDay: next.allDay,
					},
				});
			}}
			calendars={calendars}
			calendarEditable
			repeatEditable={false}
			timeZone={deviceTimeZone()}
			timeZones={[deviceTimeZone()]}
			onTimeZone={() => {}}
			busy
			onBusy={() => {}}
			onSave={save}
			onCancel={onClose}
			saving={answers.isAnswering}
			saveLabel="Add"
			failure={failure}
			problem={
				problem !== ""
					? problem
					: suggestion.zoneCertainty === "Ambiguous"
						? AMBIGUOUS_NOTICE
						: ""
			}
		>
			{clashes && <CalendarClashStrip clashes={clashes} />}
		</CalendarEventSidebar>
	);
}
