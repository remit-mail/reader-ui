import { Check, CheckSquare, Square, X } from "lucide-react";
import { useId } from "react";
import { cn } from "../lib/cn.js";
import type { CalendarAttendee, RsvpState } from "./calendar-types.js";

/**
 * Screens that wait for reader's API to carry guests, tasks and replies
 * (requirements FF1 to FF3). Presentational only; nothing mounts them yet.
 */

const field =
	"h-9 w-full rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isGuestEmail(entry: string): boolean {
	return EMAIL.test(entry.trim());
}

export interface GuestsFieldProps {
	guests: readonly string[];
	/** What is typed but not yet a chip. */
	entry: string;
	onEntry: (entry: string) => void;
	onAdd: (guest: string) => void;
	onRemove: (guest: string) => void;
}

/** Guests as chips; an entry that is not an email is marked and named. */
export function GuestsField({
	guests,
	entry,
	onEntry,
	onAdd,
	onRemove,
}: GuestsFieldProps) {
	const messageId = useId();
	const invalid = guests.filter((guest) => !isGuestEmail(guest));
	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-surface-sunken p-1">
				{guests.map((guest) => (
					<span
						key={guest}
						className={cn(
							"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
							isGuestEmail(guest)
								? "bg-surface text-fg"
								: "bg-danger-soft text-danger",
						)}
					>
						{guest}
						<button
							type="button"
							aria-label={`Remove ${guest}`}
							onClick={() => onRemove(guest)}
							className="rounded-full hover:bg-surface-sunken"
						>
							<X className="size-3" />
						</button>
					</span>
				))}
				<input
					aria-label="Guests"
					placeholder="Add guests"
					value={entry}
					aria-invalid={invalid.length > 0}
					aria-describedby={invalid.length > 0 ? messageId : undefined}
					onChange={(event) => onEntry(event.target.value)}
					onKeyDown={(event) => {
						if (event.key !== "Enter" && event.key !== ",") return;
						event.preventDefault();
						if (entry.trim() !== "") onAdd(entry.trim());
					}}
					className="min-w-32 flex-1 bg-transparent px-1 text-sm outline-none"
				/>
			</div>
			{invalid.length > 0 && (
				<p id={messageId} className="text-xs text-danger">
					{invalid.join(", ")} {invalid.length === 1 ? "is" : "are"} not an
					email address. Fix or remove it to save.
				</p>
			)}
		</div>
	);
}

export type EntryKind = "event" | "task";

/** The Event and Task switch under the title. */
export function EventTaskSwitch({
	value,
	onChange,
}: {
	value: EntryKind;
	onChange: (kind: EntryKind) => void;
}) {
	return (
		<div role="radiogroup" aria-label="Kind" className="flex gap-1">
			{(["event", "task"] as const).map((kind) => (
				// biome-ignore lint/a11y/useSemanticElements: a two-option switch styled as pills
				<button
					key={kind}
					type="button"
					role="radio"
					aria-checked={value === kind}
					onClick={() => onChange(kind)}
					className={cn(
						"rounded-md px-3 py-1 text-sm font-medium",
						value === kind
							? "bg-accent-soft text-accent"
							: "text-fg-muted hover:bg-surface-sunken",
					)}
				>
					{kind === "event" ? "Event" : "Task"}
				</button>
			))}
		</div>
	);
}

export interface SenderAccount {
	id: string;
	email: string;
}

/** Which account sends the invitations. */
export function SenderPicker({
	accounts,
	value,
	onChange,
}: {
	accounts: readonly SenderAccount[];
	value: string;
	onChange: (id: string) => void;
}) {
	return (
		<select
			aria-label="Send invitations from"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className={field}
		>
			{accounts.map((account) => (
				<option key={account.id} value={account.id}>
					{account.email}
				</option>
			))}
		</select>
	);
}

const ANSWER_LABEL: Record<RsvpState, string> = {
	accepted: "yes",
	declined: "no",
	tentative: "maybe",
	noReply: "awaiting",
};

/** The guest count, the tally of answers and the list with the organiser marked. */
export function GuestList({
	attendees,
}: {
	attendees: readonly CalendarAttendee[];
}) {
	const tally = (["accepted", "declined", "tentative", "noReply"] as const)
		.map((state) => ({
			state,
			count: attendees.filter((attendee) => attendee.rsvp === state).length,
		}))
		.filter((entry) => entry.count > 0)
		.map((entry) => `${entry.count} ${ANSWER_LABEL[entry.state]}`)
		.join(", ");
	return (
		<section aria-label="Guests" className="flex flex-col gap-1 text-sm">
			<p className="font-medium text-fg">
				{attendees.length} {attendees.length === 1 ? "guest" : "guests"}
			</p>
			<p className="text-xs text-fg-muted">{tally}</p>
			<ul className="flex flex-col gap-1">
				{attendees.map((attendee) => (
					<li key={attendee.email} className="flex items-center gap-2">
						<span className="size-6 shrink-0 rounded-full bg-surface-sunken text-center text-xs leading-6">
							{attendee.name.slice(0, 1)}
						</span>
						<span className="min-w-0 flex-1 truncate">
							{attendee.name}
							{attendee.role === "organizer" && (
								<span className="ml-1 text-xs text-fg-subtle">Organizer</span>
							)}
						</span>
						{attendee.rsvp === "accepted" && (
							<Check className="size-3.5 text-accent" aria-label="Going" />
						)}
					</li>
				))}
			</ul>
		</section>
	);
}

export type ReplyAnswer = "yes" | "no" | "maybe";

/** Going? with Yes, No and Maybe as one radio group. */
export function ReplyGroup({
	value,
	onChange,
	disabled = false,
}: {
	value: ReplyAnswer | undefined;
	onChange: (answer: ReplyAnswer) => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex items-center gap-3 border-t border-line pt-3">
			<span className="text-sm text-fg">Going?</span>
			<div role="radiogroup" aria-label="Going?" className="flex gap-1">
				{(["yes", "no", "maybe"] as const).map((answer) => (
					// biome-ignore lint/a11y/useSemanticElements: answers styled as pills
					<button
						key={answer}
						type="button"
						role="radio"
						aria-checked={value === answer}
						disabled={disabled}
						onClick={() => onChange(answer)}
						className={cn(
							"rounded-full border px-3 py-1 text-sm capitalize",
							value === answer
								? "border-accent bg-accent-soft text-accent"
								: "border-line text-fg-muted hover:bg-surface-sunken",
						)}
					>
						{answer}
					</button>
				))}
			</div>
		</div>
	);
}

/** The guests an invitation did not reach, with the way to send it again. */
export function InvitationsNotSent({
	missed,
	onRetry,
	onClose,
	reportHref,
}: {
	missed: readonly string[];
	onRetry: () => void;
	onClose: () => void;
	reportHref: string;
}) {
	return (
		<div
			role="alert"
			className="flex items-start gap-3 border-b border-danger/40 bg-danger-soft px-3 py-2 text-sm"
		>
			<p className="min-w-0 flex-1 text-danger">
				The event is saved, but the invitation did not reach {missed.join(", ")}
				.
			</p>
			<button
				type="button"
				onClick={onRetry}
				className="font-medium text-accent"
			>
				Try again
			</button>
			<a
				href={reportHref}
				target="_blank"
				rel="noreferrer"
				className="text-accent"
			>
				Report an issue
			</a>
			<button type="button" aria-label="Dismiss" onClick={onClose}>
				<X className="size-4" />
			</button>
		</div>
	);
}

/** A task's popup: title, due date, list and description, with Mark done. */
export function TaskPopupCard({
	title,
	due,
	list,
	description,
	done,
	onToggleDone,
}: {
	title: string;
	due: string;
	list: string;
	description: string;
	done: boolean;
	onToggleDone: () => void;
}) {
	return (
		<div className="flex flex-col gap-2 p-4">
			<div className="flex items-start gap-2">
				{/* biome-ignore lint/a11y/useSemanticElements: an icon checkbox named by the task title */}
				<button
					type="button"
					role="checkbox"
					aria-checked={done}
					aria-label={title}
					onClick={onToggleDone}
					className="mt-1 text-accent"
				>
					{done ? (
						<CheckSquare className="size-5" />
					) : (
						<Square className="size-5" />
					)}
				</button>
				<h2
					className={cn("text-xl text-fg", done && "line-through opacity-60")}
				>
					{title}
				</h2>
			</div>
			<p className="text-sm text-fg-muted">{due}</p>
			<p className="text-sm text-fg-muted">{list}</p>
			{description !== "" && <p className="text-sm text-fg">{description}</p>}
			<button
				type="button"
				onClick={onToggleDone}
				className="self-start rounded-md border border-line px-3 py-1.5 text-sm font-medium"
			>
				{done ? "Mark not done" : "Mark done"}
			</button>
		</div>
	);
}

/** The settings row that names the account invitations go out from by default. */
export function DefaultSenderSetting({
	accounts,
	value,
	onChange,
}: {
	accounts: readonly SenderAccount[];
	value: string;
	onChange: (id: string) => void;
}) {
	return (
		<section
			aria-label="Invitations"
			className="flex flex-col gap-2 rounded-lg border border-line p-4"
		>
			<h2 className="text-sm font-semibold text-fg">Send invitations from</h2>
			<p className="text-sm text-fg-muted">
				Guests receive invitations, updates and cancellations from this account
				unless an event names another.
			</p>
			<SenderPicker accounts={accounts} value={value} onChange={onChange} />
		</section>
	);
}
