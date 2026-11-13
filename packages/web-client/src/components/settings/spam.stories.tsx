import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import { spamWorld } from "../../mocks/story-frame/spam-world";

const meta = {
	title: "Playground/Shipped/Settings/Spam",
	component: AppStory,
	args: { url: "/settings/spam" },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(spamWorld()) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Thirty days of verdicts and the settings in effect. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Reached Spam 7 · Warned 5"),
		).toBeVisible();
		await expect(await canvas.findByText("0.85")).toBeVisible();
	},
};

/** A per-label change saves at once and says so. */
export const WarnOnly: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const group = await canvas.findByRole("radiogroup", {
			name: "Spam label",
		});
		await userEvent.click(
			within(group).getByRole("radio", { name: "Warn only" }),
		);
		await expect(await canvas.findByText("Saved")).toBeVisible();
	},
};

/** Nothing checked yet: no chart of zeros, no empty table. */
export const NothingChecked: Story = {
	parameters: { msw: { handlers: mailHandlers(mailWorld()) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Remit has not checked any mail yet"),
		).toBeVisible();
		await expect(await canvas.findByText("Nothing flagged yet.")).toBeVisible();
	},
};

/** The counts fail on their own; the other sections keep working. */
export const LoadError: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/classification-stats", () =>
					HttpResponse.json(
						{ code: "invalid_request", message: "since is out of range" },
						{ status: 400 },
					),
				),
				...mailHandlers(spamWorld()),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Couldn't count the last 30 days"),
		).toBeVisible();
		await expect(await canvas.findByText("0.85")).toBeVisible();
	},
};

/** An expired session raises the signed-out notice over skeletons. */
export const SignedOut: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/classification-stats", () =>
					HttpResponse.json(
						{ code: "unauthorized", message: "Unauthorized" },
						{ status: 401 },
					),
				),
				...mailHandlers(spamWorld()),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole("alertdialog", { name: "You're signed out" }),
		).toBeVisible();
		await expect(
			canvas.queryByText("Remit has not checked any mail yet"),
		).toBeNull();
	},
};
