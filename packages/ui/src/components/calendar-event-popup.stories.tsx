import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	CalendarEventGone,
	CalendarEventPopupCard,
} from "./calendar-event-popup.js";
import {
	CalendarEventGuests,
	type CalendarGuestCounts,
	CalendarReplyRow,
} from "./calendar-guests.js";
import type { CalendarAttendee } from "./calendar-types.js";

const guests: CalendarAttendee[] = [
	{
		name: "Sender name",
		email: "sender@example.com",
		rsvp: "accepted",
		role: "organizer",
	},
	{
		name: "Guest one",
		email: "one@example.com",
		rsvp: "tentative",
		role: "attendee",
	},
	{ name: "", email: "two@example.com", rsvp: "noReply", role: "attendee" },
];

const counts: CalendarGuestCounts = {
	accepted: 1,
	declined: 0,
	tentative: 1,
	needsAction: 1,
};

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

export const WithGuests: Story = {
	args: {
		children: <CalendarEventGuests attendees={guests} counts={counts} />,
	},
};

export const Reply: Story = {
	args: {
		children: (
			<>
				<CalendarEventGuests attendees={guests} counts={counts} />
				<CalendarReplyRow current="tentative" onAnswer={() => {}} />
			</>
		),
	},
};

export const ReplyFailed: Story = {
	args: {
		children: (
			<>
				<CalendarEventGuests attendees={guests} counts={counts} />
				<CalendarReplyRow
					current="accepted"
					onAnswer={() => {}}
					failure={{
						text: "Couldn't send your reply: the server didn't answer.",
						reportHref: "#",
						onRetry: () => {},
					}}
				/>
			</>
		),
	},
};
