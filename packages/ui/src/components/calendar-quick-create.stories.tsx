import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarQuickCreateCard } from "./calendar-quick-create.js";
import { CalendarSheet } from "./calendar-sheet.js";

const meta = {
	title: "Design System/Calendar/Quick-create",
	tags: ["proposed"],
	component: CalendarQuickCreateCard,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl">
				<Story />
			</div>
		),
	],
	args: {
		headingId: "quick-create",
		fields: {
			title: "Design review",
			range: {
				date: "2026-11-05",
				endDate: "2026-11-05",
				startTime: "14:00",
				endTime: "15:30",
				allDay: false,
			},
			location: "",
			calendarId: "work",
		},
		calendars: [
			{
				id: "work",
				accountId: "a",
				accountLabel: "Work",
				name: "Work",
				color: "cal-1",
			},
			{
				id: "home",
				accountId: "a",
				accountLabel: "Work",
				name: "Personal",
				color: "cal-3",
			},
		],
		settingsHref: "/settings/calendars",
		onChange: () => {},
		onSave: () => {},
		onMoreOptions: () => {},
		onClose: () => {},
	},
} satisfies Meta<typeof CalendarQuickCreateCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SaveFailed: Story = {
	args: {
		failure: {
			text: "Couldn't save this event: the server didn't answer.",
			reportHref: "#",
			onRetry: () => {},
		},
	},
};

export const NoWritableCalendar: Story = { args: { calendars: [] } };

export const PhoneSheet: Story = {
	args: { touch: true },
	globals: { viewport: { value: "mobile" } },
	decorators: [],
	render: (args) => (
		<CalendarSheet labelledBy="quick-create" onDismiss={() => {}}>
			<CalendarQuickCreateCard {...args} />
		</CalendarSheet>
	),
};
