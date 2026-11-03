// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * The event itself — the series, where it repeats — in a popup over the grid.
 * An occurrence of it is the `$recurrenceId` segment beside this one.
 */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarEventPopup } from "../../../../components/calendar/CalendarEventPopup";

function CalendarEventRoute() {
	const { calendarObjectId } = Route.useParams();
	return <CalendarEventPopup calendarObjectId={calendarObjectId} />;
}

export const Route = createFileRoute(
	"/calendar/$view/$date/$calendarObjectId/",
)({
	component: CalendarEventRoute,
});
