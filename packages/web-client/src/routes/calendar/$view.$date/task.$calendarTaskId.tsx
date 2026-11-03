// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * /calendar/{view}/{date}/task/{calendarTaskId} — a task in a popup over the
 * grid. A task is its own resource, so it has its own segment rather than
 * sharing the event's.
 */
import { createFileRoute } from "@tanstack/react-router";
import { CalendarTaskPopup } from "../../../components/calendar/CalendarTaskPopup";

function CalendarTaskRoute() {
	const { calendarTaskId } = Route.useParams();
	return <CalendarTaskPopup calendarTaskId={calendarTaskId} />;
}

export const Route = createFileRoute(
	"/calendar/$view/$date/task/$calendarTaskId",
)({
	component: CalendarTaskRoute,
});
