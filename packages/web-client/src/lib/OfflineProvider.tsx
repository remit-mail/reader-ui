import { type QueryClient, useIsRestoring } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
	type ReactNode,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
import { type OfflineRuntime, retainedReadingQuery } from "./offline-runtime";
import { OFFLINE_FORMAT } from "./offline-store";

export interface OfflineStatusProps {
	verified: boolean;
	error?: string;
	usage?: number;
	quota?: number;
	persistent?: boolean;
	onVerify(): void;
	onPersist(): void;
	onRemove(): void;
}
export const OfflineStatus = ({
	verified,
	error,
	usage,
	quota,
	persistent,
	onVerify,
	onPersist,
	onRemove,
}: OfflineStatusProps) => (
	<section aria-label="Offline downloads" className="border-b p-3 text-sm">
		<a href="/downloads">Downloaded mail</a>
		<p role="status">
			{verified
				? "Session verified"
				: "Offline / session unverified — downloaded mail is read-only"}
		</p>
		{usage !== undefined && (
			<p>
				{(usage / 1048576).toFixed(1)} MiB used
				{quota !== undefined && ` of ${(quota / 1048576).toFixed(1)} MiB`}.{" "}
				{persistent
					? "Persistent storage granted."
					: "Storage may be removed by the browser."}
			</p>
		)}
		{error && <p role="alert">Could not save downloads: {error}</p>}
		{!verified && (
			<button type="button" onClick={onVerify}>
				Verify session / sign in
			</button>
		)}
		<button type="button" onClick={onPersist}>
			Keep downloads on this device
		</button>{" "}
		<button type="button" onClick={onRemove}>
			Remove downloads
		</button>
	</section>
);
const Restored = ({ children }: { children: ReactNode }) =>
	useIsRestoring() ? <p role="status">Restoring downloads…</p> : children;
export const OfflineProvider = ({
	runtime,
	client,
	children,
}: {
	runtime: OfflineRuntime;
	client: QueryClient;
	children: ReactNode;
}) => {
	const state = useSyncExternalStore(runtime.subscribe, runtime.snapshot);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		void runtime
			.start(client)
			.then(() => {
				setReady(true);
				return runtime.storage();
			})
			.catch(runtime.report);
	}, [runtime, client]);
	const persister = useMemo(
		() => (state.partition ? runtime.persister(state.partition) : undefined),
		[runtime, state.partition],
	);
	const status = (
		<OfflineStatus
			{...state}
			onVerify={() => {
				void runtime
					.verify()
					.then((verified) => {
						if (!verified) runtime.options.reauthenticate();
					})
					.catch(runtime.report);
			}}
			onPersist={() => {
				void runtime.storage(true).catch(runtime.report);
			}}
			onRemove={() => {
				void runtime.removeDownloads().catch(runtime.report);
			}}
		/>
	);
	if (!ready)
		return (
			<>
				{status}
				<p role="status">Opening downloads…</p>
			</>
		);
	if (!state.partition || !persister)
		return (
			<>
				{status}
				<p>
					Sign in to download mail. First-time offline sign-in is unavailable.
				</p>
			</>
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
			<div className="flex h-dvh flex-col">
				{status}
				<div className="min-h-0 flex-1 [&_main#main-content]:h-full">
					<Restored>{children}</Restored>
				</div>
			</div>
		</PersistQueryClientProvider>
	);
};
