import {
	CalendarList,
	CalendarSidePane,
	datesFrom,
	MiniMonth,
	weekStart,
} from "@remit/ui";
import { type Ref, useState } from "react";
import { selectCalendarIds, useCalendars } from "../../hooks/calendar";
import { isoDate } from "../../lib/calendar-route";
import { useCalendarAddress, useCalendarNavigation } from "../../routing";
import { CalendarLoadFailed } from "./CalendarLoadFailed";

export const CALENDAR_SIDE_PANE_ID = "calendar-side-pane";

/** The days the grid draws, inclusive, for the mini month's shading. */
function rangeOnGrid(view: string, date: string): [string, string] {
	if (view === "day") return [date, date];
	if (view === "week") {
		const days = datesFrom(weekStart(date), 7);
		return [days[0], days[6]];
	}
	return ["", ""];
}

export interface CalendarNavPaneProps {
	onNewEvent: () => void;
	newEventRef?: Ref<HTMLButtonElement>;
	/** After a day is picked, as the phone slide-over closes on it. */
	onPicked?: () => void;
	className?: string;
}

/** New event, the mini month and My calendars, bound to the address. */
export function CalendarNavPane({
	onNewEvent,
	newEventRef,
	onPicked,
	className,
}: CalendarNavPaneProps) {
	const { view, date, calendarIds } = useCalendarAddress();
	const { goToDate, setCalendarIds } = useCalendarNavigation();
	const { calendars, error, retry } = useCalendars();
	const [shown, setShown] = useState({ for: date, month: date });
	const month = shown.for === date ? shown.month : date;
	const [rangeStart, rangeEnd] = rangeOnGrid(view, date);
	const visible = new Set(selectCalendarIds(calendars, calendarIds));

	const toggle = (calendarId: string) => {
		const next = new Set(visible);
		if (next.has(calendarId)) next.delete(calendarId);
		else next.add(calendarId);
		setCalendarIds(
			next.size === calendars.length
				? []
				: calendars.map((calendar) => calendar.id).filter((id) => next.has(id)),
		);
	};

	return (
		<CalendarSidePane
			id={CALENDAR_SIDE_PANE_ID}
			className={className}
			onNewEvent={onNewEvent}
			newEventRef={newEventRef}
			month={
				<MiniMonth
					month={month}
					today={isoDate(new Date())}
					rangeStart={rangeStart}
					rangeEnd={rangeEnd}
					onPickDay={(day) => {
						goToDate(day);
						onPicked?.();
					}}
					onShowMonth={(next) => setShown({ for: date, month: next })}
				/>
			}
			calendars={
				error !== null && calendars.length === 0 ? (
					<CalendarLoadFailed
						title="Couldn't load your calendars"
						error={error}
						onRetry={retry}
						compact
					/>
				) : (
					<CalendarList
						calendars={calendars}
						visible={visible}
						onToggle={toggle}
						onToggleAccount={(accountId, nextVisible) => {
							const inAccount = new Set(
								calendars
									.filter((calendar) => calendar.accountId === accountId)
									.map((calendar) => calendar.id),
							);
							const next = calendars
								.map((calendar) => calendar.id)
								.filter((id) =>
									inAccount.has(id) ? nextVisible : visible.has(id),
								);
							setCalendarIds(next.length === calendars.length ? [] : next);
						}}
					/>
				)
			}
		/>
	);
}
