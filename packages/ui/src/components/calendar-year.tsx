import { cn } from "../lib/cn.js";
import { MiniMonth } from "./mini-month.js";

export interface CalendarYearProps {
	/** Any date in the year to draw. */
	date: string;
	today: string;
	/** Events per day; a dot marks each day that has one. */
	counts: Readonly<Record<string, number>>;
	onPickDay: (date: string) => void;
	className?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, index) =>
	String(index + 1).padStart(2, "0"),
);

/** Twelve small months with ISO week numbers, today filled and busy days dotted. */
export function CalendarYear({
	date,
	today,
	counts,
	onPickDay,
	className,
}: CalendarYearProps) {
	const year = date.slice(0, 4);
	return (
		<div
			data-calendar-year=""
			className={cn(
				"grid h-full content-start gap-x-8 gap-y-6 overflow-y-auto p-6 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]",
				className,
			)}
		>
			{MONTHS.map((month) => (
				<MiniMonth
					key={month}
					month={`${year}-${month}-01`}
					today={today}
					onPickDay={onPickDay}
					counts={counts}
				/>
			))}
		</div>
	);
}
