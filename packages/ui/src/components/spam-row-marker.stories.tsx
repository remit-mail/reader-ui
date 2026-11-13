import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ThreadRowData } from "./app-shell-types.js";
import { ComfortableRowBody, comfortableRowClass } from "./message-row.js";
import { phishingLabelFixture, spamLabelFixture } from "./spam-fixtures.js";
import { SpamRowMarker, type SpamRowMarkerProps } from "./spam-row-marker.js";

const row = (id: string, fromName: string): ThreadRowData => ({
	id,
	fromName,
	fromEmail: "sender@example.com",
	subject: "Subject line",
	snippet: "Snippet of the first line of the body",
	timeLabel: "09:14",
	isRead: true,
});

function RowsPreview({ action }: { action: SpamRowMarkerProps["action"] }) {
	const rows: {
		thread: ThreadRowData;
		marker?: SpamRowMarkerProps["label"];
	}[] = [
		{ thread: row("1", "Sender name") },
		{ thread: row("2", "Sender name"), marker: spamLabelFixture },
		{ thread: row("3", "Display name"), marker: phishingLabelFixture },
		{ thread: row("4", "Sender name") },
	];
	return (
		<ul className="w-[400px] list-none divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
			{rows.map(({ thread, marker }) => (
				<li key={thread.id} className={comfortableRowClass({})}>
					<ComfortableRowBody
						thread={thread}
						badge={
							marker ? <SpamRowMarker label={marker} action={action} /> : null
						}
					/>
				</li>
			))}
		</ul>
	);
}

const meta = {
	title: "Design System/Spam/SpamRowMarker",
	component: SpamRowMarker,
	parameters: { layout: "centered" },
	args: { label: spamLabelFixture, action: "Warn" },
	render: (args) => <RowsPreview action={args.action} />,
} satisfies Meta<typeof SpamRowMarker>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Remit warned and left the message in place: the chip, then Suspected. */
export const Warned: Story = {};

/** Remit moved the message to Spam: the chip alone. */
export const Moved: Story = { args: { action: "Junk" } };
