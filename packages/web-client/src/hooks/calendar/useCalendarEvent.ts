/**
 * One stored resource — the bytes behind an event, and the etag a conditional
 * write is built on.
 *
 * The listing carries what a grid chip draws; this carries what an edit needs.
 * An event opened for editing is read here first, so the `If-Match` a write
 * sends is the version the reader actually looked at rather than whatever the
 * grid last cached.
 */
import { calendarEventDetailOperationsGetCalendarEventOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapCalendarEventResponse } from "@remit/api-http-client/types.gen.ts";
import { useQuery } from "@tanstack/react-query";

export interface CalendarEventResource {
	resource: RemitImapCalendarEventResponse | undefined;
	isLoading: boolean;
	error: unknown;
	refetch: () => void;
}

export function useCalendarEvent(
	calendarObjectId: string,
	calendarId: string,
): CalendarEventResource {
	const { data, isLoading, error, refetch } = useQuery({
		...calendarEventDetailOperationsGetCalendarEventOptions({
			path: { calendarObjectId },
			query: { calendarId },
		}),
		enabled: calendarObjectId !== "" && calendarId !== "",
	});

	return {
		resource: data,
		isLoading,
		error,
		refetch: () => {
			refetch();
		},
	};
}
