import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
	failedVerdict,
	nowJunkVerdict,
	spamThresholdsFixture,
	warnPhishingVerdict,
	warnSpamVerdict,
} from "./spam-fixtures.js";
import { SpamWarningBanner } from "./spam-warning-banner.js";

const readingPaneFrame: Decorator = (Story) => (
	<div className="max-w-3xl overflow-hidden rounded-lg border border-line bg-canvas">
		<header className="border-b border-line px-5 py-3">
			<p className="text-base font-semibold text-fg">Subject line</p>
			<p className="text-xs text-fg-muted">
				Sender name &lt;sender@example.com&gt; to me · 09:14
			</p>
		</header>
		<Story />
		<article className="px-5 py-4 text-sm text-fg">
			The body of the message starts here.
		</article>
	</div>
);

const noop = () => undefined;

const meta = {
	title: "Design System/Spam/SpamWarningBanner",
	tags: ["proposed"],
	component: SpamWarningBanner,
	parameters: { layout: "padded" },
	decorators: [readingPaneFrame],
} satisfies Meta<typeof SpamWarningBanner>;
export default meta;

type Story = StoryObj<typeof meta>;

const warn = {
	state: "Warn",
	verdict: warnSpamVerdict,
	onNotSpam: noop,
	onReport: noop,
	onWhy: noop,
} as const;

/** A suspected spam message stays in its folder under the warning tone. */
export const WarnSpam: Story = { args: warn };

/** Suspected phishing takes the danger tone and announces as an alert. */
export const WarnPhishing: Story = {
	args: { ...warn, verdict: warnPhishingVerdict },
};

/** The model call was skipped; the banner names why. */
export const ModelSkipped: Story = {
	args: { ...warn, modelSkip: "DailyLimit" },
};

/** Check again reached the junk threshold for a message that stays put. */
export const NowJunk: Story = {
	args: {
		state: "NowJunk",
		verdict: nowJunkVerdict,
		junkFrom: spamThresholdsFixture.junk,
		onMove: noop,
		onNotSpam: noop,
		onWhy: noop,
	},
};

/** The spam service gave no verdict. */
export const CheckFailed: Story = {
	args: { state: "Failed", verdict: failedVerdict, onCheckAgain: noop },
};

/** Not spam is in flight: it names its work and both mutating buttons hold. */
export const Pending: Story = {
	args: { ...warn, pending: "NotSpam" },
};

/** Three buttons share one 40px row on a 360px screen. */
export const Phone: Story = {
	args: warn,
	globals: { viewport: { value: "mobile" } },
	decorators: [
		(Story) => (
			<div style={{ width: 360 }}>
				<Story />
			</div>
		),
	],
};

/** A screen reader meets the banner before the body. */
export const ReadingOrder: Story = {
	args: warn,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const banner = canvas.getByRole("status");
		const body = canvas.getByText("The body of the message starts here.");
		await expect(banner).toHaveTextContent("Remit suspects this is spam");
		await expect(
			banner.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	},
};
