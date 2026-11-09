import type { Meta, StoryObj } from "@storybook/react-vite";
import { Puzzle } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import { signedInAs } from "../../mocks/story-frame/session";
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
	},
};

export const UnknownSection: Story = {
	args: { url: "/settings/missing" },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("This settings section doesn't exist."),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: "Back to settings" }),
		).toHaveAttribute("href", "/settings");
	},
};

export const AccountMenuListsHostSection: Story = {
	args: { url: "/mail/brief", authProvider: signedInAs("alice@example.com") },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Account" }),
		);
		const page = within(canvasElement.ownerDocument.body);
		await userEvent.click(
			await page.findByRole("menuitem", { name: "Sample" }),
		);
		await expect(
			await canvas.findByText("Content the host renders in its own section."),
		).toBeVisible();
	},
};

export const AccountMenuWithoutHostSections: Story = {
	args: {
		url: "/mail/brief",
		authProvider: signedInAs("alice@example.com"),
		settingsSlots: [],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Account" }),
		);
		const page = within(canvasElement.ownerDocument.body);
		await page.findByRole("menuitem", { name: "Sign out" });
		await expect(
			page.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Sign out"]);
	},
};
