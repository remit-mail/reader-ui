import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import {
	info,
	infoFolders,
	matthijs,
	matthijsFolders,
} from "../../test-support/special-folders";

const meta = {
	title: "Playground/Shipped/Settings/Special folders",
	component: AppStory,
	args: { url: "/settings/accounts" },
	parameters: { layout: "fullscreen" },
	beforeEach: () => {
		localStorage.removeItem(
			`remit.specialFoldersDismissed.${info.accountConfigId}.${info.accountId}`,
		);
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Unconfirmed: Story = {
	parameters: {
		msw: {
			handlers: mailHandlers(
				mailWorld({ accounts: [info], mailboxes: infoFolders }),
			),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole("button", { name: "Review folders" }),
		).toBeVisible();
	},
};

export const Choices: Story = {
	...Unconfirmed,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Review folders" }),
		);
		await expect(await canvas.findByLabelText("Folder for Trash")).toHaveValue(
			"trash",
		);
		await expect(
			canvas.getAllByRole("option", { name: "Prullenbak · 3 msgs" }),
		).toHaveLength(4);
		await expect(
			canvas.getByRole("button", { name: "Confirm folders" }),
		).toBeEnabled();
	},
};

export const Resolved: Story = {
	parameters: {
		msw: {
			handlers: mailHandlers(
				mailWorld({ accounts: [matthijs], mailboxes: matthijsFolders }),
			),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole("button", { name: "Manage" });
		await expect(
			canvas.queryByRole("button", { name: "Review folders" }),
		).toBeNull();
	},
};

export const Phone: Story = {
	...Choices,
	globals: { viewport: { value: "mobile", isRotated: false } },
};
