/**
 * Advanced settings. Updates live here — and only here — with a full pane in
 * Settings › Advanced. Notification rules and export are future scope.
 */
import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ConfigTransferPanel } from "../../components/settings/ConfigTransferPanel";
import { SelfUpdatePanel } from "../../components/settings/SelfUpdatePanel";
import { TlsRootCaDownload } from "../../components/settings/TlsRootCaDownload";
import { AppVersion } from "../../components/ui/AppVersion";
import { useOpenSettingsSection } from "../../routing/sections";
import { getRuntimeConfig } from "../../runtime-config";
import { useSettingsNavItems } from "../settings";
import { advancedHelp } from "./-shared/help-copy";

export const Route = createFileRoute("/settings/advanced")({
	component: AdvancedSettings,
});

function AdvancedSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();
	const [helpOpen, setHelpOpen] = useState(true);

	return (
		<SettingsShell
			items={navItems}
			activeId="advanced"
			title="Advanced"
			description="Notification rules, export, and diagnostics."
			help={advancedHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			{getRuntimeConfig().updateMode === "self" && <SelfUpdatePanel />}
			<div className="mt-6 border-t border-line pt-4">
				<ConfigTransferPanel />
			</div>
			<div className="mt-6 border-t border-line pt-4">
				<p className="text-sm text-fg-muted">
					Notification rules are coming in a future release.
				</p>
			</div>
			<TlsRootCaDownload />
			<div className="border-t border-line pt-4 mt-4">
				<p className="text-sm font-medium text-fg mb-1">About</p>
				<AppVersion />
			</div>
		</SettingsShell>
	);
}
