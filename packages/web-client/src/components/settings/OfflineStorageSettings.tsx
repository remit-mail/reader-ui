import { Button } from "@remit/ui";
import { useEffect, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
	getOfflineRuntime,
	type OfflineRuntime,
} from "../../lib/offline-runtime";

export function OfflineStorageRow({
	usage,
	onRemove,
}: {
	usage?: number;
	onRemove(): void;
}) {
	const { t } = useTranslation("common", { useSuspense: false });
	return (
		<div className="flex items-center justify-between gap-4 border-b border-line pb-4 mb-4">
			<p className="text-sm text-fg-muted">
				{t("offlineStorage.usage", {
					defaultValue: "Downloaded mail: {{usage}} MiB used",
					usage: ((usage ?? 0) / 1048576).toFixed(1),
				})}
			</p>
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
	useEffect(() => {
		void runtime.storage().catch(runtime.report);
	}, [runtime]);
	return (
		<OfflineStorageRow
			usage={usage}
			onRemove={() => {
				void runtime
					.removeDownloads()
					.then(() => window.location.reload())
					.catch(runtime.report);
			}}
		/>
	);
}
