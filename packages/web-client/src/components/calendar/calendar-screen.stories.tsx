import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
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
