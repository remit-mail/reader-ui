import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { MiniMonth } from "./mini-month.js";

function Month({ counts }: { counts?: Record<string, number> }) {
	const [month, setMonth] = useState("2026-11-02");
	return (
		<MiniMonth
			month={month}
			today="2026-11-02"
			rangeStart="2026-11-02"
			rangeEnd="2026-11-08"
			onPickDay={() => {}}
			onShowMonth={counts ? undefined : setMonth}
			counts={counts}
		/>
	);
}

const meta = {
	title: "Design System/Calendar/Mini month",
	tags: ["proposed"],
	component: Month,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="w-60">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Month>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SidePane: Story = {
	play: async ({ canvasElement }) => {
		const today = within(canvasElement).getByRole("button", {
			name: "Monday, 2 November 2026",
		});
		await expect(today).toHaveAttribute("aria-current", "date");
	},
};

export const WithEventCounts: Story = {
	args: { counts: { "2026-11-04": 2, "2026-11-12": 1 } },
	play: async ({ canvasElement }) => {
		await expect(
			within(canvasElement).getByRole("button", {
				name: "Wednesday, 4 November 2026, 2 events",
			}),
		).toBeVisible();
	},
};
