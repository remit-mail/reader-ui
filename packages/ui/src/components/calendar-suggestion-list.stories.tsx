import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CalendarSuggestionList } from "./calendar-suggestion-list.js";
import type { EventSuggestion } from "./calendar-types.js";
import { EventSuggestionCard } from "./event-suggestion-card.js";

/**
 * Every reading at once, one under the other, scrolling when there are more
 * than fit. Each card keeps its own Add and Dismiss.
 */
const meta: Meta<typeof CalendarSuggestionList> = {
	title: "Design System/Calendar/Suggestion list",
	component: CalendarSuggestionList,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="flex h-[32rem] max-w-sm flex-col">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof CalendarSuggestionList>;

const flight: EventSuggestion = {
	id: "sug_flight",
	title: "KL1693 Amsterdam → Lisbon",
	start: "2026-06-19T18:40:00+02:00",
	end: "2026-06-19T20:25:00+02:00",
	allDay: false,
	location: "Schiphol, gate D-pier",
	threadId: "thr_klm",
	threadSubject: "Your booking is confirmed — KL1693 Amsterdam to Lisbon",
	sender: "KLM",
	senderAddress: "noreply@klm.example",
	confidence: 0.88,
	ambiguity:
		"The confirmation prints 20:25 for the arrival and never says whose clock.",
	suggestedCalendarId: "cal_travel",
	timeZone: "",
	zoneCertainty: "ambiguous",
	zoneOptions: [
		{
			timeZone: "Europe/Lisbon",
			label: "20:25 in Lisbon",
			note: "21:25 on your own clock.",
		},
		{
			timeZone: "Europe/Amsterdam",
			label: "20:25 in Amsterdam",
			note: "19:25 where the plane lands.",
		},
	],
};

const stated: EventSuggestion = {
	...flight,
	id: "sug_dinner",
	title: "Dinner with Rita",
	ambiguity: "",
	timeZone: "Europe/Amsterdam",
	zoneCertainty: "explicit",
	zoneOptions: undefined,
};

const queue: EventSuggestion[] = [
	flight,
	stated,
	{ ...stated, id: "sug_standup", title: "Team standup" },
	{ ...stated, id: "sug_review", title: "Design review" },
];

function List({ initial }: { initial: EventSuggestion[] }) {
	const [pending, setPending] = useState(initial);
	const [zones, setZones] = useState<Record<string, string>>({});
	const drop = (id: string) =>
		setPending((prev) => prev.filter((suggestion) => suggestion.id !== id));
	return (
		<CalendarSuggestionList
			items={pending.map((suggestion) => ({
				id: suggestion.id,
				card: (
					<EventSuggestionCard
						suggestion={suggestion}
						whenText="Friday 19 June · 18:40 – 20:25"
						zoneChoice={zones[suggestion.id] ?? ""}
						onZoneChoice={(timeZone) =>
							setZones((prev) => ({ ...prev, [suggestion.id]: timeZone }))
						}
						onAdd={() => drop(suggestion.id)}
						onReview={() => undefined}
						onDismiss={() => drop(suggestion.id)}
						onOpenThread={() => undefined}
					/>
				),
			}))}
		/>
	);
}

/** Several readings, one under the other; the list scrolls past the fold. */
export const Several: Story = {
	render: () => <List initial={queue} />,
};
