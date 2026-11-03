import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn.js";

export interface CalendarSuggestionListItem {
	id: string;
	card: ReactNode;
}

export interface CalendarSuggestionListProps {
	items: readonly CalendarSuggestionListItem[];
	className?: string;
}

/** Readings waiting on a decision, one under the other, each with its own buttons. */
export function CalendarSuggestionList({
	items,
	className,
}: CalendarSuggestionListProps) {
	if (items.length === 0)
		return (
			<div
				className={cn(
					"flex flex-col items-center gap-2 p-6 text-center",
					className,
				)}
			>
				<Sparkles className="size-6 text-fg-subtle" aria-hidden />
				<p className="text-sm text-fg-muted">
					Nothing in your mail is waiting on a decision about time.
				</p>
			</div>
		);
	return (
		<ul
			aria-label="Suggested events"
			className={cn("flex min-h-0 flex-col gap-3 overflow-y-auto", className)}
		>
			{items.map((item) => (
				<li key={item.id}>{item.card}</li>
			))}
		</ul>
	);
}
