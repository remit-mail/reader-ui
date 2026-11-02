import { Plus } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { cn } from "../lib/cn.js";

export interface CalendarSidePaneProps {
	id: string;
	onNewEvent: () => void;
	newEventRef?: Ref<HTMLButtonElement>;
	/** The mini month. */
	month: ReactNode;
	/** The calendar list, or the failure that stands in for it. */
	calendars: ReactNode;
	className?: string;
}

/** Google Calendar's left pane: New event, the mini month and My calendars. */
export function CalendarSidePane({
	id,
	onNewEvent,
	newEventRef,
	month,
	calendars,
	className,
}: CalendarSidePaneProps) {
	return (
		<section
			id={id}
			aria-label="Calendar side pane"
			className={cn(
				"flex w-64 shrink-0 flex-col gap-4 overflow-y-auto bg-surface px-3 py-3",
				className,
			)}
		>
			<button
				ref={newEventRef}
				type="button"
				onClick={onNewEvent}
				className="flex h-12 w-fit items-center gap-3 rounded-2xl bg-surface-raised px-5 text-sm font-medium text-fg shadow-md outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Plus className="size-5 text-accent" aria-hidden="true" />
				New event
			</button>
			{month}
			<section aria-label="My calendars" className="flex flex-col gap-1">
				<h2 className="px-1 text-sm font-medium text-fg">My calendars</h2>
				{calendars}
			</section>
		</section>
	);
}

export interface NewEventSquareProps {
	onNewEvent: () => void;
	newEventRef?: Ref<HTMLButtonElement>;
	className?: string;
}

/** What New event shrinks to while the side pane is hidden. */
export function NewEventSquare({
	onNewEvent,
	newEventRef,
	className,
}: NewEventSquareProps) {
	return (
		<button
			ref={newEventRef}
			type="button"
			aria-label="New event"
			onClick={onNewEvent}
			className={cn(
				"flex size-12 items-center justify-center rounded-2xl bg-surface-raised text-accent shadow-md outline-none hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
		>
			<Plus className="size-6" aria-hidden="true" />
		</button>
	);
}
