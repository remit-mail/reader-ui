import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch.js";

const meta: Meta<typeof Switch> = {
	title: "Design System/Primitives/Switch",
	component: Switch,
	parameters: { layout: "padded" },
	args: { "aria-label": "Use the model", onToggle: () => {} },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const On: Story = { args: { checked: true } };

export const Off: Story = { args: { checked: false } };

export const AriaDisabled: Story = {
	args: { checked: false, "aria-disabled": true },
};
