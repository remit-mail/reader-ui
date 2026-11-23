import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import "./i18n";
import { OfflineStartupFailure } from "./OfflineProvider";

const meta = {
	title: "Playground/Shipped/Downloads/Startup failure",
	component: OfflineStartupFailure,
	args: { onRemove: fn() },
} satisfies Meta<typeof OfflineStartupFailure>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IncompatibleDownloads: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByRole("alert")).toBeVisible();
		await expect(args.onRemove).not.toHaveBeenCalled();
		await userEvent.click(
			canvas.getByRole("button", { name: "Remove downloads and reload" }),
		);
		await expect(args.onRemove).toHaveBeenCalledOnce();
	},
};
