/** The advanced sidebar on one occurrence of a repeating event. */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarEditEventSidebar } from "../../../../../components/calendar/CalendarEventEditor";

function OccurrenceEditRoute() {
	const { calendarObjectId, recurrenceId } = Route.useParams();
	return (
		<CalendarEditEventSidebar
			calendarObjectId={calendarObjectId}
			recurrenceId={recurrenceId}
		/>
	);
}

export const Route = createFileRoute(
	"/calendar/$view/$date/$calendarObjectId/$recurrenceId/edit",
)({
	component: OccurrenceEditRoute,
});
