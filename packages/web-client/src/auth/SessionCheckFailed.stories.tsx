import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionCheckFailed } from "./SessionCheckFailed";

const meta = {
	title: "Playground/Shipped/Sign in/Session check failed",
	component: SessionCheckFailed,
	parameters: { layout: "fullscreen" },
	args: { error: new Error("Network disconnected"), onRetry: () => undefined },
} satisfies Meta<typeof SessionCheckFailed>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NetworkFailure: Story = {};
export const ServerFailure: Story = {
	args: { error: { status: 503, message: "Session service unavailable" } },
};
