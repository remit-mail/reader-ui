import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { latestFlagged, phishingDays, settingsNav, spamDays } from "./fixtures";
import { SpamSettingsPage } from "./spam-settings-page";

const noop = () => undefined;
const REPORT_URL = "https://github.com/remit-mail/reader/issues/new";
const thresholds = { warn: 0.4, junk: 0.85 };

const typeThresholds = async (
	canvasElement: HTMLElement,
	warn: string,
	junk: string,
) => {
	const canvas = within(canvasElement);
	const warnInput = canvas.getByLabelText("Warn from");
	const junkInput = canvas.getByLabelText("Move to Spam from");
	await userEvent.clear(warnInput);
	await userEvent.type(warnInput, warn);
	await userEvent.clear(junkInput);
	await userEvent.type(junkInput, junk);
	return canvas;
};

const meta = {
	title: "Playground/Proposed/Spam settings",
	tags: ["proposed"],
	component: SpamSettingsPage,
	parameters: { layout: "fullscreen" },
	args: {
		navItems: settingsNav,
		overview: {
			status: "Ready",
			data: {
				checkedAny: true,
				moved: 112,
				warned: 64,
				markedNotSpam: 3,
				spam: spamDays,
				phishing: phishingDays,
			},
		},
		latest: {
			status: "Ready",
			data: {
				messages: latestFlagged,
				reviewSpamHref: "/mail/label/label-spam",
				openPhishingHref: "/mail/label/label-phishing",
			},
		},
		thresholds: {
			status: "Ready",
			data: { saved: thresholds, defaults: thresholds },
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

/** Edited thresholds, with the last 30 days recounted against them. */
export const Preview: Story = {
	args: {
		preview: {
			status: "Ready",
			draft: { warns: 51, moves: 131 },
			saved: { warns: 64, moves: 112 },
		},
	},
	play: async ({ canvasElement }) => {
		await typeThresholds(canvasElement, "0.50", "0.80");
	},
};

/** Save with Warn from at or past Move to Spam from. */
export const InvalidThresholds: Story = {
	play: async ({ canvasElement }) => {
		const canvas = await typeThresholds(canvasElement, "0.90", "0.85");
		await userEvent.click(
			canvas.getByRole("button", { name: "Save thresholds" }),
		);
		await expect(canvas.getByLabelText("Warn from")).toHaveFocus();
	},
};

/** The thresholds write failed; the draft stays and focus lands on Try again. */
export const SaveFailed: Story = {
	args: {
		saveFailure: {
			message: "The server did not answer.",
			reportHref: REPORT_URL,
			onRetry: noop,
		},
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
			message: "The server answered 500 Internal Server Error.",
			reportHref: REPORT_URL,
			onRetry: noop,
		},
		latest: {
			status: "Error",
			title: "Couldn't load the latest flagged mail",
			message: "The server answered 500 Internal Server Error.",
			reportHref: REPORT_URL,
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
