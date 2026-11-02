import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarList } from "./calendar-list.js";
import { CalendarSidePane, NewEventSquare } from "./calendar-side-pane.js";
import { MiniMonth } from "./mini-month.js";

const meta = {
	title: "Design System/Calendar/Calendar side pane",
	tags: ["proposed"],
	component: CalendarSidePane,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CalendarSidePane>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
	args: {
		id: "side-pane",
		onNewEvent: () => {},
		month: (
			<MiniMonth
				month="2026-11-02"
				today="2026-11-02"
				rangeStart="2026-11-02"
				rangeEnd="2026-11-08"
				onPickDay={() => {}}
				onShowMonth={() => {}}
			/>
		),
		calendars: (
			<CalendarList
				calendars={[
					{
						id: "c1",
						accountId: "a1",
						accountLabel: "Work",
						name: "Northwind",
						color: "cal-1",
					},
					{
						id: "c2",
						accountId: "a2",
						accountLabel: "Personal",
						name: "Home",
						color: "cal-3",
					},
				]}
				visible={new Set(["c1", "c2"])}
				onToggle={() => {}}
			/>
		),
	},
};

export const Collapsed: Story = {
	args: Open.args,
	render: () => <NewEventSquare onNewEvent={() => {}} />,
};
