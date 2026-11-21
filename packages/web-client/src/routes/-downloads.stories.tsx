// biome-ignore lint/style/useFilenamingConvention: TanStack Router ignored story prefix
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppStory } from "../mocks/story-frame/AppStory";

const meta = {
	title: "Playground/Shipped/Downloads/Mail",
	component: AppStory,
	args: { url: "/downloads" },
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const MissingMessage: Story = {
	args: { url: "/downloads/not-downloaded" },
};
