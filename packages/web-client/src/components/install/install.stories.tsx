import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";

function browser(userAgent: string, touchPoints = 0, dismissed = false) {
	return () => {
		const originalUA = Object.getOwnPropertyDescriptor(navigator, "userAgent");
		const originalTouch = Object.getOwnPropertyDescriptor(
			navigator,
			"maxTouchPoints",
		);
		const originalDismissed = localStorage.getItem("remit.installDismissed");
		Object.defineProperty(navigator, "userAgent", {
			configurable: true,
			value: userAgent,
		});
		Object.defineProperty(navigator, "maxTouchPoints", {
			configurable: true,
			value: touchPoints,
		});
		if (dismissed) localStorage.setItem("remit.installDismissed", "true");
		else localStorage.removeItem("remit.installDismissed");
		return () => {
			if (originalUA) Object.defineProperty(navigator, "userAgent", originalUA);
			else Reflect.deleteProperty(navigator, "userAgent");
			if (originalTouch)
				Object.defineProperty(navigator, "maxTouchPoints", originalTouch);
			else Reflect.deleteProperty(navigator, "maxTouchPoints");
			if (originalDismissed === null)
				localStorage.removeItem("remit.installDismissed");
			else localStorage.setItem("remit.installDismissed", originalDismissed);
		};
	};
}

const mac =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
const meta = {
	title: "Playground/Shipped/Mail/Install",
	component: AppStory,
	args: { url: "/mail/brief", pwaEnabled: true },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(mailWorld()) },
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Chromium: Story = {
	beforeEach: browser(
		"Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole("navigation", { name: "Mailboxes" });
		await expect(
			canvas.queryByRole("button", { name: "Install app" }),
		).toBeNull();
		window.dispatchEvent(
			Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
				prompt: async () => undefined,
				userChoice: Promise.resolve({ outcome: "accepted" }),
			}),
		);
		await expect(
			await canvas.findByRole("button", { name: "Install app" }),
		).toBeVisible();
	},
};

export const IosHint: Story = {
	globals: { viewport: { value: "mobile" } },
	// iPadOS presents itself as macOS; touch points distinguish it.
	beforeEach: browser(mac, 5),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(await canvas.findByRole("button", { name: "Menu" }));
		await userEvent.click(
			await canvas.findByRole("button", { name: "Install app" }),
		);
		const hint = await canvas.findByRole("dialog", { name: "Install app" });
		await expect(canvas.queryByRole("dialog", { name: "Folders" })).toBeNull();
		await expect(
			within(hint).getByRole("button", { name: "Got it" }),
		).toHaveFocus();
		await expect(within(hint).getByText("Tap Share in Safari.")).toBeVisible();
		await expect(
			within(hint).getByText("Choose Add to Home Screen."),
		).toBeVisible();
	},
};

export const MacosSafariHint: Story = {
	beforeEach: browser(mac),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Install app" }),
		);
		const hint = await canvas.findByRole("dialog", { name: "Install app" });
		await expect(
			within(hint).getByText("Open the File menu in Safari."),
		).toBeVisible();
		await expect(within(hint).getByText("Choose Add to Dock.")).toBeVisible();
	},
};

export const Hidden: Story = {
	beforeEach: browser("Mozilla/5.0 (Macintosh) Gecko/20100101 Firefox/132.0"),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole("navigation", { name: "Mailboxes" });
		await expect(
			canvas.queryByRole("button", { name: "Install app" }),
		).toBeNull();
	},
};

export const RestoreFromSettings: Story = {
	args: { url: "/settings/advanced" },
	beforeEach: browser(mac, 0, true),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Show install option again" }),
		);
		await expect(
			canvas.queryByText("The install option is hidden on this device."),
		).toBeNull();
		await expect(localStorage.getItem("remit.installDismissed")).toBeNull();
		await userEvent.click(canvas.getByRole("button", { name: "Back to mail" }));
		await expect(
			await canvas.findByRole("button", { name: "Install app" }),
		).toBeVisible();
	},
};

export const PwaDisabled: Story = {
	args: { pwaEnabled: false },
	beforeEach: browser(mac),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole("navigation", { name: "Mailboxes" });
		await expect(
			canvas.queryByRole("button", { name: "Install app" }),
		).toBeNull();
	},
};
