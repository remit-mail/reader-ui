import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import {
	CalendarTimeGrid,
	type GridDraft,
	type GridGesture,
} from "./calendar-time-grid.js";
import type { CalendarEventData } from "./calendar-types.js";

const base: Omit<CalendarEventData, "id" | "title" | "start" | "end"> = {
	calendarId: "work",
	allDay: false,
	location: "",
	notes: "",
	attendees: [],
	myRsvp: "accepted",
	threadId: "",
	threadSubject: "",
	timeZone: "Europe/Amsterdam",
	zoneCertainty: "local",
	recurrenceRule: "",
	seriesId: "",
	seriesException: false,
	status: "confirmed",
};

const events: CalendarEventData[] = [
	{
		...base,
		id: "standup",
		title: "Standup",
		start: "2026-11-03T09:30:00+01:00",
		end: "2026-11-03T09:45:00+01:00",
	},
	{
		...base,
		id: "planning",
		title: "Planning",
		calendarId: "team",
		start: "2026-11-02T10:00:00+01:00",
		end: "2026-11-02T11:30:00+01:00",
	},
	{
		...base,
		id: "sync-a",
		title: "Sync A",
		start: "2026-11-04T13:00:00+01:00",
		end: "2026-11-04T14:00:00+01:00",
	},
	{
		...base,
		id: "sync-b",
		title: "Sync B",
		calendarId: "team",
		start: "2026-11-04T13:30:00+01:00",
		end: "2026-11-04T14:30:00+01:00",
	},
	{
		...base,
		id: "holiday",
		title: "Holiday",
		calendarId: "home",
		allDay: true,
		start: "2026-11-06T00:00:00+01:00",
		end: "2026-11-08T00:00:00+01:00",
	},
];

const week = [
	"2026-11-02",
	"2026-11-03",
	"2026-11-04",
	"2026-11-05",
	"2026-11-06",
	"2026-11-07",
	"2026-11-08",
];

function Grid({ initial }: { initial?: GridDraft }) {
	const [draft, setDraft] = useState<GridDraft | undefined>(initial);
	const take = (gesture: GridGesture) => {
		if (gesture.type === "drag-cancel") setDraft(undefined);
		else if (gesture.type !== "drag-end" || draft)
			setDraft({ range: gesture.range, title: "", tone: "selection" });
	};
	return (
		<div className="h-[640px]">
			<CalendarTimeGrid
				days={week}
				events={events}
				colorByCalendarId={{ work: "cal-1", team: "cal-5", home: "cal-3" }}
				density="comfortable"
				timeZone="Europe/Amsterdam"
				now="2026-11-04T11:20:00+01:00"
				draft={draft}
				onGesture={take}
				onSelectEvent={() => {}}
			/>
		</div>
	);
}

const meta = {
	title: "Design System/Calendar/Time grid",
	tags: ["proposed"],
	component: Grid,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Grid>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("button", { name: /^Planning/ }),
		).toBeVisible();
		await expect(canvas.getByRole("grid", { name: "Time grid" })).toBeVisible();
	},
};

export const Selection: Story = {
	args: {
		initial: {
			range: {
				date: "2026-11-05",
				endDate: "2026-11-05",
				startTime: "08:00",
				endTime: "09:45",
				allDay: false,
			},
			title: "",
			tone: "selection",
		},
	},
};

export const DraftWithHandles: Story = {
	args: {
		initial: {
			range: {
				date: "2026-11-05",
				endDate: "2026-11-05",
				startTime: "14:00",
				endTime: "15:30",
				allDay: false,
			},
			title: "Design review",
			tone: "draft",
			handles: true,
		},
	},
};

export const DraftNotSaved: Story = {
	args: {
		initial: {
			range: {
				date: "2026-11-05",
				endDate: "2026-11-05",
				startTime: "14:00",
				endTime: "15:30",
				allDay: false,
			},
			title: "Design review",
			tone: "draft",
			warning: true,
		},
	},
};
