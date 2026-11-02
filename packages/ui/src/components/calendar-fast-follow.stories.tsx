import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { CalendarEventPopupCard } from "./calendar-event-popup.js";
import { CalendarEventSidebar } from "./calendar-event-sidebar.js";
import {
	DefaultSenderSetting,
	type EntryKind,
	EventTaskSwitch,
	GuestList,
	GuestsField,
	InvitationsNotSent,
	type ReplyAnswer,
	ReplyGroup,
	SenderPicker,
	TaskPopupCard,
} from "./calendar-fast-follow.js";
import { CalendarQuickCreateCard } from "./calendar-quick-create.js";
import { CalendarSheet } from "./calendar-sheet.js";
import type { CalendarAttendee, EventDraft } from "./calendar-types.js";

const accounts = [
	{ id: "work", email: "matthijs@northwind.example" },
	{ id: "home", email: "matthijs@home.example" },
];

const attendees: CalendarAttendee[] = [
	{
		name: "Anna de Vries",
		email: "anna@northwind.example",
		rsvp: "accepted",
		role: "organizer",
	},
	{
		name: "Bram Jansen",
		email: "bram@northwind.example",
		rsvp: "noReply",
		role: "attendee",
	},
	{
		name: "Chris Peters",
		email: "chris@northwind.example",
		rsvp: "tentative",
		role: "attendee",
	},
];

const fields = {
	title: "Design review",
	range: {
		date: "2026-11-05",
		endDate: "2026-11-05",
		startTime: "14:00",
		endTime: "15:30",
		allDay: false,
	},
	location: "",
	calendarId: "work",
};

const calendars = [
	{
		id: "work",
		accountId: "a",
		accountLabel: "Work",
		name: "Work",
		color: "cal-1" as const,
	},
];

const card = (children: ReactNode) => (
	<div className="w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl">
		{children}
	</div>
);

function QuickCreate({
	guests: initial,
	kind: initialKind,
}: {
	guests: string[];
	kind: EntryKind;
}) {
	const [guests, setGuests] = useState(initial);
	const [entry, setEntry] = useState("");
	const [kind, setKind] = useState<EntryKind>(initialKind);
	const [sender, setSender] = useState("work");
	return card(
		<div className="flex flex-col gap-3 p-4">
			<EventTaskSwitch value={kind} onChange={setKind} />
			{kind === "event" ? (
				<>
					<GuestsField
						guests={guests}
						entry={entry}
						onEntry={setEntry}
						onAdd={(guest) => {
							setGuests([...guests, guest]);
							setEntry("");
						}}
						onRemove={(guest) =>
							setGuests(guests.filter((other) => other !== guest))
						}
					/>
					<SenderPicker
						accounts={accounts}
						value={sender}
						onChange={setSender}
					/>
				</>
			) : (
				<input
					type="date"
					aria-label="Due date"
					defaultValue="2026-11-05"
					className="h-9 rounded-md border border-line bg-surface-sunken px-2 text-sm"
				/>
			)}
			<CalendarQuickCreateCard
				headingId="ff"
				fields={fields}
				calendars={calendars}
				onChange={() => {}}
				onSave={() => {}}
				onMoreOptions={() => {}}
				onClose={() => {}}
				settingsHref="/settings/calendars"
			/>
		</div>,
	);
}

function Popup({ reply, failed }: { reply: boolean; failed: boolean }) {
	const [answer, setAnswer] = useState<ReplyAnswer | undefined>("maybe");
	return card(
		<CalendarEventPopupCard
			headingId="ff-popup"
			title="Quarterly planning"
			color="cal-1"
			when="Thursday, 5 November · 14:00 – 15:30"
			location="Room 3"
			calendarName="Work"
			availability="Busy"
			onEdit={() => {}}
			onDelete={() => {}}
			onClose={() => {}}
			failure={
				failed
					? {
							text: "Couldn't send your reply. Your old answer stands.",
							reportHref: "#",
							onRetry: () => {},
						}
					: undefined
			}
		>
			<GuestList attendees={attendees} />
			{reply && <ReplyGroup value={answer} onChange={setAnswer} />}
		</CalendarEventPopupCard>,
	);
}

const draft: EventDraft = {
	title: "Design review",
	date: "2026-11-05",
	startTime: "14:00",
	endDate: "2026-11-05",
	endTime: "15:30",
	allDay: false,
	calendarId: "work",
	location: "Room 3",
	guests: "",
	notes: "",
	repeat: "",
};

const meta = {
	title: "Design System/Calendar/Fast-follow",
	tags: ["proposed"],
	parameters: { layout: "padded" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const QuickCreateWithGuests: Story = {
	name: "Fast-follow quick-create with guests",
	render: () => (
		<QuickCreate guests={["anna@northwind.example"]} kind="event" />
	),
};

export const InvalidGuest: Story = {
	name: "Fast-follow invalid guest",
	render: () => (
		<QuickCreate guests={["anna@northwind.example", "bram@"]} kind="event" />
	),
};

export const QuickCreateTask: Story = {
	name: "Fast-follow quick-create task",
	render: () => <QuickCreate guests={[]} kind="task" />,
};

export const TaskSaveFailed: Story = {
	name: "Fast-follow task save failed",
	render: () =>
		card(
			<CalendarQuickCreateCard
				headingId="ff-task"
				fields={fields}
				calendars={calendars}
				onChange={() => {}}
				onSave={() => {}}
				onMoreOptions={() => {}}
				onClose={() => {}}
				settingsHref="/settings/calendars"
				failure={{
					text: "Couldn't save this task: the server didn't answer.",
					reportHref: "#",
					onRetry: () => {},
				}}
			/>,
		),
};

export const TaskPopup: Story = {
	name: "Fast-follow task popup",
	render: () =>
		card(
			<TaskPopupCard
				title="Send the quarterly numbers"
				due="Thursday, 5 November · 17:00"
				list="Work tasks"
				description="Finance needs them before the board meets."
				done={false}
				onToggleDone={() => {}}
			/>,
		),
};

export const EventPopupWithGuests: Story = {
	name: "Fast-follow event popup with guests",
	render: () => <Popup reply={false} failed={false} />,
};

export const EventPopupWithReply: Story = {
	name: "Fast-follow event popup with reply",
	render: () => <Popup reply failed={false} />,
};

export const ReplyFailed: Story = {
	name: "Fast-follow reply failed",
	render: () => <Popup reply failed />,
};

export const DeclinedEvent: Story = {
	name: "Fast-follow declined event",
	render: () => (
		<div className="w-48 rounded-sm border border-dashed border-cal-1 px-1.5 py-0.5 text-xs text-cal-1">
			<span className="line-through">Quarterly planning</span>
		</div>
	),
};

export const AdvancedWithGuests: Story = {
	name: "Fast-follow advanced sidebar with guests",
	render: () => (
		<div className="h-[760px] w-[26rem] border-l border-line">
			<CalendarEventSidebar
				heading="New event"
				draft={draft}
				onChange={() => {}}
				calendars={calendars}
				calendarEditable
				repeatEditable
				timeZone="Europe/Amsterdam"
				timeZones={["Europe/Amsterdam"]}
				onTimeZone={() => {}}
				busy
				onBusy={() => {}}
				onSave={() => {}}
				onCancel={() => {}}
			>
				<EventTaskSwitch value="event" onChange={() => {}} />
				<GuestsField
					guests={["anna@northwind.example"]}
					entry=""
					onEntry={() => {}}
					onAdd={() => {}}
					onRemove={() => {}}
				/>
				<SenderPicker accounts={accounts} value="work" onChange={() => {}} />
			</CalendarEventSidebar>
		</div>
	),
};

export const InvitationsNotSentBanner: Story = {
	name: "Fast-follow invitations not sent",
	render: () => (
		<InvitationsNotSent
			missed={["bram@northwind.example", "chris@northwind.example"]}
			onRetry={() => {}}
			onClose={() => {}}
			reportHref="#"
		/>
	),
};

export const PhoneQuickCreate: Story = {
	name: "Phone fast-follow quick-create sheet",
	globals: { viewport: { value: "mobile" } },
	render: () => (
		<CalendarSheet labelledBy="ff-phone" onDismiss={() => {}}>
			<div className="flex flex-col gap-3 p-4">
				<EventTaskSwitch value="event" onChange={() => {}} />
				<GuestsField
					guests={[]}
					entry=""
					onEntry={() => {}}
					onAdd={() => {}}
					onRemove={() => {}}
				/>
			</div>
			<CalendarQuickCreateCard
				headingId="ff-phone"
				fields={fields}
				calendars={calendars}
				onChange={() => {}}
				onSave={() => {}}
				onMoreOptions={() => {}}
				onClose={() => {}}
				settingsHref="/settings/calendars"
				touch
			/>
		</CalendarSheet>
	),
};

export const SettingsDefaultSender: Story = {
	name: "Fast-follow settings default sender",
	render: () => (
		<DefaultSenderSetting
			accounts={accounts}
			value="work"
			onChange={() => {}}
		/>
	),
};
