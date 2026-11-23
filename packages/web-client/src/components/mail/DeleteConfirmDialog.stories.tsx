import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { composeWorld, INBOX } from "../../mocks/story-frame/compose-world";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { makeConfig } from "../../test-support/fixtures";

const world = composeWorld();
let reachable = false;
const meta = {
	title: "Playground/Shipped/Mail/Folder settings read failed",
	component: AppStory,
	args: { url: `/mail/${INBOX}` },
	beforeEach: () => {
		reachable = false;
	},
	parameters: {
		msw: {
			handlers: [
				http.get("/api/config", () =>
					reachable
						? HttpResponse.json(makeConfig(world.accounts))
						: HttpResponse.error(),
				),
				...mailHandlers(world),
			],
		},
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ReadFailed: Story = {
	play: async () => {
		const page = within(document.body);
		await expect(
			await page.findByText("Couldn't load your account"),
		).toBeVisible();
		reachable = true;
		await userEvent.click(
			page.getByRole("button", { name: /retry|try again/i }),
		);
		await page.findByText("Q3 planning");
		document.querySelector<HTMLElement>("[data-list-row]")?.focus();
		await userEvent.keyboard("#");
		await expect(
			await page.findByText("Move 1 message to Trash?"),
		).toBeVisible();
	},
};
