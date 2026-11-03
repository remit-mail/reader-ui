import type {
	RemitImapCalendarAttendee,
	RemitImapCalendarInviteAnswer,
} from "@remit/api-http-client/types.gen.ts";
import {
	type CalendarAnswer,
	type CalendarAttendee,
	CalendarEventGone,
	CalendarEventGuests,
	CalendarEventPopupCard,
	type CalendarFailure,
	CalendarPopover,
	CalendarReplyRow,
	type RecurrenceScope,
	RecurrenceScopePrompt,
} from "@remit/ui";
import { Navigate } from "@tanstack/react-router";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
	type CalendarWriteOutcome,
	calendarInstanceId,
	rsvpOfParticipation,
	type ScopedWrite,
	seriesOccurrenceOf,
	textFromIcalData,
	useCalendarEvent,
	useCalendarJump,
	useCalendars,
	useCalendarWrites,
} from "../../hooks/calendar";
import { useCalendarData } from "../../hooks/useCalendarData";
import { formatEventWhen } from "../../lib/calendar-format";
import { calendarEventReportHref } from "../../lib/calendar-report";
import type { CalendarSearch } from "../../lib/calendar-route";
import { useCalendarAddress, useCalendarNavigation } from "../../routing";
import { useOptionalCalendarSession } from "./CalendarSession";
import { CalendarTaskPopup } from "./CalendarTaskPopup";

const ATTENDEE_RSVP: Record<
	RemitImapCalendarAttendee["status"],
	CalendarAttendee["rsvp"]
> = {
	Accepted: "accepted",
	Declined: "declined",
	Tentative: "tentative",
	NeedsAction: "noReply",
};

const toAttendee = (attendee: RemitImapCalendarAttendee): CalendarAttendee => ({
	name: attendee.displayName,
	email: attendee.email,
	rsvp: ATTENDEE_RSVP[attendee.status],
	role: attendee.role === "Organizer" ? "organizer" : "attendee",
});

const ANSWER_OF: Record<CalendarAnswer, RemitImapCalendarInviteAnswer> = {
	accepted: "Accepted",
	declined: "Declined",
	tentative: "Tentative",
};

export interface CalendarEventPopupProps {
	calendarObjectId: string;
	/** One occurrence of a series, absent on the series itself. */
	recurrenceId?: string;
}

const CONFLICT = "This calendar changed while you were writing.";

const failureText = (outcome: CalendarWriteOutcome): string =>
	outcome.kind === "conflict"
		? `${CONFLICT} Close the popup and open the event again.`
		: outcome.kind === "refused"
			? `Couldn't delete this event: ${outcome.message}`
			: "";

/**
 * The event the address names, in a popup beside its chip. It is a
 * navigation, so Back closes it; Esc, Close and a click outside go back too.
 */
export function CalendarEventPopup(props: CalendarEventPopupProps) {
	if (props.calendarObjectId.startsWith("task:"))
		return <CalendarTaskPopup eventId={props.calendarObjectId} />;
	return <CalendarStoredEventPopup {...props} />;
}

function CalendarStoredEventPopup({
	calendarObjectId,
	recurrenceId,
}: CalendarEventPopupProps) {
	const { view, date, calendarIds } = useCalendarAddress();
	const { events, isLoading, freeIds } = useCalendarData({
		view,
		date,
		calendarIds,
	});
	const { calendars } = useCalendars();
	const { closeToView, openEditor } = useCalendarNavigation();
	const { deleteEvent, updateEvent, isWriting } = useCalendarWrites();
	const calendarSession = useOptionalCalendarSession();
	const [answering, setAnswering] = useState<CalendarAnswer | undefined>();
	const [replyFailure, setReplyFailure] = useState<
		CalendarFailure | undefined
	>();
	const headingId = useId();
	const headingRef = useRef<HTMLHeadingElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const failureRef = useRef<HTMLDivElement>(null);
	const [asking, setAsking] = useState(false);
	const [failure, setFailure] = useState<CalendarFailure | undefined>(
		undefined,
	);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	const instanceId = calendarInstanceId(calendarObjectId, recurrenceId ?? "");
	const event = events.find((candidate) => candidate.id === instanceId);
	const seriesOnly = recurrenceId === undefined && event === undefined;
	const occurrence = seriesOnly
		? seriesOccurrenceOf(events, calendarObjectId, new Date().toISOString())
		: undefined;
	const search = useCalendarJump(
		calendarObjectId,
		event === undefined && !isLoading && occurrence === undefined,
	);
	const calendar = calendars.find(
		(candidate) => candidate.id === event?.calendarId,
	);
	const { resource } = useCalendarEvent(
		calendarObjectId,
		event?.calendarId ?? "",
	);
	const stored = resource ? textFromIcalData(resource.icalData) : undefined;
	const writable =
		event !== undefined && resource !== undefined && !calendar?.readOnly;
	const repeats = event !== undefined && event.seriesId !== "";

	useLayoutEffect(() => {
		setAnchor(
			event
				? document.querySelector<HTMLElement>(
						`[data-event-id="${CSS.escape(event.id)}"]`,
					)
				: null,
		);
	}, [event]);

	const gone = search.kind === "Deleted" || search.kind === "NoOccurrenceFound";

	useEffect(() => {
		if (gone) closeRef.current?.focus();
		else if (event) headingRef.current?.focus();
	}, [gone, event]);

	useEffect(() => {
		if (failure) failureRef.current?.focus();
	}, [failure]);

	useEffect(() => {
		const chipSelector = `[data-event-id="${CSS.escape(instanceId)}"]`;
		return () => {
			document.querySelector<HTMLElement>(chipSelector)?.focus();
		};
	}, [instanceId]);

	const write = (scope: RecurrenceScope | undefined): ScopedWrite => ({
		calendarObjectId,
		calendarId: event?.calendarId ?? "",
		recurrenceId: recurrenceId ?? "",
		scope,
		etag: resource?.etag ?? "",
	});

	const remove = (scope: RecurrenceScope | undefined) => {
		setAsking(false);
		void deleteEvent(write(scope)).then((outcome) => {
			if (outcome.kind === "written") {
				calendarSession?.trackSends(outcome.sends);
				closeToView();
				return;
			}
			const text = failureText(outcome);
			setFailure({
				text,
				reportHref: calendarEventReportHref(text),
				onRetry: () => remove(scope),
			});
		});
	};

	const reply = (
		answer: CalendarAnswer,
		scope: RecurrenceScope | undefined,
	) => {
		setAnswering(undefined);
		setReplyFailure(undefined);
		void updateEvent(write(scope), { answer: ANSWER_OF[answer] }).then(
			(outcome) => {
				if (outcome.kind === "written") {
					calendarSession?.trackSends(outcome.sends);
					return;
				}
				const text =
					outcome.kind === "conflict"
						? `${CONFLICT} Close the popup and open the event again.`
						: `Couldn't send your reply: ${outcome.message}`;
				setReplyFailure({
					text,
					reportHref: calendarEventReportHref(text),
					onRetry: () => reply(answer, scope),
				});
			},
		);
	};
	const participation = resource?.participation;
	const isGuest =
		participation !== undefined &&
		participation !== "Organizer" &&
		participation !== "Unscheduled";

	if (occurrence) {
		return (
			<Navigate
				to="/calendar/$view/$date/$calendarObjectId/$recurrenceId"
				params={{
					view,
					date,
					calendarObjectId,
					recurrenceId: occurrence.recurrenceId,
				}}
				search={true}
				hash={true}
				replace
			/>
		);
	}

	const jump = search.kind === "Found" ? search.jump : undefined;
	const hidden =
		jump !== undefined &&
		calendarIds.length > 0 &&
		!calendarIds.includes(jump.calendarId);
	if (jump && (jump.date !== date || hidden)) {
		const shown = hidden
			? (previous: CalendarSearch) => ({
					...previous,
					calendarId: [...calendarIds, jump.calendarId],
				})
			: true;
		return jump.recurrenceId === "" ? (
			<Navigate
				to="/calendar/$view/$date/$calendarObjectId"
				params={{ view, date: jump.date, calendarObjectId }}
				search={shown}
				hash={true}
				replace
			/>
		) : (
			<Navigate
				to="/calendar/$view/$date/$calendarObjectId/$recurrenceId"
				params={{
					view,
					date: jump.date,
					calendarObjectId,
					recurrenceId: jump.recurrenceId,
				}}
				search={shown}
				hash={true}
				replace
			/>
		);
	}

	if (search.kind === "Failed" && !event) {
		const text = `Couldn't open this event: ${search.reason}`;
		return (
			<CalendarPopover anchor={null} anchorKey="failed" labelledBy={headingId}>
				<div className="flex flex-col gap-3 p-4" id={headingId}>
					<p role="alert" className="text-sm text-danger">
						{text}{" "}
						<a
							href={calendarEventReportHref(text)}
							target="_blank"
							rel="noreferrer"
							className="font-medium text-accent hover:underline"
						>
							Report an issue
						</a>
					</p>
					<button
						type="button"
						onClick={closeToView}
						className="self-end rounded-md border border-line px-3 py-1.5 text-sm font-medium"
					>
						Close
					</button>
				</div>
			</CalendarPopover>
		);
	}

	if (gone) {
		return (
			<CalendarPopover anchor={null} anchorKey="gone" labelledBy={headingId}>
				<CalendarEventGone
					headingId={headingId}
					onClose={closeToView}
					closeRef={closeRef}
				/>
			</CalendarPopover>
		);
	}

	if (!event) return null;

	return (
		<CalendarPopover
			anchor={anchor}
			anchorKey={`${instanceId}:${anchor ? "chip" : "none"}`}
			labelledBy={headingId}
		>
			<CalendarEventPopupCard
				headingId={headingId}
				headingRef={headingRef}
				title={event.title}
				color={calendar?.color ?? "cal-1"}
				when={formatEventWhen(event).replace(", ", " · ")}
				location={stored?.location ?? ""}
				calendarName={calendar?.name ?? ""}
				availability={freeIds.has(event.id) ? "Free" : "Busy"}
				onEdit={
					writable
						? () => openEditor(calendarObjectId, recurrenceId)
						: undefined
				}
				onDelete={
					writable
						? () => (repeats ? setAsking(true) : remove(undefined))
						: undefined
				}
				deleting={isWriting}
				onClose={closeToView}
				failure={failure}
				failureRef={failureRef}
			>
				{resource && (
					<CalendarEventGuests attendees={resource.attendees.map(toAttendee)} />
				)}
				{isGuest && participation && (
					<CalendarReplyRow
						current={rsvpOfParticipation(participation)}
						onAnswer={(answer) =>
							repeats ? setAnswering(answer) : reply(answer, undefined)
						}
						sending={isWriting}
						failure={replyFailure}
					/>
				)}
				{answering && (
					<RecurrenceScopePrompt
						title={event.title}
						ruleText="It repeats"
						instanceText={formatEventWhen(event)}
						scopes={["this", "all"]}
						onChoose={(scope) => reply(answering, scope)}
						onCancel={() => setAnswering(undefined)}
					/>
				)}
				{asking && (
					<RecurrenceScopePrompt
						title={event.title}
						ruleText="It repeats"
						instanceText={formatEventWhen(event)}
						onChoose={remove}
						onCancel={() => setAsking(false)}
					/>
				)}
			</CalendarEventPopupCard>
		</CalendarPopover>
	);
}
