import type {
	PeopleOperationsCreatePasswordResetResponse,
	PeopleOperationsCreateStepUpResponse,
	PeopleOperationsListPeopleResponse,
	PeopleOperationsUpdatePersonResponse,
	RemitImapPerson,
} from "@remit/api-http-client/types.gen.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HttpHandler, HttpResponse, http } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld, NOW } from "../../mocks/story-frame/mail-world";

const DAY = 24 * 60 * 60 * 1000;

const you: RemitImapPerson = {
	userId: "user-you",
	email: "you@example.com",
	createdAt: NOW - 23 * DAY,
	lastSignInAt: NOW,
	sessionCount: 2,
	status: "Active",
	isCaller: true,
};

const person1: RemitImapPerson = {
	userId: "user-1",
	email: "person1@example.com",
	createdAt: NOW - 21 * DAY,
	lastSignInAt: NOW - 2 * DAY,
	sessionCount: 1,
	status: "Active",
	isCaller: false,
};

const person2: RemitImapPerson = {
	userId: "user-2",
	email: "person2@example.com",
	createdAt: NOW - 15 * DAY,
	lastSignInAt: NOW - 4 * DAY,
	sessionCount: 0,
	status: "Disabled",
	isCaller: false,
};

const RESET_URL = "https://mail.example.com/reset-password/q8Zr2w1kVb0x";

const listPeople = http.get("/api/people", () =>
	HttpResponse.json<PeopleOperationsListPeopleResponse>({
		people: [you, person1, person2],
	}),
);

const stepUp = http.post("/api/people/step-up", () =>
	HttpResponse.json<PeopleOperationsCreateStepUpResponse>({
		stepUpToken: "step-up-token",
		expiresAt: NOW + 5 * 60 * 1000,
	}),
);

const disable = http.patch("/api/people/:userId", () =>
	HttpResponse.json<PeopleOperationsUpdatePersonResponse>({
		...person1,
		status: "Disabled",
		sessionCount: 0,
	}),
);

const resetLink = http.post("/api/people/:userId/password-reset", () =>
	HttpResponse.json<PeopleOperationsCreatePasswordResetResponse>({
		person: { ...person1, sessionCount: 0 },
		resetUrl: RESET_URL,
		expiresAt: NOW + DAY,
	}),
);

const handlers = (...people: HttpHandler[]): HttpHandler[] => [
	listPeople,
	...people,
	...mailHandlers(mailWorld()),
];

const meta = {
	title: "Playground/Shipped/Settings/People",
	component: AppStory,
	args: { url: "/settings/people" },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: handlers(stepUp, disable, resetLink) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

const openMenu = async (canvasElement: HTMLElement, email: string) => {
	const canvas = within(canvasElement);
	await userEvent.click(
		await canvas.findByRole("button", { name: `Actions for ${email}` }),
	);
};

const confirmWithPassword = async (canvasElement: HTMLElement) => {
	const dialog = within(await within(canvasElement).findByRole("dialog"));
	await userEvent.type(
		dialog.getByLabelText("Your password"),
		"correct horse battery",
	);
	await userEvent.click(
		dialog.getByRole("button", { name: /Disable|Make a reset link/ }),
	);
};

export const List: Story = {};

export const RowMenu: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await openMenu(canvasElement, "you@example.com");
		await expect(
			canvas.getByRole("button", { name: /Disable/ }),
		).toBeDisabled();
	},
};

export const ConfirmDisable: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await openMenu(canvasElement, "person1@example.com");
		await userEvent.click(
			await canvas.findByRole("button", { name: "Disable" }),
		);
	},
};

export const ResetLink: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await openMenu(canvasElement, "person1@example.com");
		await userEvent.click(
			await canvas.findByRole("button", { name: "Reset password" }),
		);
		await confirmWithPassword(canvasElement);
		await expect(
			await canvas.findByDisplayValue(RESET_URL),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole("dialog", {
				name: "Reset link for person1@example.com",
			}),
		).toBeVisible();
	},
};

export const WrongPassword: Story = {
	parameters: {
		msw: {
			handlers: handlers(
				http.post("/api/people/step-up", () =>
					HttpResponse.json(
						{ code: "wrong_password", message: "Wrong password" },
						{ status: 403 },
					),
				),
			),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await openMenu(canvasElement, "person1@example.com");
		await userEvent.click(
			await canvas.findByRole("button", { name: "Disable" }),
		);
		await confirmWithPassword(canvasElement);
		await expect(
			await canvas.findByText("That is not your password. Try again."),
		).toBeVisible();
	},
};

export const ActionFailed: Story = {
	parameters: {
		msw: {
			handlers: handlers(
				stepUp,
				http.patch("/api/people/:userId", () => HttpResponse.error()),
			),
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await openMenu(canvasElement, "person1@example.com");
		await userEvent.click(
			await canvas.findByRole("button", { name: "Disable" }),
		);
		await confirmWithPassword(canvasElement);
		await expect(
			await canvas.findByText("person1@example.com was not disabled"),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: "Report an issue" }),
		).toBeVisible();
	},
};

export const Hidden: Story = {
	parameters: { msw: { handlers: mailHandlers(mailWorld()) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText(/This server has no People page/),
		).toBeVisible();
		await expect(canvas.queryByRole("button", { name: "People" })).toBeNull();
	},
};
