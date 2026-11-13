import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpamDailyChart } from "./spam-daily-chart.js";
import { phishingDaysFixture, spamDaysFixture } from "./spam-fixtures.js";

const meta = {
	title: "Design System/Spam/SpamDailyChart",
	tags: ["proposed"],
	component: SpamDailyChart,
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
	args: { title: "Spam", tone: "warning", days: spamDaysFixture },
} satisfies Meta<typeof SpamDailyChart>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Thirty days of spam, moved under warned, with Not spam dots. */
export const Spam: Story = {};

/** Phishing takes the danger tone. */
export const Phishing: Story = {
	args: { title: "Phishing", tone: "danger", days: phishingDaysFixture },
};
