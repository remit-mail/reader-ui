/**
 * /calendar/{view}/{date}/new — the advanced sidebar on a new event.
 *
 * `start` and `end` hold the draft's range (R2): changing them mounts nothing
 * new, and a reload comes back on the same range. The typed fields travel in
 * memory and do not survive a reload.
 */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarNewEventSidebar } from "../../../components/calendar/CalendarEventEditor";
import { newEventSearchSchema } from "../../../lib/new-event-range";

export const Route = createFileRoute("/calendar/$view/$date/new")({
	validateSearch: newEventSearchSchema,
	component: CalendarNewEventSidebar,
});
