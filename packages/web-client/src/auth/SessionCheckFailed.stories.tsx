import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../mocks/story-frame/AppStory";
import { mailHandlers } from "../mocks/story-frame/mail-handlers";
import { mailWorld } from "../mocks/story-frame/mail-world";
import { withRuntimeConfig } from "../mocks/story-frame/session";
import { authClient } from "./better-auth-config";
import { betterAuthProvider } from "./better-auth-provider";

let reachable = false;
const meta = {
	title: "Playground/Shipped/Sign in/Session check failed",
	component: AppStory,
	args: { url: "/mail/brief", authProvider: betterAuthProvider },
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/get-session", () =>
					reachable
						? HttpResponse.json(null)
						: HttpResponse.json(
								{ message: "Session service unavailable" },
								{ status: 503 },
							),
				),
				...mailHandlers(mailWorld()),
			],
		},
	},
	beforeEach: [
		withRuntimeConfig({ betterAuthEnabled: true }),
		async () => {
			reachable = false;
			await authClient.$store.atoms.session?.get().refetch();
		},
	],
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ServerFailure: Story = {
	play: async ({ canvasElement }) => {
		const page = within(canvasElement);
		await expect(
			await page.findByText("Could not check your session"),
		).toBeVisible();
		await expect(page.getByText("Session service unavailable")).toBeVisible();
		reachable = true;
		await userEvent.click(page.getByRole("button", { name: "Retry" }));
		await expect(await page.findByLabelText("Password")).toBeVisible();
	},
};
