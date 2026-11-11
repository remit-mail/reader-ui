import type { Meta, StoryObj } from "@storybook/react";
import type { IntelligenceData } from "./intelligence-panel.js";
import { IntelligencePanel } from "./intelligence-panel.js";

const base: IntelligenceData = {
	sender: {
		name: "Alex Rivera",
		email: "alex@example.com",
		trust: "wellknown",
		firstSeenLabel: "Jan 2025",
	},
	authenticity: {
		verdict: "aligned",
		fromDomain: "example.com",
		dkimDomain: "example.com",
		summary: "This message was signed by example.com.",
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

export const Aligned: Story = {
	args: { data: base },
};

export const CautionNoSignal: Story = {
	args: {
		data: {
			...base,
			sender: {
				name: "Notifications",
				email: "no-reply@unknown-source.example",
				trust: "unknown",
				firstSeenLabel: "today",
			},
			authenticity: {
				verdict: "caution",
				fromDomain: "unknown-source.example",
				summary:
					"We can't verify the sender of this email, which could mean it's from an insecure source.",
			},
		},
	},
};

export const SignedButUnrecognised: Story = {
	args: {
		data: {
			...base,
			sender: {
				name: "InfoMedics",
				email: "jira@serviceupdatebank.atlassian.net",
				trust: "unknown",
				firstSeenLabel: "today",
			},
			category: { value: "automated" },
			authenticity: {
				verdict: "caution",
				fromDomain: "serviceupdatebank.atlassian.net",
				// Deliberately a different domain than fromDomain: the display-name
				// check compared "InfoMedics" against the sender's own domain, never
				// this one, so the summary must name serviceupdatebank.atlassian.net.
				dkimDomain: "custmx.one.com",
				claimedBrand: "InfoMedics",
				summary:
					'The name it shows, "InfoMedics", has nothing to do with serviceupdatebank.atlassian.net. Its links go to betaal-vordering.example.',
			},
		},
	},
};

export const SignedButLookalikeName: Story = {
	args: {
		data: {
			...base,
			sender: {
				name: "InfoMedics",
				email: "billing@1nfomedics.nl",
				trust: "unknown",
				firstSeenLabel: "today",
			},
			category: { value: "transactional" },
			authenticity: {
				verdict: "caution",
				fromDomain: "1nfomedics.nl",
				dkimDomain: "1nfomedics.nl",
				claimedBrand: "InfoMedics",
				summary:
					'The name it shows, "InfoMedics", only looks like 1nfomedics.nl.',
			},
		},
	},
};

export const Impersonation: Story = {
	args: {
		data: {
			...base,
			sender: {
				name: "Your Bank",
				email: "security@your-bank.example",
				trust: "unknown",
				firstSeenLabel: "today",
			},
			category: { value: "automated" },
			authenticity: {
				verdict: "mismatch",
				fromDomain: "your-bank.example",
				dkimDomain: "mailer.suspicious.example",
				claimedBrand: "Your Bank",
				summary:
					'The display name claims "Your Bank", but this message was actually sent from mailer.suspicious.example — not your-bank.example. Real senders use their own address.',
			},
		},
	},
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
			authenticity: {
				verdict: "mismatch",
				fromDomain: "",
				addressUnreadable: true,
				summary:
					"We couldn't read this sender's address, so we can't confirm who really sent this message.",
			},
		},
	},
};

export const Reportable: Story = {
	args: {
		data: base,
		actions: { onReportSpam: () => {} },
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
