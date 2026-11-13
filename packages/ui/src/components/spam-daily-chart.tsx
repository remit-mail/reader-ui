import { cn } from "../lib/cn.js";

export interface SpamDay {
	date: string;
	moved: number;
	warned: number;
	markedNotSpam: number;
}

export interface SpamDailyChartProps {
	title: string;
	tone: "warning" | "danger";
	days: SpamDay[];
}

const TONES = {
	warning: { moved: "bg-warning", warned: "bg-warning/35" },
	danger: { moved: "bg-danger", warned: "bg-danger/35" },
};

export const spamDayDescription = (day: SpamDay): string =>
	[
		`${day.date}: ${day.moved} moved, ${day.warned} warned`,
		...(day.markedNotSpam > 0 ? [`${day.markedNotSpam} marked Not spam`] : []),
	].join(", ");

/**
 * One bar per day, moved stacked under warned, with a dot under each day the
 * reader marked mail Not spam. Each bar carries its own text alternative.
 */
export function SpamDailyChart({ title, tone, days }: SpamDailyChartProps) {
	const peak = Math.max(1, ...days.map((day) => day.moved + day.warned));
	const colours = TONES[tone];
	const first = days[0];
	const last = days[days.length - 1];

	return (
		<figure className="min-w-0">
			<figcaption className="text-xs font-semibold text-fg">{title}</figcaption>
			<ul className="mt-2 flex h-24 list-none items-end gap-px border-b border-line">
				{days.map((day) => (
					<li key={day.date} className="h-full min-w-0 flex-1">
						<span
							role="img"
							aria-label={spamDayDescription(day)}
							className="flex h-full flex-col justify-end"
						>
							<span
								className={cn("w-full rounded-t-sm", colours.warned)}
								style={{ height: `${(day.warned / peak) * 100}%` }}
							/>
							<span
								className={cn("w-full", colours.moved)}
								style={{ height: `${(day.moved / peak) * 100}%` }}
							/>
						</span>
					</li>
				))}
			</ul>
			<div aria-hidden="true" className="flex h-2 gap-px pt-1">
				{days.map((day) => (
					<span key={day.date} className="flex flex-1 justify-center">
						{day.markedNotSpam > 0 && (
							<span className="size-1 rounded-full bg-fg-muted" />
						)}
					</span>
				))}
			</div>
			{first && last && (
				<div
					aria-hidden="true"
					className="mt-1 flex justify-between text-2xs text-fg-subtle tabular-nums"
				>
					<span>{first.date}</span>
					<span>{last.date}</span>
				</div>
			)}
		</figure>
	);
}
