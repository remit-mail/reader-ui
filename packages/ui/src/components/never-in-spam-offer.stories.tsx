import type { Meta, StoryObj } from "@storybook/react-vite";
import { NeverInSpamOffer } from "./never-in-spam-offer.js";

const noop = () => undefined;

const meta = {
	title: "Design System/Spam/NeverInSpamOffer",
	component: NeverInSpamOffer,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="max-w-md overflow-hidden rounded-lg border border-line bg-canvas">
				<Story />
			</div>
		),
	],
	args: {
		sender: { name: "Sender name", email: "sender@example.com" },
		blocked: false,
		saving: false,
		onAccept: noop,
		onDismiss: noop,
	},
} satisfies Meta<typeof NeverInSpamOffer>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Not spam on a message in Spam returned it to the Inbox. */
export const Default: Story = {};

/** The sender is blocked, so accepting unblocks them, and the copy says so first. */
export const Blocked: Story = { args: { blocked: true } };

/** The Never in Spam write is in flight. */
export const Saving: Story = { args: { saving: true } };
