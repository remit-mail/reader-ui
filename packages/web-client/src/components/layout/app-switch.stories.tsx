import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { mailWorld } from "../../mocks/story-frame/mail-world";

const meta = {
	title: "Playground/Shipped/Calendar/App switch",
	component: AppStory,
	args: { url: "/mail/brief" },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: mailHandlers(mailWorld()) },
	},
	globals: { viewport: { value: "desktop", isRotated: false } },
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

const page = () => within(document.body);

export const MailWithAppBar: Story = {
	name: "Mail with app bar",
	play: async () => {
		const apps = await page().findByRole("navigation", { name: "Apps" });
		await expect(
			within(apps).getByRole("link", { name: "Mail" }),
		).toHaveAttribute("aria-current", "page");
		await expect(
			within(apps).getByRole("link", { name: "Calendar" }),
		).not.toHaveAttribute("aria-current");
		const folders = await page().findByRole("navigation", {
			name: "Mailboxes",
		});
		await expect(
			within(folders).queryByRole("link", { name: "Calendar" }),
		).toBeNull();
	},
};

export const PhoneMailWithTabBar: Story = {
	name: "Phone mail with tab bar",
	globals: { viewport: { value: "mobile", isRotated: false } },
	play: async () => {
		const apps = await page().findByRole("navigation", { name: "Apps" });
		const calendar = within(apps).getByRole("link", { name: "Calendar" });
		await expect(
			within(apps).getByRole("link", { name: "Mail" }),
		).toHaveAttribute("aria-current", "page");
		const box = calendar.getBoundingClientRect();
		await expect(box.width).toBeGreaterThanOrEqual(44);
		await expect(box.height).toBeGreaterThanOrEqual(44);
	},
};
