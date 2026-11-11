import type { ReactNode, Ref } from "react";
import { CalendarDays, MapPin, Pencil, Trash, X } from "../icons.js";
import { calendarColorClasses } from "../lib/calendar-color.js";
import { cn } from "../lib/cn.js";
import type { CalendarColorId } from "./calendar-types.js";

export interface CalendarFailure {
	text: string;
	reportHref: string;
	onRetry: () => void;
	/** "Try again" unless the way forward is something else. */
	retryLabel?: string;
}

/** A failure stated where it happened, with Try again and a prefilled report. */
export function CalendarFailureBlock({
	failure,
	focusRef,
}: {
	failure: CalendarFailure;
	focusRef?: Ref<HTMLDivElement>;
}) {
	return (
		<div
			ref={focusRef}
			role="alert"
			tabIndex={-1}
			className="flex flex-col gap-2 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm outline-none"
		>
			<p className="text-danger">{failure.text}</p>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={failure.onRetry}
					className="rounded-md border border-line bg-surface px-3 py-1 text-sm font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
				>
					{failure.retryLabel ?? "Try again"}
				</button>
				<a
					href={failure.reportHref}
					target="_blank"
					rel="noreferrer"
					className="text-sm font-medium text-accent hover:underline"
				>
					Report an issue
				</a>
			</div>
		</div>
	);
}

const iconButton =
	"flex size-9 items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface-sunken hover:text-fg focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

export interface CalendarEventPopupCardProps {
	headingId: string;
	headingRef?: Ref<HTMLHeadingElement>;
	title: string;
	color: CalendarColorId;
	/** "Wednesday, 4 November · 18:00 – 22:00". */
	when: string;
	location: string;
	calendarName: string;
	/** "Busy" or "Free". */
	availability: string;
	/** Absent on a read-only calendar. */
	onEdit?: () => void;
	onDelete?: () => void;
	deleting?: boolean;
	onClose: () => void;
	failure?: CalendarFailure;
	failureRef?: Ref<HTMLDivElement>;
	/** Shown under the details: the recurrence scope question. */
	children?: ReactNode;
}

/** What the event popup says about one stored event. */
export function CalendarEventPopupCard({
	headingId,
	headingRef,
	title,
	color,
	when,
	location,
	calendarName,
	availability,
	onEdit,
	onDelete,
	deleting = false,
	onClose,
	failure,
	failureRef,
	children,
}: CalendarEventPopupCardProps) {
	const hue = calendarColorClasses(color);
	return (
		<div className="flex flex-col gap-3 p-3">
			<div className="flex justify-end gap-1">
				{onEdit && (
					<button
						type="button"
						aria-label="Edit"
						onClick={onEdit}
						className={iconButton}
					>
						<Pencil className="size-4" />
					</button>
				)}
				{onDelete && (
					<button
						type="button"
						aria-label="Delete"
						onClick={onDelete}
						disabled={deleting}
						className={iconButton}
					>
						<Trash className="size-4" />
					</button>
				)}
				<button
					type="button"
					aria-label="Close"
					onClick={onClose}
					className={iconButton}
				>
					<X className="size-4" />
				</button>
			</div>
			<div className="flex gap-3 px-2">
				<span
					className={cn("mt-1.5 size-3.5 shrink-0 rounded-sm", hue.solid)}
					aria-hidden="true"
				/>
				<div className="min-w-0">
					<h2
						id={headingId}
						ref={headingRef}
						tabIndex={-1}
						className="text-xl font-normal break-words text-fg outline-none"
					>
						{title === "" ? "(No title)" : title}
					</h2>
					<p className="mt-1 text-sm text-fg-muted">{when}</p>
				</div>
			</div>
			<dl className="flex flex-col gap-2 px-2 text-sm">
				{location !== "" && (
					<div className="flex gap-3">
						<dt>
							<MapPin className="size-4 text-fg-subtle" aria-label="Location" />
						</dt>
						<dd className="min-w-0 break-words">{location}</dd>
					</div>
				)}
				<div className="flex gap-3">
					<dt>
						<CalendarDays
							className="size-4 text-fg-subtle"
							aria-label="Calendar"
						/>
					</dt>
					<dd>
						{calendarName} · {availability}
					</dd>
				</div>
			</dl>
			{children}
			{failure && (
				<CalendarFailureBlock failure={failure} focusRef={failureRef} />
			)}
		</div>
	);
}

/** The popup for an event the address names that is no longer stored. */
export function CalendarEventGone({
	headingId,
	onClose,
	closeRef,
}: {
	headingId: string;
	onClose: () => void;
	closeRef?: Ref<HTMLButtonElement>;
}) {
	return (
		<div className="flex flex-col gap-3 p-4">
			<h2 id={headingId} className="text-base font-medium text-fg">
				This event was deleted or moved
			</h2>
			<button
				ref={closeRef}
				type="button"
				onClick={onClose}
				className="self-end rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
			>
				Close
			</button>
		</div>
	);
}
