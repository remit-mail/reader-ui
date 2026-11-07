import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../mocks/story-frame/AppStory";
import { mailHandlers } from "../mocks/story-frame/mail-handlers";
import { mailWorld } from "../mocks/story-frame/mail-world";
import { withRuntimeConfig } from "../mocks/story-frame/session";
import { authClient } from "./better-auth-config";
import { betterAuthProvider } from "./better-auth-provider";

const signedOut = http.get("/api/auth/get-session", () =>
	HttpResponse.json(null),
);

// better-auth holds the session in one module-level store, so a refusal one
// story answered would otherwise greet the next. Each story re-reads the
// session from its own handlers before it renders.
const rereadSession = async (): Promise<void> => {
	await authClient.$store.atoms.session?.get().refetch();
};

const meta = {
	title: "Playground/Shipped/Sign in/Self-host",
	component: AppStory,
	args: { url: "/mail/brief", authProvider: betterAuthProvider },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: [signedOut, ...mailHandlers(mailWorld())] },
	},
	beforeEach: [withRuntimeConfig({ betterAuthEnabled: true }), rereadSession],
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SignInTurnedOff: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/auth/get-session", () =>
					HttpResponse.json(
						{
							code: "SIGN_IN_DISABLED",
							message: "Sign-in is turned off on this server.",
						},
						{ status: 403 },
					),
				),
				...mailHandlers(mailWorld()),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Sign-in is turned off on this server."),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button", { name: "Create account" }),
		).toBeNull();
	},
};

export const Disabled: Story = {
	parameters: {
		msw: {
			handlers: [
				signedOut,
				http.post("/api/auth/sign-in/email", () =>
					HttpResponse.json(
						{
							code: "ACCOUNT_DISABLED",
							message: "This account is disabled.",
						},
						{ status: 403 },
					),
				),
				...mailHandlers(mailWorld()),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(
			await canvas.findByLabelText("Email"),
			"user@example.com",
		);
		await userEvent.type(
			canvas.getByLabelText("Password"),
			"correct horse battery",
		);
		const submit = canvasElement.querySelector<HTMLElement>(
			'button[type="submit"]',
		);
		if (!submit) throw new Error("the sign-in form has no submit button");
		await userEvent.click(submit);
		await expect(
			await canvas.findByText("This account is disabled."),
		).toBeVisible();
		await expect(
			canvas.getByText("Ask the person who runs this server."),
		).toBeVisible();
	},
};
