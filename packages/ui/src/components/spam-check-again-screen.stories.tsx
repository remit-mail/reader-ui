import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import type { CheckAgainOutcome } from "./check-again-panel.js";
import {
	SpamCheckAgainScreen,
	type SpamListRow,
	SpamMessageMenuPreview,
} from "./spam-check-again-screen.js";
import {
	checkAgainFailuresFixture,
	spamListRowsFixture,
} from "./spam-fixtures.js";

const noop = () => undefined;

const results: { outcome: CheckAgainOutcome; score: number }[] = [
	{ outcome: "NowSpam", score: 0.88 },
	{ outcome: "NowClean", score: 0.12 },
	{ outcome: "Unchanged", score: 0.51 },
];

const withResults: SpamListRow[] = spamListRowsFixture.map((row, i) => {
	const result = results[i];
	return result ? { ...row, result } : row;
});

const allIds = spamListRowsFixture.map((row) => row.thread.id);

const meta = {
	title: "Playground/Proposed/Spam check again",
	tags: ["proposed"],
	component: SpamCheckAgainScreen,
	parameters: { layout: "padded" },
	args: {
		title: "Spam",
		rows: spamListRowsFixture,
		initialSelection: [],
		settingsHref: "/settings/spam",
		onNotSpam: noop,
		onCheckAgain: noop,
		onDelete: noop,
	},
} satisfies Meta<typeof SpamCheckAgainScreen>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Picks in the Spam list put Not spam, Check again and Delete in the bar. */
export const Selecting: Story = {
	args: { initialSelection: allIds.filter((_, i) => i % 3 === 0) },
};

/** A run in flight: each row shows its new verdict as its batch lands. */
export const Running: Story = {
	args: {
		rows: withResults,
		initialSelection: allIds,
		panel: { state: "Running", checked: 20, total: 35, onStop: noop },
	},
};

/** Every batch landed; nothing moved. */
export const Done: Story = {
	args: {
		rows: withResults,
		panel: {
			state: "Done",
			total: 35,
			summary: { nowSpam: 2, nowSuspected: 0, noLongerSuspected: 4 },
			onDone: noop,
		},
	},
};

/** Some messages failed; the failed ones stay selected. */
export const PartialFailure: Story = {
	args: {
		initialSelection: allIds.slice(2, 6),
		panel: {
			state: "PartialFailure",
			checked: 31,
			total: 35,
			failures: checkAgainFailuresFixture,
			reportIssueHref: "https://github.com/remit-mail/reader/issues/new",
			onRetry: noop,
			onClose: noop,
		},
	},
};

/**
 * A 401 stopped the run. The count shown stays, no batch reads as failed, and
 * the web client's SignedOutOverlay covers the screen.
 */
export const SignedOut: Story = {
	args: {
		initialSelection: allIds,
		panel: { state: "Running", checked: 20, total: 35, onStop: noop },
	},
};

/** The Spam label list with nothing in it. */
export const Empty: Story = { args: { rows: [] } };

/** Check again on one open message, from its action menu. */
export const MessageMenu: Story = {
	render: () => <SpamMessageMenuPreview onCheckAgain={noop} />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "More actions" }));
	},
};
