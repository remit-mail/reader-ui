import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	CalendarEventGone,
	CalendarEventPopupCard,
} from "./calendar-event-popup.js";

const meta = {
	title: "Design System/Calendar/Event popup",
	component: CalendarEventPopupCard,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl">
				<Story />
			</div>
		),
	],
	args: {
		headingId: "event-title",
		title: "Oktoberfest",
		color: "cal-3",
		when: "Wednesday, 4 November · 18:00 – 22:00",
		location: "Theresienwiese, Munich",
		calendarName: "Personal",
		availability: "Busy",
		onEdit: () => {},
		onDelete: () => {},
		onClose: () => {},
	},
} satisfies Meta<typeof CalendarEventPopupCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Event: Story = {};

export const DeleteFailed: Story = {
	args: {
		failure: {
			text: "Couldn't delete this event: the server didn't answer.",
			reportHref: "#",
			onRetry: () => {},
		},
	},
};

export const Gone: Story = {
	render: () => <CalendarEventGone headingId="gone" onClose={() => {}} />,
};
