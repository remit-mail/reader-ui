import { type Ref, useState } from "react";
import { CalendarDays, CheckSquare, Square, Trash2, X } from "../icons.js";
import { cn } from "../lib/cn.js";
import {
	type CalendarFailure,
	CalendarFailureBlock,
} from "./calendar-event-popup.js";

const iconButton =
	"flex size-9 items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface-sunken hover:text-fg focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

const field =
	"h-9 w-full rounded-md border border-line bg-surface-sunken px-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

/** A task's editable fields, in the form the popup edits them. */
export interface CalendarTaskFields {
	title: string;
	/** `YYYY-MM-DD`. */
	dueDate: string;
	/** `HH:MM`, empty for a task due on a day. */
	dueTime: string;
	description: string;
}

export interface CalendarTaskPopupCardProps {
	headingId: string;
	headingRef?: Ref<HTMLHeadingElement>;
	fields: CalendarTaskFields;
	/** "Due Thursday 5 November". */
	dueText: string;
	listName: string;
	completed: boolean;
	onToggle: () => void;
	onSave: (fields: CalendarTaskFields) => void;
	onDelete: () => void;
	onClose: () => void;
	busy?: boolean;
	failure?: CalendarFailure;
}

/** A task's popup: title, due date, list and description, with Mark done, Edit and Delete. */
export function CalendarTaskPopupCard({
	headingId,
	headingRef,
	fields,
	dueText,
	listName,
	completed,
	onToggle,
	onSave,
	onDelete,
	onClose,
	busy = false,
	failure,
}: CalendarTaskPopupCardProps) {
	const [editing, setEditing] = useState<CalendarTaskFields | null>(null);
	return (
		<div className="flex flex-col gap-3 p-3">
			<div className="flex justify-end gap-1">
				{editing === null && (
					<button
						type="button"
						onClick={() => setEditing(fields)}
						className="rounded-md px-3 text-sm font-medium text-accent hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-ring"
					>
						Edit
					</button>
				)}
				<button
					type="button"
					aria-label="Delete"
					onClick={onDelete}
					disabled={busy}
					className={iconButton}
				>
					<Trash2 className="size-4" />
				</button>
				<button
					type="button"
					aria-label="Close"
					onClick={onClose}
					className={iconButton}
				>
					<X className="size-4" />
				</button>
			</div>
			{editing === null ? (
				<div className="flex flex-col gap-2 px-2">
					<h2
						id={headingId}
						ref={headingRef}
						tabIndex={-1}
						className={cn(
							"text-xl font-normal break-words text-fg outline-none",
							completed && "text-fg-muted line-through",
						)}
					>
						{fields.title === "" ? "(No title)" : fields.title}
					</h2>
					<p className="text-sm text-fg-muted">{dueText}</p>
					<p className="flex items-center gap-2 text-sm">
						<CalendarDays className="size-4 text-fg-subtle" aria-label="List" />
						{listName}
					</p>
					{fields.description !== "" && (
						<p className="text-sm whitespace-pre-wrap break-words">
							{fields.description}
						</p>
					)}
				</div>
			) : (
				<form
					className="flex flex-col gap-2 px-2"
					onSubmit={(event) => {
						event.preventDefault();
						onSave(editing);
						setEditing(null);
					}}
				>
					<h2 id={headingId} className="sr-only">
						Edit task
					</h2>
					<input
						aria-label="Title"
						value={editing.title}
						onChange={(event) =>
							setEditing({ ...editing, title: event.target.value })
						}
						className={field}
					/>
					<div className="flex gap-2">
						<input
							type="date"
							aria-label="Due date"
							value={editing.dueDate}
							onChange={(event) =>
								event.target.value !== "" &&
								setEditing({ ...editing, dueDate: event.target.value })
							}
							className={field}
						/>
						<input
							type="time"
							aria-label="Due time"
							value={editing.dueTime}
							onChange={(event) =>
								setEditing({ ...editing, dueTime: event.target.value })
							}
							className={field}
						/>
					</div>
					<textarea
						aria-label="Description"
						rows={3}
						value={editing.description}
						onChange={(event) =>
							setEditing({ ...editing, description: event.target.value })
						}
						className="w-full rounded-md border border-line bg-surface-sunken px-2 py-1 text-sm"
					/>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={() => setEditing(null)}
							className="h-9 rounded-md border border-line px-3 text-sm font-medium"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={busy}
							className="h-9 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg disabled:opacity-50"
						>
							Save
						</button>
					</div>
				</form>
			)}
			{failure && <CalendarFailureBlock failure={failure} />}
			{editing === null && (
				<div className="flex justify-end px-2">
					<button
						type="button"
						onClick={onToggle}
						disabled={busy}
						className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
					>
						{completed ? (
							<Square className="size-4" aria-hidden="true" />
						) : (
							<CheckSquare className="size-4" aria-hidden="true" />
						)}
						{completed ? "Mark not done" : "Mark done"}
					</button>
				</div>
			)}
		</div>
	);
}
