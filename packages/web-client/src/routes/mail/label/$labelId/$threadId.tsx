/**
 * /mail/label/$labelId/$threadId — a conversation open in the label list's
 * reading pane. A layout, because the message segment nests under it.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mail/label/$labelId/$threadId")({
	component: Outlet,
});
