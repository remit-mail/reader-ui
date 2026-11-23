import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import {
	composeWorld,
	messageUrl,
} from "../../mocks/story-frame/compose-world";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";

let reachable = false;
const world = composeWorld();
const meta = {
	title: "Playground/Shipped/Mail/Message body failure",
	component: AppStory,
	args: { url: messageUrl("q3-planning") },
	beforeEach: () => {
		reachable = false;
	},
	parameters: {
		msw: {
			handlers: [
				http.get("/content/*", () =>
					reachable
						? HttpResponse.text("Recovered message body")
						: HttpResponse.text("Tenant mismatch", {
								status: 403,
								headers: { "x-remit-403-reason": "tenant-mismatch" },
							}),
				),
				...mailHandlers(world),
			],
		},
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Refused: Story = {
	play: async ({ canvasElement }) => {
		const page = within(canvasElement);
		const banner = await page.findByTestId(
			"message-body-error-banner",
			{},
			{ timeout: 5000 },
		);
		await expect(banner).toHaveTextContent("tenant-mismatch");
		await expect(
			within(banner).queryByRole("button", { name: "Sign in again" }),
		).toBeNull();
		reachable = true;
		await userEvent.click(
			within(banner).getByRole("button", { name: "Retry" }),
		);
		await expect(await page.findByText("Recovered message body")).toBeVisible();
	},
};
