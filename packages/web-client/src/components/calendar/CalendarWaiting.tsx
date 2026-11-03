import {
	CalendarFailureNote,
	CalendarSuggestionList,
	type CalendarSuggestionIntel,
	EventSuggestionCard,
} from "@remit/ui";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/**
 * What the mail is still asking about time, beside the calendar it would land
 * on. Every reading at once, one under the other, each with its own Add and
 * Dismiss, beside the week it would land on.
 *
 * Presentational. The readings, the answer on its way and the refusal all come
 * in from the host, which reads them off the server.
 */
export interface CalendarWaitingProps {
	suggestions: CalendarSuggestionIntel[];
	/** An answer to one of the readings is on its way. */
	busy: boolean;
	/** Why the last answer did not land. Empty when it did. */
	failure: string;
	/** A prefilled issue report for the failure above. */
	reportHref?: string;
	/** Why nothing can be added yet, with the way past it; holds Add. */
	addBlocked?: ReactNode;
	onAdd: (suggestionId: string) => void;
	onChangeFirst?: (suggestionId: string) => void;
	onDismiss: (suggestionId: string) => void;
}

export function CalendarWaiting({
	suggestions,
	busy,
	failure,
	reportHref,
	addBlocked,
	onAdd,
	onChangeFirst,
	onDismiss,
}: CalendarWaitingProps) {
	return (
		<aside
			aria-label="Waiting for you"
			className="hidden w-72 shrink-0 flex-col gap-2 overflow-y-auto border-r border-line bg-surface-sunken py-3 lg:flex"
		>
			<h3 className="flex items-center gap-1.5 px-row-inset text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
				<Sparkles className="size-3" aria-hidden />
				Waiting for you
			</h3>
			{failure !== "" && (
				<CalendarFailureNote
					text={failure}
					reportHref={reportHref}
					className="mx-row-inset"
				/>
			)}
			{addBlocked !== undefined && (
				<div className="mx-row-inset rounded-md border border-warning/40 bg-warning-soft p-2 text-xs text-fg">
					{addBlocked}
				</div>
			)}
			<CalendarSuggestionList
				className="px-row-inset"
				items={suggestions.map(({ suggestion, whenText }) => ({
					id: suggestion.id,
					card: (
						<EventSuggestionCard
							suggestion={suggestion}
							whenText={whenText}
							onAdd={() => onAdd(suggestion.id)}
							onReview={onChangeFirst && (() => onChangeFirst(suggestion.id))}
							onDismiss={() => onDismiss(suggestion.id)}
							addLabel="Add to calendar"
							busy={busy}
							addBlocked={addBlocked !== undefined}
						/>
					),
				}))}
			/>
			<p className="px-row-inset text-2xs text-fg-subtle">
				None of this is on your calendar until you add it. Adding sends the
				organiser nothing.
			</p>
		</aside>
	);
}
