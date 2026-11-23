import { ErrorState } from "@remit/ui";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	Outlet,
} from "@tanstack/react-router";
import { type ReactNode, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ComposeProvider } from "../components/compose/ComposeProvider";
import { AppShellSkeleton } from "../components/layout/AppShellSkeleton";
import { BulkRunProvider } from "../components/mail/BulkRunProvider";
import { CheckAgainProvider } from "../components/mail/CheckAgainProvider";
import { RoleAppointmentPromptProvider } from "../components/mail/RoleAppointmentPromptProvider";
import { SelfUpdateOverlay } from "../components/self-update/SelfUpdateOverlay";
import { ErrorBannerProvider } from "../components/ui/ErrorBannerProvider";
import {
	FatalErrorOverlay,
	FatalErrorScreen,
} from "../components/ui/FatalErrorOverlay";
import { SignedOutOverlay } from "../components/ui/SignedOutOverlay";
import { SelfUpdateProvider } from "../hooks/use-system-update";
import { isUnauthenticated } from "../lib/error-classifier";
import { reportFatalError } from "../lib/fatal-error";
import { reportSignedOut } from "../lib/signed-out";
import type { RouterContext } from "../router";
import { getRuntimeConfig } from "../runtime-config";

const RootErrorComponent = ({ error, reset, info }: ErrorComponentProps) => {
	if (isUnauthenticated(error)) {
		reportSignedOut();
		return <SignedOutOverlay />;
	}
	// Loader failures stay on the route; only a render crash takes over the screen.
	if (!info?.componentStack)
		return (
			<ErrorState
				title="Couldn't load this page"
				error={error}
				onRetry={reset}
			/>
		);
	const fatal = reportFatalError(error, {
		recoverable: false,
		componentStack: info?.componentStack,
	});
	return <FatalErrorScreen fatal={fatal} />;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
	errorComponent: RootErrorComponent,
});

const SkipLink = () => {
	// Provide a string fallback so Suspense doesn't render the raw i18n key
	// while the common namespace is still loading over HTTP.
	const { t } = useTranslation("common", { useSuspense: false });

	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-canvas focus:text-fg focus:rounded-md"
		>
			{t("accessibility.skipToContent", "Skip to main content")}
		</a>
	);
};

const SelfUpdates = ({ children }: { children: ReactNode }) => {
	if (getRuntimeConfig().updateMode === "managed") return children;
	return (
		<SelfUpdateProvider>
			{children}
			<SelfUpdateOverlay />
		</SelfUpdateProvider>
	);
};

function RootLayout() {
	return (
		<ErrorBannerProvider>
			<RoleAppointmentPromptProvider>
				{/* A bulk run outlives the route that started it, so its owner sits
				    above the router rather than inside the list (#112). */}
				<BulkRunProvider>
					<CheckAgainProvider>
						<SelfUpdates>
							<ComposeProvider>
								<SkipLink />
								<main id="main-content" className="h-dvh overflow-hidden">
									<Suspense fallback={<AppShellSkeleton />}>
										<Outlet />
									</Suspense>
								</main>
							</ComposeProvider>
						</SelfUpdates>
					</CheckAgainProvider>
				</BulkRunProvider>
			</RoleAppointmentPromptProvider>
			<FatalErrorOverlay />
			<SignedOutOverlay />
		</ErrorBannerProvider>
	);
}
