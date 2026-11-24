import { Button } from "@remit/ui";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
	disableBackgroundRefresh,
	supportsBackgroundRefresh,
} from "../../lib/background-refresh";
import {
	getOfflineRuntime,
	type OfflineRuntime,
} from "../../lib/offline-runtime";
import { offlineRecord } from "../../lib/offline-store";

export function OfflineStorageRow({
	usage,
	onRemove,
	refreshOff,
	onDisableRefresh,
}: {
	usage?: number;
	onRemove(): void;
	refreshOff?: boolean;
	onDisableRefresh?(): void;
}) {
	const { t } = useTranslation("common", { useSuspense: false });
	return (
		<div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-4">
			<p className="text-sm text-fg-muted">
				{t("offlineStorage.usage", {
					defaultValue: "Downloaded mail: {{usage}} MiB used",
					usage: ((usage ?? 0) / 1048576).toFixed(1),
				})}
			</p>
			{refreshOff === true ? (
				<p className="text-sm text-fg-muted">
					{t("offlineStorage.refreshOff", "Background refresh is off")}
				</p>
			) : refreshOff === false && onDisableRefresh ? (
				<Button variant="secondary" onClick={onDisableRefresh}>
					{t("offlineStorage.disableRefresh", "Turn off background refresh")}
				</Button>
			) : null}
			<Button variant="secondary" onClick={onRemove}>
				{t("offlineStorage.remove", "Remove downloads")}
			</Button>
		</div>
	);
}

export function OfflineStorageSettings() {
	const runtime = getOfflineRuntime();
	return runtime ? <Storage runtime={runtime} /> : null;
}

function Storage({ runtime }: { runtime: OfflineRuntime }) {
	const { usage } = useSyncExternalStore(runtime.subscribe, runtime.snapshot);
	const [refreshOff, setRefreshOff] = useState<boolean>();
	useEffect(() => {
		if (supportsBackgroundRefresh())
			void offlineRecord<boolean>("refresh-off")
				.then((off) => setRefreshOff(off === true))
				.catch(runtime.report);
	}, [runtime]);
	useEffect(() => {
		void runtime.storage().catch(runtime.report);
	}, [runtime]);
	return (
		<OfflineStorageRow
			usage={usage}
			refreshOff={refreshOff}
			onDisableRefresh={() => {
				void disableBackgroundRefresh()
					.then(() => setRefreshOff(true))
					.catch(runtime.report);
			}}
			onRemove={() => {
				void runtime.removeDownloadsAndReload().catch(runtime.report);
			}}
		/>
	);
}
