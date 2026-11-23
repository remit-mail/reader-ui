import { Banner, Button } from "@remit/ui";
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
import { useTranslation } from "react-i18next";
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
	const [startup, setStartup] = useState<"pending" | "ready" | "failed">(
		"pending",
	);
	useEffect(() => {
		void runtime
			.start(client)
			.then(() => setStartup("ready"))
			.catch(() => {
				setStartup("failed");
			});
	}, [runtime, client]);
	const persister = useMemo(
		() => (state.partition ? runtime.persister(state.partition) : undefined),
		[runtime, state.partition],
	);
	if (startup === "pending") return null;
	if (startup === "failed")
		return (
			<OfflineStartupFailure
				onRemove={() => {
					return runtime.removeDownloadsAndReload();
				}}
			/>
		);
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

export function OfflineStartupFailure({
	onRemove,
}: {
	onRemove(): void | Promise<void>;
}) {
	const [removeFailed, setRemoveFailed] = useState(false);
	const remove = async () => {
		try {
			await onRemove();
		} catch {
			setRemoveFailed(true);
		}
	};
	const { t } = useTranslation("common", { useSuspense: false });
	return (
		<div className="mx-auto max-w-lg space-y-4 p-6">
			<Banner tone="danger">
				{removeFailed
					? t(
							"offlineStorage.removeFailed",
							"Downloads could not be removed. Try again.",
						)
					: t(
							"offlineStorage.startupFailed",
							"Downloaded mail could not be opened. Remove downloads on this device to reopen the app.",
						)}
			</Banner>
			<Button variant="secondary" onClick={() => void remove()}>
				{t("offlineStorage.removeAndReload", "Remove downloads and reload")}
			</Button>
		</div>
	);
}
