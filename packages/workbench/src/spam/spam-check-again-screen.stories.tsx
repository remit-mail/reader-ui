import type { CheckAgainOutcome } from "@remit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { spamListRows } from "./fixtures";
import {
	SpamCheckAgainScreen,
	type SpamListRow,
	SpamMessageMenuPreview,
} from "./spam-check-again-screen";

const noop = () => undefined;

const results: { outcome: CheckAgainOutcome; score: number }[] = [
	{ outcome: "NowSpam", score: 0.88 },
	{ outcome: "NowClean", score: 0.12 },
	{ outcome: "Unchanged", score: 0.51 },
];

const withResults: SpamListRow[] = spamListRows.map((row, i) => {
	const result = results[i];
	return result ? { ...row, result } : row;
});

const pickRows =
	(indices: number[]) =>
	async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const toggles = within(canvasElement).getAllByRole("button", {
			name: "Select message",
		});
		for (const index of indices) {
			const toggle = toggles[index];
			if (toggle) await userEvent.click(toggle);
		}
	};

const everyRow = spamListRows.map((_, i) => i);

const meta = {
	title: "Playground/Proposed/Spam check again",
	tags: ["proposed"],
	component: SpamCheckAgainScreen,
	parameters: { layout: "padded" },
	args: {
		title: "Spam",
		rows: spamListRows,
		settingsHref: "/settings/spam",
		onNotSpam: noop,
		onCheckAgain: noop,
		onDelete: noop,
	},
} satisfies Meta<typeof SpamCheckAgainScreen>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Picks in the Spam list put Not spam, Check again and Delete in the bar. */
export const Selecting: Story = { play: pickRows([0, 3, 6]) };

/** A run in flight: each row shows its new verdict as its batch lands. */
export const Running: Story = {
	args: {
		rows: withResults,
		panel: { state: "Running", checked: 20, total: 35, onStop: noop },
	},
	play: pickRows(everyRow),
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
		panel: {
			state: "PartialFailure",
			checked: 31,
			total: 35,
			failures: [
				{ messageId: "m-1", subject: "Subject line", cause: "RateLimited" },
				{ messageId: "m-2", subject: "Subject line", cause: "RateLimited" },
				{ messageId: "m-3", subject: "Subject line", cause: "DailyCap" },
				{ messageId: "m-4", subject: "Subject line", cause: "NotFound" },
			],
			reportIssueHref: "https://github.com/remit-mail/reader/issues/new",
			onRetry: noop,
			onClose: noop,
		},
	},
	play: pickRows([2, 3, 4, 5]),
};

/**
 * A 401 stopped the run. The count shown stays, no batch reads as failed, and
 * the web client's SignedOutOverlay covers the screen.
 */
export const SignedOut: Story = {
	args: {
		panel: { state: "Running", checked: 20, total: 35, onStop: noop },
	},
	play: pickRows(everyRow),
};

/** The Spam label list with nothing in it. */
export const Empty: Story = { args: { rows: [] } };

/** Check again on one open message, from its action menu. */
export const MessageMenu: Story = {
	render: () => <SpamMessageMenuPreview onCheckAgain={noop} />,
	play: async ({ canvasElement }) => {
		await userEvent.click(
			within(canvasElement).getByRole("button", { name: "More actions" }),
		);
	},
};
