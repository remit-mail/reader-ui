import type { RemitImapCalendarTransparency } from "@remit/api-http-client/types.gen.ts";
import {
	CalendarEventGone,
	CalendarEventSidebar,
	type CalendarFailure,
	ConfirmDialog,
	type EventDraft,
	type RecurrenceScope,
	RecurrenceScopePrompt,
} from "@remit/ui";
import { useEffect, useId, useRef, useState } from "react";
import {
	anchorZoneFor,
	calendarInstanceId,
	createInputFromDraft,
	deviceTimeZone,
	draftFromEvent,
	isoOnClock,
	moveRule,
	patchFromDrafts,
	rruleFromIcalData,
	storedAnchorZone,
	textFromIcalData,
	textFromRrule,
	UNZONED_CALENDAR,
	useCalendarEvent,
	useCalendars,
	useCalendarWrites,
} from "../../hooks/calendar";
import type { SessionDraft } from "../../hooks/calendar/draft-session";
import { useCalendarData } from "../../hooks/useCalendarData";
import { formatEventWhen } from "../../lib/calendar-format";
import { calendarEventReportHref } from "../../lib/calendar-report";
import { rangeFromSearch, searchFromRange } from "../../lib/new-event-range";
import {
	useBackCloses,
	useCalendarAddress,
	useCalendarNavigation,
	useNewEventBounds,
} from "../../routing";
import { eventDraftOf } from "./CalendarQuickCreate";
import { useCalendarSession } from "./CalendarSession";

const CONFLICT =
	"This calendar changed while you were writing. Close the form and try again.";

const TIME_ZONES: readonly string[] = Intl.supportedValuesOf("timeZone");

const sameRange = (a: SessionDraft["range"], b: SessionDraft["range"]) =>
	a.date === b.date &&
	a.endDate === b.endDate &&
	a.startTime === b.startTime &&
	a.endTime === b.endTime &&
	a.allDay === b.allDay;

const rangeOfDraft = (draft: EventDraft): SessionDraft["range"] => ({
	date: draft.date,
	endDate: draft.endDate,
	startTime: draft.allDay ? "" : draft.startTime,
	endTime: draft.allDay ? "" : draft.endTime,
	allDay: draft.allDay,
});

const transparencyOf = (busy: boolean): RemitImapCalendarTransparency =>
	busy ? "Opaque" : "Transparent";

interface Extras {
	notes: string;
	repeat: string;
	timeZone: string;
	busy: boolean;
}

/** Focus carried from quick-create, or the title. */
function useFirstFocus(
	titleRef: React.RefObject<HTMLInputElement | null>,
	ready: boolean,
) {
	const { carriedFocus } = useCalendarSession();
	const focused = useRef(false);
	useEffect(() => {
		if (!ready || focused.current) return;
		focused.current = true;
		const label = carriedFocus.current;
		carriedFocus.current = "";
		const carried =
			label === ""
				? null
				: document.querySelector<HTMLElement>(
						`[data-event-sidebar] [aria-label="${CSS.escape(label)}"]`,
					);
		(carried ?? titleRef.current)?.focus();
	}, [carriedFocus, titleRef, ready]);
}

/** Cancel, Close and Esc: a touched draft asks before it is thrown away. */
function useSidebarClose(touched: boolean) {
	const { requestClose } = useCalendarSession();
	const { closeEditor } = useCalendarNavigation();
	const [confirming, setConfirming] = useState(false);
	const discarding = useRef(false);
	useBackCloses(touched && !confirming, () => {
		if (discarding.current) return false;
		setConfirming(true);
		return true;
	});
	const close = () => {
		if (touched) {
			setConfirming(true);
			return;
		}
		closeEditor();
	};
	const closeRef = useRef(close);
	closeRef.current = close;
	useEffect(() => {
		requestClose.current = () => closeRef.current();
		return () => {
			requestClose.current = null;
		};
	}, [requestClose]);
	const confirm = (
		<ConfirmDialog
			isOpen={confirming}
			title="Discard draft?"
			description="Your event has unsaved changes. Are you sure you want to discard them?"
			confirmLabel="Discard"
			cancelLabel="Keep editing"
			destructive
			onConfirm={() => {
				discarding.current = true;
				setConfirming(false);
				closeEditor();
			}}
			onCancel={() => setConfirming(false)}
		/>
	);
	return { close, confirm };
}

export function CalendarNewEventSidebar() {
	const { session, dispatch, focusSaved } = useCalendarSession();
	const { date } = useCalendarAddress();
	const bounds = useNewEventBounds();
	const { setNewEventBounds, closeEditor } = useCalendarNavigation();
	const {
		calendars: all,
		defaultCalendarId,
		timeZoneByCalendarId,
	} = useCalendars();
	const calendars = all.filter((calendar) => !calendar.readOnly);
	const { createEvent, isWriting } = useCalendarWrites();
	const titleRef = useRef<HTMLInputElement>(null);
	const failureRef = useRef<HTMLDivElement>(null);
	const clock = deviceTimeZone();
	const [extras, setExtras] = useState<Extras>({
		notes: "",
		repeat: "",
		timeZone: clock,
		busy: true,
	});
	const [problem, setProblem] = useState("");
	const [failure, setFailure] = useState<CalendarFailure | undefined>();
	const [initial] = useState(() =>
		session.mode === "sidebar" ? session.draft : undefined,
	);
	const urlRange = rangeFromSearch(bounds?.start, bounds?.end, date, clock);

	useEffect(() => {
		if (session.mode === "sidebar") return;
		dispatch({ type: "sidebar-range", range: urlRange });
	}, [session.mode, dispatch, urlRange]);

	const draft = session.mode === "sidebar" ? session.draft : undefined;
	const range = draft?.range;
	useEffect(() => {
		if (!range) return;
		const written = searchFromRange(range, clock);
		if (written.start === bounds?.start && written.end === bounds?.end) return;
		setNewEventBounds(written);
	}, [range, bounds, clock, setNewEventBounds]);

	useFirstFocus(titleRef, session.mode === "sidebar");
	useEffect(() => {
		if (failure) failureRef.current?.focus();
	}, [failure]);

	const fallbackCalendar =
		calendars.find((calendar) => calendar.id === defaultCalendarId)?.id ??
		calendars[0]?.id ??
		"";
	useEffect(() => {
		if (draft?.calendarId !== "" || fallbackCalendar === "") return;
		dispatch({
			type: "change",
			draft: { ...draft, calendarId: fallbackCalendar },
		});
	}, [draft, fallbackCalendar, dispatch]);

	const touched =
		draft !== undefined &&
		(extras.notes !== "" ||
			extras.repeat !== "" ||
			!extras.busy ||
			draft.title !== (initial?.title ?? "") ||
			draft.location !== (initial?.location ?? ""));
	const { close, confirm } = useSidebarClose(touched);

	if (!draft) return null;
	const eventDraft: EventDraft = {
		...eventDraftOf(draft),
		notes: extras.notes,
		repeat: extras.repeat,
	};

	const save = () => {
		const zone = extras.timeZone;
		const built = createInputFromDraft(eventDraft, {
			clock: zone,
			anchor:
				zone !== clock
					? zone
					: anchorZoneFor(
							timeZoneByCalendarId[draft.calendarId] ?? UNZONED_CALENDAR,
						),
		});
		if (!built.ok) {
			setProblem(built.problem);
			return;
		}
		setProblem("");
		setFailure(undefined);
		void createEvent({
			...built.input,
			transparency: transparencyOf(extras.busy),
		}).then((outcome) => {
			if (outcome.kind === "created") {
				dispatch({ type: "saved" });
				focusSaved(outcome.calendarObjectId);
				closeEditor();
				return;
			}
			const text =
				outcome.kind === "conflict"
					? CONFLICT
					: `Couldn't save this event: ${outcome.message}`;
			setFailure({
				text,
				reportHref: calendarEventReportHref(text),
				onRetry: save,
			});
		});
	};

	return (
		<>
			<CalendarEventSidebar
				heading="New event"
				draft={eventDraft}
				onChange={(next) => {
					dispatch({
						type: "change",
						draft: {
							range: rangeOfDraft(next),
							title: next.title,
							location: next.location,
							calendarId: next.calendarId,
						},
					});
					setExtras((current) => ({
						...current,
						notes: next.notes,
						repeat: next.repeat,
					}));
				}}
				calendars={calendars}
				calendarEditable
				repeatEditable
				timeZone={extras.timeZone}
				timeZones={TIME_ZONES}
				onTimeZone={(timeZone) =>
					setExtras((current) => ({ ...current, timeZone }))
				}
				busy={extras.busy}
				onBusy={(busy) => setExtras((current) => ({ ...current, busy }))}
				onSave={save}
				onCancel={close}
				saving={isWriting}
				problem={problem}
				failure={failure}
				failureRef={failureRef}
				titleRef={titleRef}
			/>
			{confirm}
		</>
	);
}

export interface CalendarEditEventSidebarProps {
	calendarObjectId: string;
	recurrenceId?: string;
}

export function CalendarEditEventSidebar({
	calendarObjectId,
	recurrenceId,
}: CalendarEditEventSidebarProps) {
	const { session, dispatch, focusSaved } = useCalendarSession();
	const { view, date, calendarIds } = useCalendarAddress();
	const { events, isLoading, freeIds } = useCalendarData({
		view,
		date,
		calendarIds,
	});
	const { calendars, timeZoneByCalendarId } = useCalendars();
	const { closeEditor } = useCalendarNavigation();
	const { updateEvent, isWriting } = useCalendarWrites();
	const titleRef = useRef<HTMLInputElement>(null);
	const failureRef = useRef<HTMLDivElement>(null);
	const goneId = useId();
	const instanceId = calendarInstanceId(calendarObjectId, recurrenceId ?? "");
	const event = events.find((candidate) => candidate.id === instanceId);
	const { resource } = useCalendarEvent(
		calendarObjectId,
		event?.calendarId ?? "",
	);
	const [before, setBefore] = useState<
		{ draft: EventDraft; busy: boolean; anchor: string } | undefined
	>();
	const [after, setAfter] = useState<EventDraft | undefined>();
	const [busy, setBusy] = useState(true);
	const [timeZone, setTimeZone] = useState(deviceTimeZone());
	const [asking, setAsking] = useState(false);
	const [problem, setProblem] = useState("");
	const [failure, setFailure] = useState<CalendarFailure | undefined>();

	useEffect(() => {
		if (before || !event || !resource) return;
		const rrule = rruleFromIcalData(resource.icalData);
		const anchor = storedAnchorZone(
			resource.icalData,
			timeZoneByCalendarId[event.calendarId] ?? UNZONED_CALENDAR,
		);
		const startTime = event.allDay ? "" : event.start.slice(11, 16);
		const shownRule = event.allDay
			? rrule
			: moveRule(
					rrule,
					isoOnClock(event.start, anchor === "" ? "UTC" : anchor).slice(0, 10),
					event.start.slice(0, 10),
				);
		const stored = textFromIcalData(resource.icalData);
		const draft = draftFromEvent(event, {
			repeat:
				rrule === "" ? "" : (textFromRrule(shownRule, startTime) ?? "Repeats"),
			location: stored.location,
			notes: stored.description,
		});
		const isBusy = !freeIds.has(event.id);
		setBefore({ draft, busy: isBusy, anchor });
		setAfter(draft);
		setBusy(isBusy);
		dispatch({ type: "sidebar-range", range: rangeOfDraft(draft) });
	}, [before, event, resource, freeIds, timeZoneByCalendarId, dispatch]);

	const sessionRange =
		session.mode === "sidebar" ? session.draft.range : undefined;
	useEffect(() => {
		if (!sessionRange || !after) return;
		if (sameRange(sessionRange, rangeOfDraft(after))) return;
		setAfter({
			...after,
			date: sessionRange.date,
			endDate: sessionRange.endDate,
			startTime: sessionRange.startTime,
			endTime: sessionRange.endTime,
			allDay: sessionRange.allDay,
		});
	}, [sessionRange, after]);

	const loaded = after !== undefined;
	useEffect(() => {
		if (loaded) titleRef.current?.focus();
	}, [loaded]);

	useEffect(() => {
		if (failure) failureRef.current?.focus();
	}, [failure]);

	const touched =
		before !== undefined &&
		after !== undefined &&
		(JSON.stringify(before.draft) !== JSON.stringify(after) ||
			busy !== before.busy);
	const { close, confirm } = useSidebarClose(touched);

	const gone = !isLoading && event === undefined;
	if (gone)
		return (
			<section
				className="flex h-full flex-col bg-surface"
				aria-labelledby={goneId}
			>
				<CalendarEventGone headingId={goneId} onClose={closeEditor} />
			</section>
		);
	if (!event || !before || !after) return null;

	const calendar = calendars.find(
		(candidate) => candidate.id === event.calendarId,
	);
	const repeats = event.seriesId !== "" && recurrenceId !== undefined;

	const save = (scope: RecurrenceScope | undefined) => {
		setAsking(false);
		const patch = patchFromDrafts(before.draft, after, {
			clock: timeZone,
			anchor: timeZone !== deviceTimeZone() ? timeZone : before.anchor,
		});
		if (!patch.ok) {
			setProblem(patch.problem);
			return;
		}
		setProblem("");
		setFailure(undefined);
		const body =
			busy !== before.busy
				? { ...patch.patch, transparency: transparencyOf(busy) }
				: patch.patch;
		void updateEvent(
			{
				calendarObjectId,
				calendarId: event.calendarId,
				recurrenceId: recurrenceId ?? "",
				scope,
				etag: resource?.etag ?? "",
			},
			body,
		).then((outcome) => {
			if (outcome.kind === "written") {
				dispatch({ type: "saved" });
				focusSaved(calendarObjectId);
				closeEditor();
				return;
			}
			const text =
				outcome.kind === "conflict"
					? CONFLICT
					: `Couldn't save this event: ${outcome.message}`;
			setFailure({
				text,
				reportHref: calendarEventReportHref(text),
				onRetry: () => save(scope),
			});
		});
	};

	return (
		<>
			<CalendarEventSidebar
				heading="Edit event"
				draft={after}
				onChange={(next) => {
					setAfter(next);
					dispatch({ type: "sidebar-range", range: rangeOfDraft(next) });
				}}
				calendars={calendar ? [calendar] : []}
				calendarEditable={false}
				repeatEditable={!repeats}
				timeZone={timeZone}
				timeZones={TIME_ZONES}
				onTimeZone={setTimeZone}
				busy={busy}
				onBusy={setBusy}
				onSave={() => (repeats ? setAsking(true) : save(undefined))}
				onCancel={close}
				saving={isWriting}
				problem={problem}
				failure={failure}
				failureRef={failureRef}
				titleRef={titleRef}
			>
				{asking && (
					<RecurrenceScopePrompt
						title={event.title}
						ruleText={after.repeat === "" ? "It repeats" : after.repeat}
						instanceText={formatEventWhen(event)}
						onChoose={save}
						onCancel={() => setAsking(false)}
					/>
				)}
			</CalendarEventSidebar>
			{confirm}
		</>
	);
}
