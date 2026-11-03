import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn.js";
import { miniMonthWeeks, shiftMonth } from "../lib/mini-month.js";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const fullDate = (date: string): string =>
	new Intl.DateTimeFormat(undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00Z`));

const monthTitle = (date: string): string =>
	new Intl.DateTimeFormat(undefined, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date.slice(0, 7)}-01T00:00:00Z`));

export interface MiniMonthProps {
	/** Any date in the month on show. */
	month: string;
	today: string;
	/** The range on the grid, inclusive; empty for none. */
	rangeStart?: string;
	rangeEnd?: string;
	onPickDay: (date: string) => void;
	/** Moves the mini month; absent hides its arrows. */
	onShowMonth?: (month: string) => void;
	/** Events per day: a dot marks each day with one, and the day's name counts them. */
	counts?: Readonly<Record<string, number>>;
	className?: string;
}

/**
 * A small month with ISO week numbers down the side. Today is filled and the
 * range on the grid is shaded, as in Google Calendar's side pane.
 */
export function MiniMonth({
	month,
	today,
	rangeStart = "",
	rangeEnd = "",
	onPickDay,
	onShowMonth,
	counts,
	className,
}: MiniMonthProps) {
	const weeks = miniMonthWeeks({ month, today, rangeStart, rangeEnd });
	const title = monthTitle(month);
	return (
		<section aria-label={title} className={cn("select-none", className)}>
			<div className="flex items-center justify-between px-1 pb-1">
				<h2 className="text-sm font-medium text-fg">{title}</h2>
				{onShowMonth && (
					<div className="flex">
						<button
							type="button"
							aria-label="Previous month"
							onClick={() => onShowMonth(shiftMonth(month, -1))}
							className="flex size-7 items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
						>
							<ChevronLeft className="size-4" />
						</button>
						<button
							type="button"
							aria-label="Next month"
							onClick={() => onShowMonth(shiftMonth(month, 1))}
							className="flex size-7 items-center justify-center rounded-full text-fg-muted outline-none hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
						>
							<ChevronRight className="size-4" />
						</button>
					</div>
				)}
			</div>
			<table className="w-full border-collapse text-center text-2xs">
				<thead>
					<tr className="text-fg-subtle">
						<th scope="col" className="w-6 font-normal">
							<span className="sr-only">Week</span>
						</th>
						{WEEKDAYS.map((weekday, index) => (
							<th
								// biome-ignore lint/suspicious/noArrayIndexKey: weekday initials repeat
								key={index}
								scope="col"
								className="h-6 font-normal"
							>
								{weekday}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{weeks.map((week) => (
						<tr key={week.days[0].date}>
							<th
								scope="row"
								className="font-normal text-fg-subtle tabular-nums"
							>
								{week.weekNumber}
							</th>
							{week.days.map((day) => {
								const count = counts?.[day.date] ?? 0;
								const label =
									counts === undefined
										? fullDate(day.date)
										: `${fullDate(day.date)}, ${count === 1 ? "1 event" : `${count} events`}`;
								return (
									<td
										key={day.date}
										className={cn("p-0", day.inRange && "bg-accent-soft")}
									>
										<button
											type="button"
											aria-label={label}
											aria-current={day.isToday ? "date" : undefined}
											data-date={day.date}
											onClick={() => onPickDay(day.date)}
											className={cn(
												"relative mx-auto flex size-7 items-center justify-center rounded-full tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
												day.isToday
													? "bg-accent font-semibold text-accent-fg"
													: "hover:bg-surface-sunken",
												!day.isToday && !day.inMonth && "text-fg-subtle",
											)}
										>
											{day.day}
											{count > 0 && !day.isToday && (
												<span
													aria-hidden="true"
													className="absolute bottom-0.5 size-1 rounded-full bg-accent"
												/>
											)}
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
