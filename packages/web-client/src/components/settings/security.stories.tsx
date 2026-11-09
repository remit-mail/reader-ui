import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import { signedInAs } from "../../mocks/story-frame/session";

const meta = {
	title: "Playground/Shipped/Settings/Security/Overview",
	component: AppStory,
	args: {
		url: "/settings/security",
		authProvider: signedInAs(
			"alice@example.com",
			"https://login.example.com/security",
		),
	},
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(mailWorld()) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Security: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole("link", {
				name: "Manage two-factor authentication and passkeys",
			}),
		).toHaveAttribute("href", "https://login.example.com/security");
	},
};
