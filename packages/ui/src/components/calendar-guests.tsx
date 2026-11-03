import { Check, CircleHelp, Clock3, Crown, X } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "../lib/cn.js";
import {
	formatGuestList,
	type GuestEntry,
	parseGuest,
	parseGuestList,
} from "../lib/guest-list.js";
import {
	type CalendarFailure,
	CalendarFailureBlock,
} from "./calendar-event-popup.js";
import type { CalendarAttendee, RsvpState } from "./calendar-types.js";

/** A contact the Guests field offers while the reader types. */
export interface GuestSuggestion {
	email: string;
	name: string;
}

export interface CalendarGuestsFieldProps {
	/** The field text: guests separated by commas. */
	value: string;
	onChange: (value: string) => void;
	/** Contacts matching what is being typed. */
	suggestions: readonly GuestSuggestion[];
	/** What is being typed, so the caller can look contacts up. */
	onQuery: (query: string) => void;
	touch?: boolean;
}

const chip =
	"inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-sm";

/**
 * Guests as chips, added by typing an address or picking a contact. An entry
 * that is not an address stays as a chip marked invalid and named under the
 * field, so the reader fixes or removes it before the event can be saved.
 */
export function CalendarGuestsField({
	value,
	onChange,
	suggestions,
	onQuery,
	touch = false,
}: CalendarGuestsFieldProps) {
	const listId = useId();
	const noteId = useId();
	const [draft, setDraft] = useState("");
	const guests = parseGuestList(value);
	const invalid = guests.find((guest) => !guest.valid);

	const commit = (text: string) => {
		if (text.trim() === "") return;
		const picked = suggestions.find(
			(suggestion) => suggestion.email === text.trim().toLowerCase(),
		);
		const entry = picked
			? parseGuest(
					picked.name === ""
						? picked.email
						: `${picked.name} <${picked.email}>`,
				)
			: parseGuest(text);
		onChange(formatGuestList([...guests, entry]));
		setDraft("");
		onQuery("");
	};

	const remove = (guest: GuestEntry) =>
		onChange(formatGuestList(guests.filter((other) => other !== guest)));

	return (
		<div className="flex flex-col gap-2">
			{guests.length > 0 && (
				<ul aria-label="Guests" className="flex flex-wrap gap-1.5">
					{guests.map((guest) => (
						<li
							key={guest.text}
							className={cn(
								chip,
								guest.valid
									? "border-line bg-surface-sunken text-fg"
									: "border-danger bg-danger-soft text-danger",
							)}
						>
							<span className="truncate">
								{guest.valid ? guest.displayName : guest.text}
							</span>
							<button
								type="button"
								aria-label={`Remove ${guest.valid ? guest.email : guest.text}`}
								onClick={() => remove(guest)}
								className="rounded-full p-0.5 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
							>
								<X className="size-3" />
							</button>
						</li>
					))}
				</ul>
			)}
			<input
				aria-label="Guests"
				aria-describedby={invalid ? noteId : undefined}
				aria-invalid={invalid ? true : undefined}
				placeholder="Add guests"
				list={listId}
				value={draft}
				onChange={(event) => {
					const text = event.target.value;
					if (/[,;]$/.test(text)) {
						commit(text.slice(0, -1));
						return;
					}
					setDraft(text);
					onQuery(text);
				}}
				onKeyDown={(event) => {
					if (event.key !== "Enter" || draft.trim() === "") return;
					event.preventDefault();
					commit(draft);
				}}
				onBlur={() => commit(draft)}
				className={cn(
					"h-9 w-full rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:border-line-strong focus-visible:ring-2 focus-visible:ring-ring/30",
					touch && "h-11",
				)}
			/>
			<datalist id={listId}>
				{suggestions.map((suggestion) => (
					<option key={suggestion.email} value={suggestion.email}>
						{suggestion.name}
					</option>
				))}
			</datalist>
			{invalid && (
				<p id={noteId} role="status" className="text-sm text-danger">
					{invalid.text} is not an email address. Fix or remove it to save.
				</p>
			)}
		</div>
	);
}

/** One of the reader's accounts, as a sending-account list offers it. */
export interface CalendarSender {
	accountId: string;
	email: string;
}

export interface CalendarSenderFieldProps {
	label: string;
	senders: readonly CalendarSender[];
	value: string;
	onChange: (accountId: string) => void;
	disabled?: boolean;
	touch?: boolean;
}

/** The account an event's invitations go out from. */
export function CalendarSenderField({
	label,
	senders,
	value,
	onChange,
	disabled = false,
	touch = false,
}: CalendarSenderFieldProps) {
	return (
		<select
			aria-label={label}
			value={value}
			disabled={disabled}
			onChange={(event) => onChange(event.target.value)}
			className={cn(
				"h-9 w-full rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60",
				touch && "h-11",
			)}
		>
			{senders.map((sender) => (
				<option key={sender.accountId} value={sender.accountId}>
					{sender.email}
				</option>
			))}
		</select>
	);
}

const TALLY_WORDS: [RsvpState, string][] = [
	["accepted", "yes"],
	["declined", "no"],
	["tentative", "maybe"],
	["noReply", "awaiting"],
];

/** "1 yes, 1 maybe, 1 awaiting": every answer that somebody gave. */
export function guestTally(attendees: readonly CalendarAttendee[]): string {
	return TALLY_WORDS.flatMap(([rsvp, word]) => {
		const count = attendees.filter((attendee) => attendee.rsvp === rsvp).length;
		return count === 0 ? [] : [`${count} ${word}`];
	}).join(", ");
}

const answerMark = (rsvp: RsvpState) => {
	if (rsvp === "accepted")
		return <Check className="size-3.5 text-positive" aria-label="Yes" />;
	if (rsvp === "declined")
		return <X className="size-3.5 text-danger" aria-label="No" />;
	if (rsvp === "tentative")
		return <CircleHelp className="size-3.5 text-fg-muted" aria-label="Maybe" />;
	return <Clock3 className="size-3.5 text-fg-subtle" aria-label="Awaiting" />;
};

/**
 * The guest list in the event popup: how many, how they answered, and who,
 * with the organizer marked. Read-only: the guest list changes in the editor.
 */
export function CalendarEventGuests({
	attendees,
}: {
	attendees: readonly CalendarAttendee[];
}) {
	if (attendees.length === 0) return null;
	return (
		<section aria-label="Guests" className="flex flex-col gap-1.5 px-2 text-sm">
			<p className="font-medium text-fg">
				{attendees.length} {attendees.length === 1 ? "guest" : "guests"}
			</p>
			<p className="text-fg-muted">{guestTally(attendees)}</p>
			<ul className="flex flex-col gap-1">
				{attendees.map((attendee) => (
					<li key={attendee.email} className="flex items-center gap-2">
						{answerMark(attendee.rsvp)}
						<span className="min-w-0 truncate">
							{attendee.name === "" ? attendee.email : attendee.name}
						</span>
						{attendee.role === "organizer" && (
							<span className="inline-flex items-center gap-0.5 text-xs text-fg-muted">
								<Crown className="size-3" aria-hidden="true" />
								Organizer
							</span>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}

/** An answer a guest can give. */
export type CalendarAnswer = "accepted" | "declined" | "tentative";

const ANSWERS: [CalendarAnswer, string][] = [
	["accepted", "Yes"],
	["declined", "No"],
	["tentative", "Maybe"],
];

export interface CalendarReplyRowProps {
	/** The answer the reader has given, `noReply` when none yet. */
	current: RsvpState;
	onAnswer: (answer: CalendarAnswer) => void;
	sending?: boolean;
	failure?: CalendarFailure;
}

/** `Going?` with Yes, No and Maybe, the current answer pressed. */
export function CalendarReplyRow({
	current,
	onAnswer,
	sending = false,
	failure,
}: CalendarReplyRowProps) {
	return (
		<div className="flex flex-col gap-2 border-t border-line px-2 pt-3">
			<fieldset className="flex items-center gap-2">
				<legend className="sr-only">Going?</legend>
				<span aria-hidden="true" className="mr-1 text-sm text-fg">
					Going?
				</span>
				{ANSWERS.map(([answer, label]) => (
					<button
						key={answer}
						type="button"
						aria-pressed={current === answer}
						disabled={sending}
						onClick={() => onAnswer(answer)}
						className={cn(
							"h-8 rounded-full border px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
							current === answer
								? "border-accent bg-accent text-accent-fg"
								: "border-line hover:bg-surface-sunken",
						)}
					>
						{label}
					</button>
				))}
			</fieldset>
			{failure && <CalendarFailureBlock failure={failure} />}
		</div>
	);
}

export interface CalendarInvitationsNotSentProps {
	/** The guests whose invitation, update or cancellation did not go out. */
	missed: readonly string[];
	onRetry: () => void;
	reportHref: string;
	onDismiss: () => void;
}

/** The event is saved; these guests were not reached. */
export function CalendarInvitationsNotSent({
	missed,
	onRetry,
	reportHref,
	onDismiss,
}: CalendarInvitationsNotSentProps) {
	if (missed.length === 0) return null;
	const names = missed.join(", ");
	return (
		<div
			role="alert"
			className="flex flex-wrap items-center gap-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm"
		>
			<p className="text-danger">
				Saved, but the {missed.length === 1 ? "invitation" : "invitations"} to{" "}
				{names} didn't go out.
			</p>
			<button
				type="button"
				onClick={onRetry}
				className="rounded-md border border-line bg-surface px-3 py-1 font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
			>
				Try again
			</button>
			<a
				href={reportHref}
				target="_blank"
				rel="noreferrer"
				className="font-medium text-accent hover:underline"
			>
				Report an issue
			</a>
			<button
				type="button"
				aria-label="Dismiss"
				onClick={onDismiss}
				className="ml-auto rounded-full p-1 text-fg-muted hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
