import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { CalendarScreenToolbar } from "./calendar-screen-toolbar.js";
import type { CalendarViewId } from "./calendar-types.js";

function Toolbar({ touch }: { touch: boolean }) {
	const [view, setView] = useState<CalendarViewId>("week");
	const [open, setOpen] = useState(true);
	return (
		<CalendarScreenToolbar
			view={view}
			title="November 2026"
			weekNumber={view === "week" ? 45 : undefined}
			onChangeView={setView}
			onPrev={() => {}}
			onNext={() => {}}
			onToday={() => {}}
			sidePane={{ open, controls: "side-pane", onToggle: () => setOpen(!open) }}
			touch={touch}
		/>
	);
}

const meta = {
	title: "Design System/Calendar/Calendar screen toolbar",
	tags: ["proposed"],
	component: Toolbar,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Toolbar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
	args: { touch: false },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText("Week 45")).toBeVisible();
		const hamburger = canvas.getByRole("button", { name: "Side pane" });
		await userEvent.click(hamburger);
		await expect(hamburger).toHaveAttribute("aria-expanded", "false");
		await userEvent.selectOptions(canvas.getByLabelText("View"), "month");
		await expect(canvas.queryByText("Week 45")).toBeNull();
	},
};

export const Touch: Story = {
	args: { touch: true },
	globals: { viewport: { value: "mobile" } },
};
