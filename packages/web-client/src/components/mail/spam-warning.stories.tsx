import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailboxIdFor, PERSONAL } from "../../mocks/story-frame/mail-world";
import { PARCEL_ROW, spamWorld } from "../../mocks/story-frame/spam-world";

const INBOX = mailboxIdFor(PERSONAL, "Inbox");
const JUNK = mailboxIdFor(PERSONAL, "Junk");

/**
 * The spam verdict in the mail views: the warning banner over the reading
 * pane, the Spam check section in the rail, and the row marker in the lists.
 */
const meta = {
	title: "Playground/Shipped/Mail/Reading/Spam warning",
	component: AppStory,
	args: {
		url: `/mail/${INBOX}/${PARCEL_ROW.threadId}/${PARCEL_ROW.messageId}`,
	},
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(spamWorld()) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Suspected phishing: the danger banner leads the message, with its reason. */
export const WarnPhishing: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText(
				"Remit suspects this message impersonates someone",
			),
		).toBeVisible();
		await expect(
			canvas.getByText("It was signed by a different domain than its sender."),
		).toBeVisible();
	},
};

/** The row says Phishing, suspected, in place of the old shield. */
export const RowMarker: Story = {
	args: { url: `/mail/${INBOX}` },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Phishing, suspected"),
		).toBeInTheDocument();
	},
};

/** In Spam the message carries no banner: the folder and chip already say it. */
export const MovedToSpam: Story = {
	args: { url: `/mail/${JUNK}` },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(await canvas.findByText("You have won a holiday"));
		await expect(canvas.queryByText("Remit suspects this is spam")).toBeNull();
	},
};
