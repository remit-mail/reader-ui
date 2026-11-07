import type { Meta, StoryObj } from "@storybook/react-vite";
import { HttpResponse, http } from "msw";
import { expect, fn, userEvent, within } from "storybook/test";
import { ResetPasswordPage } from "./ResetPasswordPage";

const redeemed = http.post("/api/auth/reset-password", () =>
	HttpResponse.json({ status: true }),
);

const meta = {
	title: "Playground/Shipped/Sign in/Reset link",
	component: ResetPasswordPage,
	args: { token: "q8Zr2w1kVb0x", onDone: fn() },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: [redeemed] },
	},
} satisfies Meta<typeof ResetPasswordPage>;
export default meta;

type Story = StoryObj<typeof meta>;

const setPassword = async (canvasElement: HTMLElement, password: string) => {
	const canvas = within(canvasElement);
	await userEvent.type(await canvas.findByLabelText("New password"), password);
	await userEvent.click(canvas.getByRole("button", { name: "Set password" }));
};

export const ResetPage: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Choose a new password"),
		).toBeVisible();
		await expect(canvas.getByLabelText("New password")).toHaveFocus();
		await setPassword(canvasElement, "a long phrase to remember");
		await expect(args.onDone).toHaveBeenCalled();
	},
};

export const TooShort: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		await setPassword(canvasElement, "too short");
		await expect(
			await canvas.findByText("This password has 9 characters. Use 12 to 128."),
		).toBeVisible();
		await expect(args.onDone).not.toHaveBeenCalled();
	},
};

export const LinkNoLongerWorks: Story = {
	parameters: {
		msw: {
			handlers: [
				http.post("/api/auth/reset-password", () =>
					HttpResponse.json(
						{ code: "INVALID_TOKEN", message: "Invalid token" },
						{ status: 400 },
					),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await setPassword(canvasElement, "a long phrase to remember");
		await expect(
			await canvas.findByText("This link no longer works. Ask for a new one."),
		).toBeVisible();
	},
};

export const ServerFailed: Story = {
	parameters: {
		msw: {
			handlers: [
				http.post("/api/auth/reset-password", () =>
					HttpResponse.json(
						{ code: "INTERNAL_SERVER_ERROR", message: "Internal error" },
						{ status: 500 },
					),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await setPassword(canvasElement, "a long phrase to remember");
		await expect(
			await canvas.findByText(/Your password was not set/),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: "Report an issue" }),
		).toBeVisible();
	},
};
