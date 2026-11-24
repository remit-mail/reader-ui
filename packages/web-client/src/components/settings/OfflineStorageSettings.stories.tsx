import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import "../../lib/i18n";
import { OfflineStorageRow } from "./OfflineStorageSettings";

const meta = {
	title: "Playground/Shipped/Settings/Advanced/Downloads",
	component: OfflineStorageRow,
	args: { usage: 12582912, onRemove: fn() },
} satisfies Meta<typeof OfflineStorageRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Downloads: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText("Downloaded mail: 12.0 MiB used"),
		).toBeVisible();
		await expect(args.onRemove).not.toHaveBeenCalled();
		await userEvent.click(
			canvas.getByRole("button", { name: "Remove downloads" }),
		);
		await expect(args.onRemove).toHaveBeenCalledOnce();
		await expect(
			canvas.queryByText(/Session verified|may be removed|Keep downloads/),
		).toBeNull();
	},
};

export const BackgroundRefresh: Story = {
	args: { refreshOff: false, onDisableRefresh: fn() },
	play: async ({ canvasElement, args }) => {
		await userEvent.click(
			within(canvasElement).getByRole("button", {
				name: "Turn off background refresh",
			}),
		);
		await expect(args.onDisableRefresh).toHaveBeenCalledOnce();
	},
};

export const BackgroundRefreshOff: Story = {
	args: { refreshOff: true },
};
