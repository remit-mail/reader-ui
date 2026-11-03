/**
 * Moving or resizing a stored event by dragging it on the grid.
 *
 * The drop is a write like any other: it reads the stored version first, so
 * the `If-Match` it sends is the one that is stored now, and a conflict comes
 * back as an outcome the grid states.
 */
import { calendarEventDetailOperationsGetCalendarEventOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	type CalendarEventData,
	type CalendarSlotPick,
	formatErrorMessage,
	type RecurrenceScope,
} from "@remit/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { softErrorStatuses } from "../../lib/error-classifier";
import { draftFromEvent, patchFromDrafts } from "./draft";
import {
	deviceTimeZone,
	readCalendarInstanceId,
	UNZONED_CALENDAR,
} from "./instance";
import { storedAnchorZone } from "./resource";
import {
	type CalendarWriteOutcome,
	useCalendarWrites,
} from "./useCalendarWrites";

export type MoveEvent = (
	event: CalendarEventData,
	range: CalendarSlotPick,
	scope: RecurrenceScope | undefined,
	collectionZone: string,
) => Promise<CalendarWriteOutcome>;

export function useMoveEvent(): MoveEvent {
	const queryClient = useQueryClient();
	const { updateEvent } = useCalendarWrites();
	return useCallback(
		async (event, range, scope, collectionZone) => {
			const { calendarObjectId, recurrenceId } = readCalendarInstanceId(
				event.id,
			);
			const resource = await queryClient
				.fetchQuery({
					...calendarEventDetailOperationsGetCalendarEventOptions({
						path: { calendarObjectId },
						query: { calendarId: event.calendarId },
					}),
					meta: softErrorStatuses(404),
					staleTime: 0,
				})
				.catch((error: unknown) => ({ unread: formatErrorMessage(error) }));
			if ("unread" in resource)
				return { kind: "refused", message: resource.unread };
			const before = draftFromEvent(event, {
				repeat: "",
				location: "",
				notes: "",
			});
			const after = {
				...before,
				date: range.date,
				endDate: range.endDate,
				startTime: range.startTime,
				endTime: range.endTime,
				allDay: range.allDay,
			};
			const patch = patchFromDrafts(before, after, {
				clock: deviceTimeZone(),
				anchor: storedAnchorZone(
					resource.icalData,
					collectionZone === "" ? UNZONED_CALENDAR : collectionZone,
				),
			});
			if (!patch.ok) return { kind: "refused", message: patch.problem };
			return updateEvent(
				{
					calendarObjectId,
					calendarId: event.calendarId,
					recurrenceId,
					scope,
					etag: resource.etag,
				},
				patch.patch,
			);
		},
		[queryClient, updateEvent],
	);
}
