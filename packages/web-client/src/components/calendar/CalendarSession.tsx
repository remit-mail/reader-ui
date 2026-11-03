import type { RemitImapCalendarSchedulingSend } from "@remit/api-http-client/types.gen.ts";
import {
	createContext,
	type Dispatch,
	type MutableRefObject,
	useContext,
} from "react";
import type {
	DraftSession,
	SessionAction,
} from "../../hooks/calendar/draft-session";

/**
 * The calendar screen's one draft, handed to the sidebar the route mounts
 * below it. A context outside the route files, for the reason
 * `CalendarShell` gave: the generated tree imports routes relatively.
 */
export interface CalendarSessionValue {
	session: DraftSession;
	dispatch: Dispatch<SessionAction>;
	/** The sidebar's own close, asked by Esc; it confirms a touched draft. */
	requestClose: MutableRefObject<(() => void) | null>;
	/** The field quick-create had focus in when it expanded, by its label. */
	carriedFocus: MutableRefObject<string>;
	/** Focus the saved event once the grid draws it. */
	focusSaved: (calendarObjectId: string) => void;
	/** Follow the scheduling messages a save queued, and say which guests they missed. */
	trackSends: (sends: readonly RemitImapCalendarSchedulingSend[]) => void;
}

export const CalendarSessionContext =
	createContext<CalendarSessionValue | null>(null);

export function useCalendarSession(): CalendarSessionValue {
	const value = useContext(CalendarSessionContext);
	if (!value) throw new Error("the calendar session is not mounted");
	return value;
}

/** The session where a calendar screen holds one; a surface mounted alone has none. */
export function useOptionalCalendarSession(): CalendarSessionValue | null {
	return useContext(CalendarSessionContext);
}
