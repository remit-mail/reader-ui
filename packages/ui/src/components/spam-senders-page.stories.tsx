import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	neverInSpamSendersFixture,
	spamSettingsNavFixture,
} from "./spam-fixtures.js";
import { SpamSendersPage } from "./spam-senders-page.js";

const noop = () => undefined;

const meta = {
	title: "Playground/Proposed/Spam senders",
	tags: ["proposed"],
	component: SpamSendersPage,
	parameters: { layout: "fullscreen" },
	args: {
		navItems: spamSettingsNavFixture,
		senders: neverInSpamSendersFixture,
		onRemove: noop,
		onBackToMail: noop,
	},
} satisfies Meta<typeof SpamSendersPage>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The fourth group in Senders & Rules, beside VIPs, Muted and Blocked. */
export const NeverInSpam: Story = {};
