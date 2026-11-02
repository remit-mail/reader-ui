// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/** One occurrence in a popup over the grid. */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarEventPopup } from "../../../../../components/calendar/CalendarEventPopup";

function OccurrenceRoute() {
	const { calendarObjectId, recurrenceId } = Route.useParams();
	return (
		<CalendarEventPopup
			calendarObjectId={calendarObjectId}
			recurrenceId={recurrenceId}
		/>
	);
}

export const Route = createFileRoute(
	"/calendar/$view/$date/$calendarObjectId/$recurrenceId/",
)({
	component: OccurrenceRoute,
});
