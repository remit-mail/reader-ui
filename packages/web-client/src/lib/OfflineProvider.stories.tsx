import type { Meta, StoryObj } from "@storybook/react-vite";
import { OfflineStatus } from "./OfflineProvider";

const meta = {
	title: "Playground/Shipped/Downloads/Status",
	component: OfflineStatus,
	args: {
		verified: false,
		usage: 12582912,
		quota: 1073741824,
		persistent: false,
		onVerify: () => undefined,
		onPersist: () => undefined,
		onRemove: () => undefined,
	},
} satisfies Meta<typeof OfflineStatus>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SessionUnverified: Story = {};
export const Verified: Story = { args: { verified: true, persistent: true } };
export const SaveFailed: Story = {
	args: {
		error:
			"Storage quota exceeded. This part is not saved for offline reading.",
	},
};
