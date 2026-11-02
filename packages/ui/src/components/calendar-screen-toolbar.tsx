import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn.js";
import type { CalendarViewId } from "./calendar-types.js";
import { Select } from "./select.js";

const VIEW_LABELS: Record<CalendarViewId, string> = {
	year: "Year",
	month: "Month",
	week: "Week",
	day: "Day",
	agenda: "Agenda",
};

const ALL_VIEWS: CalendarViewId[] = ["day", "week", "month", "year", "agenda"];

export interface CalendarScreenToolbarProps {
	view: CalendarViewId;
	/** The range on screen, already formatted: "November 2026". */
	title: string;
	/** The ISO week the range starts in, shown as a chip; absent hides it. */
	weekNumber?: number;
	/** The views the dropdown offers. */
	views?: CalendarViewId[];
	onChangeView: (view: CalendarViewId) => void;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	/** The side pane the hamburger shows and hides. */
	sidePane: { open: boolean; controls: string; onToggle: () => void };
	/** Controls the view owns, before the view dropdown. */
	trailing?: ReactNode;
	touch?: boolean;
	className?: string;
}

/**
 * The calendar's top row, after Google Calendar: the hamburger, Today, the
 * arrows, the month and year with the week number, and one view dropdown.
 */
export function CalendarScreenToolbar({
	view,
	title,
	weekNumber,
	views = ALL_VIEWS,
	onChangeView,
	onPrev,
	onNext,
	onToday,
	sidePane,
	trailing,
	touch = false,
	className,
}: CalendarScreenToolbarProps) {
	const iconButton = cn(
		"flex shrink-0 items-center justify-center rounded-full text-fg-muted outline-none transition-colors hover:bg-surface-sunken hover:text-fg focus-visible:ring-2 focus-visible:ring-ring",
		touch ? "size-11" : "size-9",
	);
	return (
		<div
			role="toolbar"
			aria-label="Calendar"
			data-calendar-toolbar=""
			className={cn(
				"flex shrink-0 items-center gap-1 border-b border-line bg-surface px-2",
				touch ? "h-14" : "h-14 gap-2",
				className,
			)}
		>
			<button
				type="button"
				aria-label="Side pane"
				aria-expanded={sidePane.open}
				aria-controls={sidePane.controls}
				onClick={sidePane.onToggle}
				className={iconButton}
			>
				<Menu className="size-5" />
			</button>
			<button
				type="button"
				onClick={onToday}
				className={cn(
					"shrink-0 rounded-full border border-line px-4 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring",
					touch ? "min-h-11" : "h-9",
				)}
			>
				Today
			</button>
			<button
				type="button"
				onClick={onPrev}
				aria-label={`Previous ${VIEW_LABELS[view].toLowerCase()}`}
				className={iconButton}
			>
				<ChevronLeft className="size-5" />
			</button>
			<button
				type="button"
				onClick={onNext}
				aria-label={`Next ${VIEW_LABELS[view].toLowerCase()}`}
				className={iconButton}
			>
				<ChevronRight className="size-5" />
			</button>
			<h1
				className={cn(
					"min-w-0 truncate font-normal text-fg",
					touch ? "text-base" : "text-xl",
				)}
			>
				{title}
			</h1>
			{weekNumber !== undefined && (
				<span className="shrink-0 rounded-md bg-surface-sunken px-2 py-0.5 text-xs font-medium text-fg-muted">
					Week {weekNumber}
				</span>
			)}
			<div className="min-w-0 flex-1" />
			{trailing}
			<Select
				aria-label="View"
				value={view}
				onChange={(event) => {
					const picked = views.find((option) => option === event.target.value);
					if (picked) onChangeView(picked);
				}}
				className={cn("w-28 shrink-0", touch && "h-11")}
			>
				{views.map((option) => (
					<option key={option} value={option}>
						{VIEW_LABELS[option]}
					</option>
				))}
			</Select>
		</div>
	);
}
