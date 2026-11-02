import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import {
	AppBar,
	type AppId,
	type AppSwitchItem,
	AppTabBar,
} from "./app-switcher.js";

const items: AppSwitchItem[] = [
	{ id: "mail", label: "Mail", href: "/mail" },
	{ id: "calendar", label: "Calendar", href: "/calendar" },
];

function Switcher({
	initial,
	variant,
}: {
	initial: AppId;
	variant: "bar" | "tabs";
}) {
	const [active, setActive] = useState<AppId>(initial);
	const Component = variant === "bar" ? AppBar : AppTabBar;
	return <Component items={items} active={active} onNavigate={setActive} />;
}

const meta = {
	title: "Design System/Navigation/App switcher",
	tags: ["proposed"],
	component: Switcher,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Switcher>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AppBarOnMail: Story = {
	args: { initial: "mail", variant: "bar" },
	decorators: [
		(Story) => (
			<div className="flex h-96">
				<Story />
			</div>
		),
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const mail = canvas.getByRole("link", { name: "Mail" });
		await expect(mail).toHaveAttribute("aria-current", "page");
		mail.focus();
		await userEvent.keyboard("{ArrowDown}");
		await expect(canvas.getByRole("link", { name: "Calendar" })).toHaveFocus();
	},
};

export const TabBarOnCalendar: Story = {
	args: { initial: "calendar", variant: "tabs" },
	globals: { viewport: { value: "mobile" } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("link", { name: "Calendar" }),
		).toHaveAttribute("aria-current", "page");
	},
};
