import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { WarningsPanel } from "../../components/settings/WarningsPanel";
import { useOpenSettingsSection } from "../../routing/sections";
import { useSettingsNavItems } from "../settings";
import { warningsHelp } from "./-shared/help-copy";

export const Route = createFileRoute("/settings/warnings")({
	component: WarningsSettings,
});

function WarningsSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();
	const [helpOpen, setHelpOpen] = useState(true);

	return (
		<SettingsShell
			items={navItems}
			activeId="warnings"
			title="Warnings"
			description="Messages that failed to sync, and messages set aside."
			help={warningsHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<WarningsPanel />
		</SettingsShell>
	);
}
