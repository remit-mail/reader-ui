/**
 * /calendar — a screen of its own beside /mail, inside the same app frame.
 *
 * The layout owns the first-run guard and nothing else: a reader with no
 * account belongs in onboarding. The view below it draws the toolbar, the side
 * pane and the grid.
 */

import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { ErrorState } from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppFrame } from "../components/layout/AppFrame";
import { AppShellSkeleton } from "../components/layout/AppShellSkeleton";
import "../lib/client";

export const Route = createFileRoute("/calendar")({
	loader: ({ context: { queryClient } }) => {
		void queryClient.prefetchQuery(configOperationsGetConfigOptions());
	},
	component: CalendarLayout,
});

function CalendarLayout() {
	const navigate = useNavigate();
	const {
		data: config,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: Infinity,
	});

	const hasNoAccounts = Boolean(config && (config.accounts?.length ?? 0) === 0);
	useEffect(() => {
		if (!hasNoAccounts) return;
		navigate({ to: "/onboarding", replace: true });
	}, [hasNoAccounts, navigate]);

	if (isError) {
		return (
			<div className="flex h-full items-center justify-center bg-canvas p-4">
				<ErrorState
					title="Couldn't load your account"
					error={error}
					onRetry={() => {
						refetch();
					}}
				/>
			</div>
		);
	}

	return (
		<AppFrame>
			{isLoading || hasNoAccounts ? <AppShellSkeleton /> : <Outlet />}
		</AppFrame>
	);
}
