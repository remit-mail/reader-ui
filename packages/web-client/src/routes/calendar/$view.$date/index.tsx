// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * The calendar with nothing open over it. A route so the event, the editor and
 * the composer arrive as segments beside it.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/calendar/$view/$date/")({
	component: () => null,
});
