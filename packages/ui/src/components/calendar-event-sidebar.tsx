import { X } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { cn } from "../lib/cn.js";
import {
	type CalendarFailure,
	CalendarFailureBlock,
} from "./calendar-event-popup.js";
import type { CalendarDescriptor, EventDraft } from "./calendar-types.js";
import {
	EventField,
	EventRepeatField,
	EventWhenField,
	endsBeforeStart,
} from "./event-editor.js";

export interface CalendarEventSidebarProps {
	heading: string;
	draft: EventDraft;
	onChange: (draft: EventDraft) => void;
	/** Only the calendars that accept writes. */
	calendars: readonly CalendarDescriptor[];
	/** A stored event stays in its calendar. */
	calendarEditable: boolean;
	repeatEditable: boolean;
	timeZone: string;
	timeZones: readonly string[];
	onTimeZone: (timeZone: string) => void;
	busy: boolean;
	onBusy: (busy: boolean) => void;
	onSave: () => void;
	onCancel: () => void;
	saving?: boolean;
	/** Why the draft cannot be saved yet. */
	problem?: string;
	failure?: CalendarFailure;
	failureRef?: Ref<HTMLDivElement>;
	titleRef?: Ref<HTMLInputElement>;
	/** A phone shows the editor over the whole screen with thumb-sized controls. */
	touch?: boolean;
	/** The scope question or the discard confirm, over the form. */
	children?: ReactNode;
}

const control =
	"h-9 w-full rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:border-line-strong focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60";

/** The full editor beside the grid, after Google Calendar's event page. */
export function CalendarEventSidebar({
	heading,
	draft,
	onChange,
	calendars,
	calendarEditable,
	repeatEditable,
	timeZone,
	timeZones,
	onTimeZone,
	busy,
	onBusy,
	onSave,
	onCancel,
	saving = false,
	problem = "",
	failure,
	failureRef,
	titleRef,
	touch = false,
	children,
}: CalendarEventSidebarProps) {
	const field = cn(control, touch && "h-11");
	const backwards = endsBeforeStart(draft);
	return (
		<form
			aria-label={heading}
			data-event-sidebar=""
			className="flex h-full min-h-0 flex-col bg-surface"
			onSubmit={(event) => {
				event.preventDefault();
				if (!saving && !backwards) onSave();
			}}
		>
			<div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2">
				<h2 className="text-base font-medium text-fg">{heading}</h2>
				<button
					type="button"
					aria-label="Close"
					onClick={onCancel}
					className={cn(
						"flex items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring",
						touch ? "size-11" : "size-8",
					)}
				>
					<X className="size-4" />
				</button>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
				<input
					ref={titleRef}
					aria-label="Title"
					placeholder="Add title"
					value={draft.title}
					onChange={(event) =>
						onChange({ ...draft, title: event.target.value })
					}
					className="border-b-2 border-line bg-transparent pb-1 text-xl text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
				/>
				<EventWhenField draft={draft} onChange={onChange} touch={touch} />
				<EventField label="Time zone">
					<select
						aria-label="Time zone"
						value={timeZone}
						onChange={(event) => onTimeZone(event.target.value)}
						className={field}
					>
						{timeZones.map((zone) => (
							<option key={zone} value={zone}>
								{zone}
							</option>
						))}
					</select>
				</EventField>
				<EventField label="Repeat">
					<EventRepeatField
						draft={draft}
						onChange={onChange}
						touch={touch}
						repeatEditable={repeatEditable}
					/>
				</EventField>
				<EventField label="Calendar">
					<select
						aria-label="Calendar"
						value={draft.calendarId}
						disabled={!calendarEditable}
						onChange={(event) =>
							onChange({ ...draft, calendarId: event.target.value })
						}
						className={field}
					>
						{calendars.map((calendar) => (
							<option key={calendar.id} value={calendar.id}>
								{calendar.name}
							</option>
						))}
					</select>
				</EventField>
				<EventField label="Location">
					<input
						aria-label="Location"
						placeholder="Add location"
						value={draft.location}
						onChange={(event) =>
							onChange({ ...draft, location: event.target.value })
						}
						className={field}
					/>
				</EventField>
				<EventField label="Show as">
					<select
						aria-label="Show as"
						value={busy ? "busy" : "free"}
						onChange={(event) => onBusy(event.target.value === "busy")}
						className={field}
					>
						<option value="busy">Busy</option>
						<option value="free">Free</option>
					</select>
				</EventField>
				<EventField label="Description">
					<textarea
						aria-label="Description"
						placeholder="Add description"
						rows={5}
						value={draft.notes}
						onChange={(event) =>
							onChange({ ...draft, notes: event.target.value })
						}
						className="w-full rounded-md border border-line bg-surface-sunken px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
					/>
				</EventField>
				{children}
			</div>
			<div className="flex shrink-0 flex-col gap-2 border-t border-line px-4 py-3">
				{problem !== "" && (
					<p role="status" className="text-sm text-danger">
						{problem}
					</p>
				)}
				{failure && (
					<CalendarFailureBlock failure={failure} focusRef={failureRef} />
				)}
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className={cn(
							"rounded-md border border-line px-4 text-sm font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring",
							touch ? "min-h-11" : "h-9",
						)}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={saving || backwards}
						className={cn(
							"rounded-md bg-accent px-5 text-sm font-medium text-accent-fg hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
							touch ? "min-h-11" : "h-9",
						)}
					>
						{saving ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</form>
	);
}
