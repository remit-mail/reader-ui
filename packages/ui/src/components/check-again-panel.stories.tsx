import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckAgainPanel } from "./check-again-panel.js";
import { checkAgainFailuresFixture } from "./spam-fixtures.js";

const noop = () => undefined;

const meta = {
	title: "Design System/Spam/CheckAgainPanel",
	tags: ["proposed"],
	component: CheckAgainPanel,
	parameters: { layout: "centered" },
} satisfies Meta<typeof CheckAgainPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A run in flight, ten at a time. */
export const Running: Story = {
	args: { state: "Running", checked: 20, total: 35, onStop: noop },
};

/** Every batch landed. */
export const Done: Story = {
	args: {
		state: "Done",
		total: 35,
		summary: { nowSpam: 2, nowSuspected: 0, noLongerSuspected: 4 },
		onDone: noop,
	},
};

/** Some messages failed; only the retryable ones go back. */
export const PartialFailure: Story = {
	args: {
		state: "PartialFailure",
		checked: 31,
		total: 35,
		failures: checkAgainFailuresFixture,
		reportIssueHref: "https://github.com/remit-mail/reader/issues/new",
		onRetry: noop,
		onClose: noop,
	},
};
