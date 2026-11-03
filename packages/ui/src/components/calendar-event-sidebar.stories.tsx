import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CalendarEventSidebar } from "./calendar-event-sidebar.js";
import type { EventDraft } from "./calendar-types.js";

const draft: EventDraft = {
	title: "Design review",
	date: "2026-11-05",
	startTime: "14:00",
	endDate: "2026-11-05",
	endTime: "15:30",
	allDay: false,
	calendarId: "work",
	location: "Room 3",
	guests: "",
	notes: "",
	repeat: "",
};

function Sidebar({ conflict }: { conflict: boolean }) {
	const [value, setValue] = useState(draft);
	const [busy, setBusy] = useState(true);
	return (
		<div className="h-[720px] w-[26rem] border-l border-line">
			<CalendarEventSidebar
				heading="New event"
				draft={value}
				onChange={setValue}
				calendars={[
					{
						id: "work",
						accountId: "a",
						accountLabel: "Work",
						name: "Work",
						color: "cal-1",
					},
				]}
				calendarEditable
				repeatEditable
				timeZone="Europe/Amsterdam"
				timeZones={["Europe/Amsterdam", "Europe/London", "UTC"]}
				onTimeZone={() => {}}
				busy={busy}
				onBusy={setBusy}
				onSave={() => {}}
				onCancel={() => {}}
				failure={
					conflict
						? {
								text: "This calendar changed while you were writing. Close the form and try again.",
								reportHref: "#",
								onRetry: () => {},
							}
						: undefined
				}
			/>
		</div>
	);
}

const meta = {
	title: "Design System/Calendar/Event sidebar",
	component: Sidebar,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const NewEvent: Story = { args: { conflict: false } };
export const SaveConflict: Story = { args: { conflict: true } };
