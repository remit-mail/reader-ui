import { Button } from "@remit/ui";
import { Download, X } from "@remit/ui/icons";
import { useTranslation } from "react-i18next";
import { useInstall } from "./InstallProvider";

export function InstallApp({ onInstall }: { onInstall?: () => void }) {
	const state = useInstall();
	const { t } = useTranslation("common", { useSuspense: false });
	if (!state?.available || state.dismissed) return null;
	return (
		<div className="flex items-center px-2 py-1">
			<Button
				variant="ghost"
				className="min-h-11 flex-1 justify-start"
				icon={<Download className="size-4" />}
				onClick={() => {
					state.install();
					onInstall?.();
				}}
			>
				{t("install.title", "Install app")}
			</Button>
			<Button
				variant="ghost"
				size="touch"
				aria-label={t("install.dismiss", "Dismiss install option")}
				onClick={state.dismiss}
				icon={<X className="size-4" />}
			/>
		</div>
	);
}

export function InstallSettings() {
	const state = useInstall();
	const { t } = useTranslation("common", { useSuspense: false });
	if (!state?.dismissed) return null;
	return (
		<div className="space-y-2 border-b border-line pb-4 mb-4">
			<p className="text-sm text-fg-muted">
				{t("install.hidden", "The install option is hidden on this device.")}
			</p>
			<Button variant="secondary" onClick={state.restore}>
				{t("install.restore", "Show install option again")}
			</Button>
		</div>
	);
}
