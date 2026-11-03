import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";
import {
	calendars,
	fortnight,
	roadmapResource,
	STORY_WEEK,
	standupResource,
} from "./calendar-story-fixtures";

const world = mailWorld({
	calendars,
	calendarEvents: fortnight,
	calendarResources: [roadmapResource, standupResource],
});

const meta = {
	title: "Playground/Shipped/Calendar/Screen",
	component: AppStory,
	args: { url: STORY_WEEK },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(world) },
	},
	globals: { viewport: { value: "desktop", isRotated: false } },
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

const page = () => within(document.body);

export const Idle: Story = {
	name: "Idle",
	args: { url: `${STORY_WEEK}#sidebar` },
	play: async () => {
		const toolbar = await page().findByRole("toolbar", { name: "Calendar" });
		await expect(within(toolbar).getByText("June 2026")).toBeVisible();
		await expect(within(toolbar).getByText("Week 24")).toBeVisible();
		await expect(
			(await page().findAllByText("Roadmap review"))[0],
		).toBeVisible();
		await expect(
			page().queryByText("Pick an event to read it here."),
		).toBeNull();
	},
};

export const LoadFailed: Story = {
	name: "Load failed",
	parameters: {
		msw: { handlers: mailHandlers(world, { calendarEvents: "fails" }) },
	},
	play: async () => {
		const alert = await page().findByRole("alert");
		await expect(
			within(alert).getByText("Couldn't load this week"),
		).toBeVisible();
		await expect(
			within(alert).getByRole("button", { name: "Retry" }),
		).toBeVisible();
		await expect(
			within(alert).getByRole("link", { name: "Report an issue" }),
		).toBeVisible();
		await expect(page().getByRole("button", { name: "Today" })).toBeEnabled();
	},
};

export const SidePaneClosed: Story = {
	name: "Side pane closed",
	args: { url: `${STORY_WEEK}#sidebar` },
	play: async () => {
		const toolbar = await page().findByRole("toolbar", { name: "Calendar" });
		const hamburger = within(toolbar).getByRole("button", {
			name: "Side pane",
		});
		await expect(
			await page().findByRole("region", { name: "Calendar side pane" }),
		).toBeVisible();
		await userEvent.click(hamburger);
		await waitFor(() =>
			expect(hamburger).toHaveAttribute("aria-expanded", "false"),
		);
		await expect(
			page().queryByRole("region", { name: "Calendar side pane" }),
		).toBeNull();
		await expect(
			page().getByRole("button", { name: "New event" }),
		).toBeVisible();
	},
};

export const CalendarListFailed: Story = {
	name: "Calendar list failed",
	args: { url: `${STORY_WEEK}#sidebar` },
	parameters: {
		msw: { handlers: mailHandlers(world, { calendars: "fails" }) },
	},
	play: async () => {
		const side = await page().findByRole("region", {
			name: "Calendar side pane",
		});
		const alert = await within(side).findByRole("alert");
		await expect(
			within(alert).getByText("Couldn't load your calendars"),
		).toBeVisible();
		await expect(
			within(alert).getByRole("button", { name: "Retry" }),
		).toBeVisible();
		await expect(
			within(alert).getByRole("link", { name: "Report an issue" }),
		).toBeVisible();
	},
};

export const PhoneDay: Story = {
	name: "Phone day",
	globals: { viewport: { value: "mobile", isRotated: false } },
	play: async () => {
		await expect(
			(await page().findAllByText("Roadmap review"))[0],
		).toBeVisible();
		await expect(
			page().getByRole("navigation", { name: "Apps" }),
		).toBeVisible();
		await expect(
			page().getByRole("button", { name: "New event" }),
		).toBeVisible();
	},
};
