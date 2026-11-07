import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The reset page itself stands before the sign-in gate (`BetterAuthShell`). Once
 * the password is set and the reader signs in, the app opens at its start.
 */
export const Route = createFileRoute("/reset-password/$token")({
	beforeLoad: () => {
		throw redirect({ to: "/" });
	},
});
