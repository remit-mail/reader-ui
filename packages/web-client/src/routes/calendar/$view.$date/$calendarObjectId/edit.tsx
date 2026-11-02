/**
 * The advanced sidebar on a stored event. `edit` is a literal, so the router
 * matches it ahead of an occurrence id.
 */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarEditEventSidebar } from "../../../../components/calendar/CalendarEventEditor";

function EditRoute() {
	const { calendarObjectId } = Route.useParams();
	return <CalendarEditEventSidebar calendarObjectId={calendarObjectId} />;
}

export const Route = createFileRoute(
	"/calendar/$view/$date/$calendarObjectId/edit",
)({
	component: EditRoute,
});
