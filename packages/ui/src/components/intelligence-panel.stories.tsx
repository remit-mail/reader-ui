import type { Meta, StoryObj } from "@storybook/react";
import type { IntelligenceData } from "./intelligence-panel.js";
import { IntelligencePanel } from "./intelligence-panel.js";
import {
	spamLabelFixture,
	spamThresholdsFixture,
	warnSpamVerdict,
} from "./spam-fixtures.js";
import { SpamVerdictPanel } from "./spam-verdict-panel.js";

const base: IntelligenceData = {
	sender: {
		name: "Alex Rivera",
		email: "alex@example.com",
		trust: "wellknown",
		firstSeenLabel: "Jan 2025",
	},
	category: { value: "personal" },
	spamAction: "reportSpam",
};

const meta: Meta<typeof IntelligencePanel> = {
	title: "Playground/Shipped/Mail/IntelligencePanel",
	component: IntelligencePanel,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof IntelligencePanel>;

export const Default: Story = {
	args: { data: base },
};

export const UnreadableSender: Story = {
	args: {
		data: {
			...base,
			sender: {
				name: "Mailbox Admin",
				email: "missing_mailbox@missing_domain",
				trust: "unknown",
				firstSeenLabel: "today",
				addressUnverified: true,
			},
			category: { value: "uncategorized" },
		},
	},
};

export const Reportable: Story = {
	args: {
		data: base,
		actions: { onReportSpam: () => {} },
	},
};

/** A warned message: the Spam check section sits under Sender. */
export const WithSpamCheck: Story = {
	args: {
		data: base,
		actions: { onReportSpam: () => {} },
		spamCheck: (
			<SpamVerdictPanel
				verdict={warnSpamVerdict}
				label={spamLabelFixture}
				thresholds={spamThresholdsFixture}
				placement="MoveToSpam"
				linkComponent={({ className, children }) => (
					<a href="/settings/spam" className={className}>
						{children}
					</a>
				)}
				reportIssueHref={() =>
					"https://github.com/remit-mail/reader/issues/new"
				}
				onNotSpam={() => {}}
			/>
		),
	},
};

export const Reported: Story = {
	args: {
		data: { ...base, spamAction: "undoSpamReport" },
		actions: { onNotSpam: () => {} },
	},
};

export const ReportSpamPending: Story = {
	args: {
		data: base,
		actions: { onReportSpam: () => {} },
		reportSpamPending: true,
	},
};

const unknownSender: IntelligenceData["sender"] = {
	name: "Weekly Deals",
	email: "news@deals.example",
	trust: "unknown",
	firstSeenLabel: "today",
};

export const MovedOutOfJunkUnsure: Story = {
	args: {
		data: {
			...base,
			sender: unknownSender,
			category: { value: "newsletter" },
			placement: {
				action: "MoveToInbox",
				confidence: "Unsure",
				fromPlacement: "junk",
				reasons: ["no-confident-signal", "newer-server-code"],
				dryRun: false,
			},
		},
		actions: { onReportSpam: () => {} },
	},
};

export const KeptInJunkByClassifier: Story = {
	args: {
		data: {
			...base,
			sender: unknownSender,
			category: { value: "automated" },
			placement: {
				action: "MoveToJunk",
				confidence: "Confident",
				fromPlacement: "junk",
				reasons: ["classifier=spam"],
				dryRun: false,
			},
			spamAction: "notSpam",
		},
		actions: { onNotSpam: () => {} },
	},
};

export const LeftInInboxNoVerdict: Story = {
	args: {
		data: base,
		actions: { onReportSpam: () => {} },
	},
};

export const NotSpamPending: Story = {
	args: {
		data: { ...base, spamAction: "undoSpamReport" },
		actions: { onNotSpam: () => {} },
		notSpamPending: true,
	},
};
