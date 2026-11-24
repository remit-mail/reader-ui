import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";

const meta = {
	title: "Playground/Shipped/Settings/Labels/Create",
	component: AppStory,
	args: { url: "/settings/labels" },
	parameters: {
		layout: "fullscreen",
		msw: {
			handlers: [
				http.post("/api/accounts/:accountId/labels", () =>
					HttpResponse.json(
						{ message: "A label with that name already exists." },
						{ status: 409 },
					),
				),
				...mailHandlers(mailWorld()),
			],
		},
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CreateRefused: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(await canvas.findByLabelText("Label name"), "Travel");
		await userEvent.click(canvas.getByRole("button", { name: "Create label" }));
		await expect(
			await canvas.findByText("A label with that name already exists."),
		).toBeVisible();
	},
};
