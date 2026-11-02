import { GripHorizontal, X } from "lucide-react";
import type { PointerEvent, Ref } from "react";
import { cn } from "../lib/cn.js";
import {
	type CalendarFailure,
	CalendarFailureBlock,
} from "./calendar-event-popup.js";
import type { CalendarDescriptor, CalendarSlotPick } from "./calendar-types.js";

export interface QuickCreateFields {
	title: string;
	range: CalendarSlotPick;
	location: string;
	calendarId: string;
}

export interface CalendarQuickCreateCardProps {
	headingId: string;
	fields: QuickCreateFields;
	/** Only the calendars that accept writes. */
	calendars: readonly CalendarDescriptor[];
	onChange: (fields: QuickCreateFields) => void;
	onSave: () => void;
	onMoreOptions: () => void;
	onClose: () => void;
	saving?: boolean;
	/** Why the draft cannot be saved yet, said in the form. */
	problem?: string;
	failure?: CalendarFailure;
	failureRef?: Ref<HTMLDivElement>;
	titleRef?: Ref<HTMLInputElement>;
	/** Where the calendar settings live, for when no calendar accepts writes. */
	settingsHref: string;
	/** The header drag, from the popover around the card. */
	dragHandle?: { onPointerDown: (event: PointerEvent<HTMLElement>) => void };
	/** A bottom sheet on a phone: thumb-sized controls, no drag header. */
	touch?: boolean;
}

const field =
	"h-9 rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:border-line-strong focus-visible:ring-2 focus-visible:ring-ring/30";

const withRange = (
	fields: QuickCreateFields,
	patch: Partial<CalendarSlotPick>,
): QuickCreateFields => {
	const range = { ...fields.range, ...patch };
	if (patch.date !== undefined && !range.allDay) range.endDate = patch.date;
	if (patch.date !== undefined && range.allDay && range.endDate < patch.date)
		range.endDate = patch.date;
	return { ...fields, range };
};

/** Google Calendar's small create popup: title, when, where, which calendar. */
export function CalendarQuickCreateCard({
	headingId,
	fields,
	calendars,
	onChange,
	onSave,
	onMoreOptions,
	onClose,
	saving = false,
	problem = "",
	failure,
	failureRef,
	titleRef,
	settingsHref,
	dragHandle,
	touch = false,
}: CalendarQuickCreateCardProps) {
	const noWritable = calendars.length === 0;
	const control = cn(field, touch && "h-11");
	return (
		<form
			className="relative flex flex-col"
			onSubmit={(event) => {
				event.preventDefault();
				if (!noWritable && !saving) onSave();
			}}
		>
			<div
				onPointerDown={dragHandle?.onPointerDown}
				className={cn(
					"flex items-center justify-between rounded-t-xl bg-surface-sunken px-2 py-1",
					dragHandle && "cursor-grab",
				)}
			>
				<GripHorizontal className="size-4 text-fg-subtle" aria-hidden="true" />
				<h2 id={headingId} className="sr-only">
					New event
				</h2>
			</div>
			<div className="flex flex-col gap-3 p-4">
				<input
					ref={titleRef}
					aria-label="Title"
					placeholder="Add title"
					value={fields.title}
					onChange={(event) =>
						onChange({ ...fields, title: event.target.value })
					}
					className={cn(
						"border-b-2 border-line bg-transparent pb-1 text-xl text-fg outline-none placeholder:text-fg-subtle focus:border-accent",
					)}
				/>
				<div className="flex flex-wrap items-center gap-2 text-sm">
					<input
						type="date"
						aria-label="Date"
						value={fields.range.date}
						onChange={(event) =>
							event.target.value !== "" &&
							onChange(withRange(fields, { date: event.target.value }))
						}
						className={control}
					/>
					{fields.range.allDay ? (
						<span className="text-fg-muted">All day</span>
					) : (
						<>
							<input
								type="time"
								aria-label="Start time"
								step={900}
								value={fields.range.startTime}
								onChange={(event) =>
									event.target.value !== "" &&
									onChange(withRange(fields, { startTime: event.target.value }))
								}
								className={control}
							/>
							<span aria-hidden="true">–</span>
							<input
								type="time"
								aria-label="End time"
								step={900}
								value={fields.range.endTime}
								onChange={(event) =>
									event.target.value !== "" &&
									onChange(withRange(fields, { endTime: event.target.value }))
								}
								className={control}
							/>
						</>
					)}
				</div>
				<input
					aria-label="Location"
					placeholder="Add location"
					value={fields.location}
					onChange={(event) =>
						onChange({ ...fields, location: event.target.value })
					}
					className={control}
				/>
				{noWritable ? (
					<p role="status" tabIndex={-1} className="text-sm text-fg-muted">
						None of your calendars accepts new events.{" "}
						<a
							href={settingsHref}
							className="font-medium text-accent hover:underline"
						>
							Calendar settings
						</a>
					</p>
				) : (
					<select
						aria-label="Calendar"
						value={fields.calendarId}
						onChange={(event) =>
							onChange({ ...fields, calendarId: event.target.value })
						}
						className={control}
					>
						{calendars.map((calendar) => (
							<option key={calendar.id} value={calendar.id}>
								{calendar.name}
							</option>
						))}
					</select>
				)}
				{problem !== "" && (
					<p className="text-sm text-danger" role="status">
						{problem}
					</p>
				)}
				{failure && (
					<CalendarFailureBlock failure={failure} focusRef={failureRef} />
				)}
			</div>
			<div className="flex items-center justify-between px-4 pb-4">
				<button
					type="button"
					onClick={onMoreOptions}
					className={cn(
						"rounded-md px-3 text-sm font-medium text-accent outline-none hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-ring",
						touch ? "min-h-11" : "h-9",
					)}
				>
					More options
				</button>
				<button
					type="submit"
					disabled={noWritable || saving}
					className={cn(
						"rounded-md bg-accent px-5 text-sm font-medium text-accent-fg outline-none hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
						touch ? "min-h-11" : "h-9",
					)}
				>
					{saving ? "Saving…" : "Save"}
				</button>
			</div>
			<button
				type="button"
				aria-label="Close"
				onClick={onClose}
				className={cn(
					"absolute top-0 right-1 flex items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface hover:text-fg focus-visible:ring-2 focus-visible:ring-ring",
					touch ? "size-11" : "size-8",
				)}
			>
				<X className="size-4" />
			</button>
		</form>
	);
}
