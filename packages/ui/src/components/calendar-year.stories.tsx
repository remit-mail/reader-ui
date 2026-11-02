import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarYear } from "./calendar-year.js";

const meta = {
	title: "Design System/Calendar/Year",
	tags: ["proposed"],
	component: CalendarYear,
	parameters: { layout: "fullscreen" },
	args: {
		date: "2026-11-02",
		today: "2026-11-02",
		counts: { "2026-11-04": 2, "2026-03-12": 1, "2026-07-01": 4 },
		onPickDay: () => {},
	},
} satisfies Meta<typeof CalendarYear>;
export default meta;

export const Year: StoryObj<typeof meta> = {};
