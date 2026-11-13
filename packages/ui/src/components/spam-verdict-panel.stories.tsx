import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	junkPhishingVerdict,
	modelJudgedVerdict,
	phishingLabelFixture,
	spamLabelFixture,
	spamThresholdsFixture,
	unknownReasonVerdict,
	warnOnlyAboveJunkVerdict,
	warnSpamVerdict,
} from "./spam-fixtures.js";
import { SpamVerdictPanel } from "./spam-verdict-panel.js";

const noop = () => undefined;

const meta = {
	title: "Design System/Spam/SpamVerdictPanel",
	tags: ["proposed"],
	component: SpamVerdictPanel,
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<div className="w-80 overflow-hidden rounded-lg border border-line bg-surface">
				<Story />
			</div>
		),
	],
	args: {
		verdict: warnSpamVerdict,
		label: spamLabelFixture,
		thresholds: spamThresholdsFixture,
		warnOnly: false,
		links: {
			spamSettingsHref: "/settings/spam",
			sendersHref: "/settings/senders",
			filterHref: (filterId) => `/settings/filters#${filterId}`,
			reportIssueHref: (reasonName) =>
				`https://github.com/remit-mail/reader/issues/new?title=${encodeURIComponent(`Unknown spam reason ${reasonName}`)}`,
		},
		onNotSpam: noop,
	},
} satisfies Meta<typeof SpamVerdictPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Suspected spam, warned: score, bar, every reason and what it found. */
export const WarnSpam: Story = {};

/** Phishing Remit moved to Spam. */
export const JunkPhishing: Story = {
	args: { verdict: junkPhishingVerdict, label: phishingLabelFixture },
};

/** The model judged it, and the rail quotes its reason as returned. */
export const ModelJudged: Story = {
	args: {
		verdict: modelJudgedVerdict,
		modelSaid:
			"The message pushes an urgent payment from a domain registered last week.",
	},
};

/** Stage 1 let the message through without a check. */
export const ScreenedOut: Story = {
	args: {
		verdict: { state: "ScreenedOut", screen: { rule: "NeverSpam" } },
	},
};

/** The owner reported this sender, so their mail goes to Spam unchecked. */
export const ReportedSender: Story = {
	args: {
		verdict: { state: "ScreenedOut", screen: { rule: "ReportedSender" } },
	},
};

/** A reason this version has no sentence for shows its name and a report link. */
export const UnknownReason: Story = {
	args: { verdict: unknownReasonVerdict },
};

/** Warn only kept a score past the Spam threshold in place. */
export const WarnOnlyAboveJunk: Story = {
	args: { verdict: warnOnlyAboveJunkVerdict, warnOnly: true },
};
