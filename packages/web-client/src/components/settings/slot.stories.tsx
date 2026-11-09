import type { Meta, StoryObj } from "@storybook/react-vite";
import { Puzzle } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import type { SettingsSlot } from "../../settings-slots";

const sampleSlot: SettingsSlot = {
	id: "sample",
	label: "Sample",
	icon: <Puzzle className="size-4" />,
	Component: () => <p>Content the host renders in its own section.</p>,
	help: <p>Help the host writes for its section.</p>,
};

const meta = {
	title: "Playground/Shipped/Settings/Host section",
	component: AppStory,
	args: { url: "/settings/advanced", settingsSlots: [sampleSlot] },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(mailWorld()) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const HostSection: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Sample" }),
		);
		await expect(
			await canvas.findByText("Content the host renders in its own section."),
		).toBeVisible();
		await expect(
			canvas.getByText("Help the host writes for its section."),
		).toBeVisible();
	},
};
