import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import {
	foldersOf,
	HOUR,
	mailWorld,
	PERSONAL,
	threadRow,
	WORK,
} from "../../mocks/story-frame/mail-world";
import { makeLabel, makeMailbox } from "../../test-support/fixtures";

const LABEL_ID = "lbl-newsletters";

const labelFolder = (accountId: string) => ({
	accountId,
	state: "Present" as const,
	mailboxId: `mbx-${accountId}-newsletters`,
	fullPath: "INBOX/remit_remit/Newsletters",
});

const labelMailboxes = (accountId: string) => [
	makeMailbox({
		accountId,
		mailboxId: `mbx-${accountId}-remit-root`,
		fullPath: "INBOX/remit_remit",
	}),
	makeMailbox({
		accountId,
		mailboxId: `mbx-${accountId}-newsletters`,
		fullPath: "INBOX/remit_remit/Newsletters",
	}),
];

const world = mailWorld({
	mailboxes: [PERSONAL, WORK].flatMap((accountId) => [
		...foldersOf(accountId),
		...labelMailboxes(accountId),
	]),
	labels: [
		makeLabel({
			labelId: LABEL_ID,
			name: "Newsletters",
			color: "Blue",
			folders: [labelFolder(PERSONAL), labelFolder(WORK)],
		}),
	],
	threads: [
		{
			...threadRow({
				id: "weekly-digest",
				accountId: PERSONAL,
				fromName: "The Weekly",
				fromEmail: "digest@weekly.example",
				subject: "This week in review",
				snippet: "Five stories worth your time.",
				category: "newsletter",
				ago: 2 * HOUR,
			}),
			mailboxId: `mbx-${PERSONAL}-newsletters`,
		},
		{
			...threadRow({
				id: "industry-brief",
				accountId: WORK,
				fromName: "Industry Brief",
				fromEmail: "brief@industry.example",
				subject: "Quarterly market notes",
				snippet: "What changed this quarter.",
				category: "newsletter",
				ago: 5 * HOUR,
			}),
			mailboxId: `mbx-${WORK}-newsletters`,
		},
	],
});

const meta = {
	title: "Playground/Shipped/Mail/Label",
	component: AppStory,
	args: { url: `/mail/label/${LABEL_ID}` },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(world) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("This week in review")).toBeVisible();
		await expect(canvas.getByText("Quarterly market notes")).toBeVisible();
		await expect(
			await canvas.findByRole("link", { name: "Newsletters" }),
		).toBeVisible();
		await expect(canvas.queryByText("remit_remit")).toBeNull();
	},
};

export const Phone: Story = {
	globals: { viewport: { value: "mobile", isRotated: false } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("This week in review")).toBeVisible();
	},
};
