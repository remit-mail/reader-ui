import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpamDailyChart } from "./spam-daily-chart.js";
import {
	notSpamDaysFixture,
	phishingDaysFixture,
	spamDaysFixture,
} from "./spam-fixtures.js";

const meta = {
	title: "Design System/Spam/SpamDailyChart",
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

/** Thirty days of spam, moved under warned. */
export const Spam: Story = {};

/** RFC gap 8: dots mark the days the reader marked mail Not spam. */
export const WithNotSpam: Story = { args: { notSpam: notSpamDaysFixture } };

/** Phishing takes the danger tone. */
export const Phishing: Story = {
	args: { title: "Phishing", tone: "danger", days: phishingDaysFixture },
};
