import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { Fragment, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installAuthInterceptor } from "../auth/auth-interceptor";
import { type AuthProvider, AuthProviderProvider } from "../auth/provider";
import { InstallProvider } from "../components/install/InstallProvider";
import { install as installConsoleErrorCatcher } from "../lib/console-errors";
import { setFatalErrorTelemetry } from "../lib/fatal-error";
import { NetworkError } from "../lib/network-error";
import { OfflineProvider } from "../lib/OfflineProvider";
import {
	getOfflineRuntime,
	installOfflineRuntime,
	type OfflineOptions,
} from "../lib/offline-runtime";
import { installPwaUpdateCoordinator } from "../lib/pwa-update";
import {
	handleMutationCacheError,
	handleQueryCacheError,
} from "../lib/query-error-handler";
import { initRum } from "../lib/rum-adapter";
import { installStaleBuildReload } from "../lib/stale-build";
import { TelemetryContext } from "../lib/telemetry-context";
import { installThemeSync } from "../lib/theme";
import { createAppRouter } from "../router";
import { getRuntimeConfig } from "../runtime-config";
import { type SettingsSlot, SettingsSlotsProvider } from "../settings-slots";
import "../lib/i18n";
import "../index.css";
import { installPwaBuildObservation } from "../lib/client";

export interface MountOptions {
	/** The identity system this build composes. */
	authProvider: AuthProvider;
	/** Opt-in durable tenant downloads; host owns fresh session verification. */
	offline?: OfflineOptions;
	/** Settings sections the host adds, each at `/settings/<id>`. */
	settingsSlots?: SettingsSlot[];
	/** Element to mount into. Defaults to `#root`. */
	rootElementId?: string;
}

/**
 * Boot the web client against a composed auth provider. This is the app shell:
 * providers, router, telemetry, and the global fail-fast query wiring — every
 * primitive a deployment shares, with the identity system supplied by the
 * distributor rather than baked in.
 */
export const mountApp = ({
	authProvider,
	offline,
	settingsSlots = [],
	rootElementId = "root",
}: MountOptions): void => {
	installConsoleErrorCatcher();
	installThemeSync();
	authProvider.configure();
	installAuthInterceptor(authProvider);

	const telemetry = initRum();
	// Plug the live telemetry adapter into the single fatal-error seam.
	setFatalErrorTelemetry(telemetry);

	// Authentication refusals go to the session notice; request owners show other errors inline.
	const queryClient = new QueryClient({
		queryCache: new QueryCache({ onError: handleQueryCacheError }),
		mutationCache: new MutationCache({
			onError: handleMutationCacheError,
			onMutate: async () => {
				const runtime = getOfflineRuntime();
				if (runtime)
					await runtime.authorizeNetwork("write").catch((error: unknown) => {
						throw new NetworkError(error);
					});
			},
		}),
		defaultOptions: {
			mutations: { networkMode: offline ? "always" : "online", retry: false },
			queries: {
				staleTime: 30_000,
				gcTime: offline ? Infinity : 5 * 60_000,
				retry: 1,
			},
		},
	});

	if (
		import.meta.env.PROD &&
		typeof __REMIT_PWA_ENABLED__ !== "undefined" &&
		__REMIT_PWA_ENABLED__ &&
		"serviceWorker" in navigator
	) {
		installPwaBuildObservation();
		installPwaUpdateCoordinator(() => queryClient.isMutating() > 0);
	} else {
		installStaleBuildReload(() => queryClient.isMutating() > 0);
	}

	const offlineRuntime = offline ? installOfflineRuntime(offline) : undefined;
	const router = createAppRouter(queryClient, telemetry);
	for (const slot of settingsSlots) {
		if (Object.hasOwn(router.routesByPath, `/settings/${slot.id}`)) {
			throw new Error(
				`Settings slot "${slot.id}" collides with a built-in settings section`,
			);
		}
	}
	telemetry.recordPageView(window.location.pathname);

	const rootElement = document.getElementById(rootElementId);
	if (!rootElement) {
		throw new Error(`Root element not found: #${rootElementId}`);
	}

	const Provider = authProvider.Provider ?? Fragment;
	const Gate = authProvider.SessionGate ?? authProvider.Shell;
	const app = <RouterProvider router={router} />;

	createRoot(rootElement).render(
		<StrictMode>
			<TelemetryContext.Provider value={telemetry}>
				<QueryClientProvider client={queryClient}>
					<AuthProviderProvider value={authProvider}>
						<SettingsSlotsProvider value={settingsSlots}>
							<InstallProvider>
								<Provider>
									{offlineRuntime ? (
										<OfflineProvider
											runtime={offlineRuntime}
											client={queryClient}
											gate={Gate}
										>
											{app}
										</OfflineProvider>
									) : (
										<Gate>{app}</Gate>
									)}
									{!import.meta.env.PROD &&
										!getRuntimeConfig().disableDevtools && (
											<ReactQueryDevtools initialIsOpen={false} />
										)}
								</Provider>
							</InstallProvider>
						</SettingsSlotsProvider>
					</AuthProviderProvider>
				</QueryClientProvider>
			</TelemetryContext.Provider>
		</StrictMode>,
	);
};

export type { SettingsSlot } from "../settings-slots";
