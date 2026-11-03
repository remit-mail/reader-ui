import { CalendarSenderField, formatErrorMessage } from "@remit/ui";
import { useState } from "react";
import { useCalendarSenders } from "../../hooks/calendar";
import { calendarEventReportHref } from "../../lib/calendar-report";

/** Settings, Calendars, Invitations: the account invitations go out from by default. */
export function CalendarDefaultSenderCard() {
	const { senders, defaultSenderId, setDefaultSender } = useCalendarSenders();
	const [problem, setProblem] = useState("");
	if (senders.length === 0) return null;
	return (
		<section
			aria-labelledby="calendar-default-sender"
			className="space-y-2 rounded-sm border border-line bg-surface p-4"
		>
			<h2 id="calendar-default-sender" className="text-sm font-semibold">
				Invitations: default sender
			</h2>
			<p className="text-sm text-fg-muted">
				Invitations, updates and cancellations go out from this account unless
				you pick another on the event.
			</p>
			<CalendarSenderField
				label="Default sender"
				senders={senders}
				value={defaultSenderId}
				onChange={(accountId) => {
					setProblem("");
					void setDefaultSender(accountId).catch((error: unknown) =>
						setProblem(formatErrorMessage(error)),
					);
				}}
			/>
			{problem !== "" && (
				<p role="alert" className="text-sm text-danger">
					Couldn't save the default sender: {problem}{" "}
					<a
						href={calendarEventReportHref(problem)}
						target="_blank"
						rel="noreferrer"
						className="font-medium text-accent hover:underline"
					>
						Report an issue
					</a>
				</p>
			)}
		</section>
	);
}
