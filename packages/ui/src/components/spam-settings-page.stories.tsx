import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
	latestFlaggedFixture,
	phishingDaysFixture,
	spamDaysFixture,
	spamSettingsNavFixture,
	spamThresholdsFixture,
} from "./spam-fixtures.js";
import { SpamSettingsPage } from "./spam-settings-page.js";

const noop = () => undefined;
const REPORT_URL = "https://github.com/remit-mail/reader/issues/new";

const meta = {
	title: "Playground/Proposed/Spam settings",
	tags: ["proposed"],
	component: SpamSettingsPage,
	parameters: { layout: "fullscreen" },
	args: {
		navItems: spamSettingsNavFixture,
		overview: {
			status: "Ready",
			data: {
				checkedAny: true,
				moved: 112,
				warned: 64,
				markedNotSpam: 3,
				spam: spamDaysFixture,
				phishing: phishingDaysFixture,
			},
		},
		latest: {
			status: "Ready",
			data: {
				messages: latestFlaggedFixture,
				reviewSpamHref: "/mail/label/label-spam",
				openPhishingHref: "/mail/label/label-phishing",
			},
		},
		thresholds: {
			status: "Ready",
			data: { saved: spamThresholdsFixture, defaults: spamThresholdsFixture },
		},
		labelModes: {
			status: "Ready",
			data: { spam: "MoveToSpam", phishing: "MoveToSpam" },
		},
		preview: { status: "Idle" },
		neverInSpamHref: "/settings/senders",
		reportedHref: "/settings/senders",
		onDraftChange: noop,
		onSaveThresholds: noop,
		onLabelModeChange: noop,
		onBackToMail: noop,
	},
} satisfies Meta<typeof SpamSettingsPage>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Every section loaded. */
export const Default: Story = {};

/** Unsaved thresholds, with the last 30 days recounted against them. */
export const Preview: Story = {
	args: {
		initialDraft: { warn: 0.5, junk: 0.8 },
		preview: {
			status: "Ready",
			draft: { warns: 51, moves: 131 },
			saved: { warns: 64, moves: 112 },
		},
	},
};

/** Save with Warn from at or past Move to Spam from. */
export const InvalidThresholds: Story = {
	args: { initialDraft: { warn: 0.9, junk: 0.85 } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole("button", { name: "Save thresholds" }),
		);
		await expect(canvas.getByLabelText("Warn from")).toHaveFocus();
		await expect(
			canvas.getByText(
				"Warn from must be below Move to Spam from. Nothing was saved.",
			),
		).toBeVisible();
	},
};

/** The thresholds write failed; the draft stays in the inputs. */
export const SaveFailed: Story = {
	args: {
		initialDraft: { warn: 0.5, junk: 0.8 },
		saveFailure: { error: "The server did not answer.", onRetry: noop },
	},
};

/** Before data arrives: skeletons, never zeros, and the inputs disabled. */
export const Loading: Story = {
	args: {
		overview: { status: "Loading" },
		latest: { status: "Loading" },
		thresholds: { status: "Loading" },
		labelModes: { status: "Loading" },
	},
};

/** Remit has not checked any mail yet. */
export const NothingChecked: Story = {
	args: {
		overview: {
			status: "Ready",
			data: {
				checkedAny: false,
				moved: 0,
				warned: 0,
				markedNotSpam: 0,
				spam: [],
				phishing: [],
			},
		},
		latest: {
			status: "Ready",
			data: {
				messages: [],
				reviewSpamHref: "/mail/label/label-spam",
				openPhishingHref: "/mail/label/label-phishing",
			},
		},
	},
};

/** The counts and the latest list failed; the other sections still work. */
export const LoadError: Story = {
	args: {
		overview: {
			status: "Error",
			title: "Couldn't load the spam counts",
			error: "The server answered 500 Internal Server Error.",
			reportIssueHref: REPORT_URL,
			onRetry: noop,
		},
		latest: {
			status: "Error",
			title: "Couldn't load the latest flagged mail",
			error: "The server answered 500 Internal Server Error.",
			reportIssueHref: REPORT_URL,
			onRetry: noop,
		},
	},
};

/**
 * An expired session: every section stays a skeleton behind the app's
 * SignedOutOverlay, which the web client raises over the page.
 */
export const SignedOut: Story = {
	args: {
		overview: { status: "SignedOut" },
		latest: { status: "SignedOut" },
		thresholds: { status: "SignedOut" },
		labelModes: { status: "SignedOut" },
	},
};
