import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarTaskPopupCard } from "./calendar-task-popup.js";

const meta = {
	title: "Design System/Calendar/Task popup",
	component: CalendarTaskPopupCard,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl">
				<Story />
			</div>
		),
	],
	args: {
		headingId: "task-title",
		fields: {
			title: "Send the report",
			dueDate: "2026-11-05",
			dueTime: "",
			description: "The numbers for the quarter.",
		},
		dueText: "Due Thursday 5 November",
		listName: "Tasks",
		completed: false,
		onToggle: () => {},
		onSave: () => {},
		onDelete: () => {},
		onClose: () => {},
	},
} satisfies Meta<typeof CalendarTaskPopupCard>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Task: Story = {};

export const Done: Story = { args: { completed: true } };

export const SaveFailed: Story = {
	args: {
		failure: {
			text: "Couldn't save the task: the server didn't answer.",
			reportHref: "#",
			onRetry: () => {},
		},
	},
};
