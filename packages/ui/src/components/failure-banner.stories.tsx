import type { Meta, StoryObj } from "@storybook/react-vite";
import { FailureBanner } from "./failure-banner.js";

const meta = {
	title: "Design System/Settings/FailureBanner",
	component: FailureBanner,
	parameters: { layout: "padded" },
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
	args: {
		title: "The daily limit was not saved",
		message: "The server answered 500 Internal Server Error.",
		reportHref: "https://github.com/remit-mail/reader/issues/new",
	},
} satisfies Meta<typeof FailureBanner>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A failure with a report link and nothing to retry. */
export const Default: Story = {};

/** A failure the reader can retry from the banner. */
export const WithRetry: Story = { args: { onRetry: () => undefined } };
