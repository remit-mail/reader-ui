import type { Meta, StoryObj } from "@storybook/react-vite";
import { neverInSpamSenders, settingsNav } from "./fixtures";
import { SpamSendersPage } from "./spam-senders-page";

const noop = () => undefined;

const meta = {
	title: "Playground/Proposed/Spam senders",
	tags: ["proposed"],
	component: SpamSendersPage,
	parameters: { layout: "fullscreen" },
	args: {
		navItems: settingsNav,
		query: "",
		senders: neverInSpamSenders,
		onSearch: noop,
		onSelectGroup: noop,
		onRemove: noop,
		onBackToMail: noop,
	},
} satisfies Meta<typeof SpamSendersPage>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The fourth group in Senders & Rules, beside VIPs, Muted and Blocked. */
export const NeverInSpam: Story = {};
