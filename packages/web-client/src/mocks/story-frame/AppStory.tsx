import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import {
	type AuthProvider,
	AuthProviderProvider,
	noneAuthProvider,
} from "../../auth/provider";
import { escalate } from "../../lib/escalate";
import { noopTelemetry } from "../../lib/telemetry";
import { createAppRouter } from "../../router";
import { SettingsProvider, type SettingsSlot } from "../../settings-slots";
import "../../lib/i18n";
import "../../lib/client";

import { InstallProvider } from "../../components/install/InstallProvider";

export interface AppStoryProps {
	url: string;
	pwaEnabled?: boolean;
	authProvider?: AuthProvider;
	settingsSlots?: SettingsSlot[];
	/** Host People administration URL, replacing the self-host People panel. */
	peopleDestinationUrl?: string;
}

const createStoryQueryClient = (): QueryClient =>
	new QueryClient({
		queryCache: new QueryCache({ onError: escalate }),
		mutationCache: new MutationCache({ onError: escalate }),
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
			mutations: { retry: false },
		},
	});

export function AppStory({
	url,
	authProvider = noneAuthProvider,
	settingsSlots = [],
	peopleDestinationUrl,
	pwaEnabled = false,
}: AppStoryProps) {
	const [queryClient] = useState(createStoryQueryClient);
	const [router] = useState(() => {
		authProvider.configure();
		return createAppRouter(
			queryClient,
			noopTelemetry,
			createMemoryHistory({ initialEntries: [url] }),
		);
	});
	const Provider = authProvider.Provider ?? Fragment;
	const SessionGate = authProvider.SessionGate ?? Fragment;

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProviderProvider value={authProvider}>
				<SettingsProvider value={{ settingsSlots, peopleDestinationUrl }}>
					<InstallProvider enabled={pwaEnabled}>
						<Provider>
							<SessionGate>
								<RouterProvider router={router} />
							</SessionGate>
						</Provider>
					</InstallProvider>
				</SettingsProvider>
			</AuthProviderProvider>
		</QueryClientProvider>
	);
}
