import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
	CalendarGuestsField,
	CalendarInvitationsNotSent,
} from "./calendar-guests.js";

const meta = {
	title: "Design System/Calendar/Guests field",
	component: CalendarGuestsField,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="w-[24rem]">
				<Story />
			</div>
		),
	],
	args: {
		value: "",
		onChange: () => {},
		suggestions: [{ email: "guest@example.com", name: "Guest name" }],
		onQuery: () => {},
	},
} satisfies Meta<typeof CalendarGuestsField>;
export default meta;

type Story = StoryObj<typeof meta>;

const Live = (args: Story["args"]) => {
	const [value, setValue] = useState(args?.value ?? "");
	return (
		<CalendarGuestsField
			value={value}
			onChange={setValue}
			suggestions={args?.suggestions ?? []}
			onQuery={() => {}}
		/>
	);
};

export const Empty: Story = { render: (args) => <Live {...args} /> };

export const WithGuests: Story = {
	args: { value: "sender@example.com, Guest name <guest@example.com>" },
	render: (args) => <Live {...args} />,
};

export const InvalidGuest: Story = {
	args: { value: "sender@example.com, not-an-email" },
	render: (args) => <Live {...args} />,
};

export const InvitationsNotSent: Story = {
	render: () => (
		<CalendarInvitationsNotSent
			missed={["sender@example.com"]}
			onRetry={() => {}}
			reportHref="#"
			onDismiss={() => {}}
		/>
	),
};
