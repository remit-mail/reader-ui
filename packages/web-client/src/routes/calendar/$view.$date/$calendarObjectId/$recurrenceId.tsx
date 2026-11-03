// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * One occurrence of a repeating event, under the series it belongs to. A
 * layout, so the occurrence's popup and its editor sit below it.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/calendar/$view/$date/$calendarObjectId/$recurrenceId",
)({
	component: Outlet,
});
