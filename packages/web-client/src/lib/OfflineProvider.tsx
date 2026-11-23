import { type QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
	type FC,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
import { type OfflineRuntime, retainedReadingQuery } from "./offline-runtime";
import { OFFLINE_FORMAT } from "./offline-store";
import { isAppNavigation } from "./pwa-protocol";

const Restored = ({ children }: { children: ReactNode }) =>
	useIsRestoring() ? null : children;
export const OfflineProvider = ({
	runtime,
	client,
	gate: Gate,
	children,
}: {
	runtime: OfflineRuntime;
	client: QueryClient;
	gate: FC<{ children: ReactNode }>;
	children: ReactNode;
}) => {
	const state = useSyncExternalStore(runtime.subscribe, runtime.snapshot);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		void runtime
			.start(client)
			.then(() => setReady(true))
			.catch(runtime.report);
	}, [runtime, client]);
	const persister = useMemo(
		() => (state.partition ? runtime.persister(state.partition) : undefined),
		[runtime, state.partition],
	);
	if (!ready) return null;
	if (!isAppNavigation(new URL(window.location.href)))
		return <Gate>{children}</Gate>;
	if (!state.partition || !persister)
		return (
			<Gate>
				<VerifyAuthenticatedSession runtime={runtime} />
			</Gate>
		);
	return (
		<PersistQueryClientProvider
			key={state.partition.generation}
			client={client}
			persistOptions={{
				persister,
				maxAge: Infinity,
				buster: String(OFFLINE_FORMAT),
				dehydrateOptions: {
					shouldDehydrateMutation: () => false,
					shouldDehydrateQuery: (query) =>
						query.state.status === "success" && retainedReadingQuery(query),
				},
			}}
		>
			<Restored>{children}</Restored>
		</PersistQueryClientProvider>
	);
};

const VerifyAuthenticatedSession = ({
	runtime,
}: {
	runtime: OfflineRuntime;
}) => {
	useEffect(() => {
		void runtime.verify().catch(runtime.report);
	}, [runtime]);
	return null;
};
