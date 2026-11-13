import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SpamSettingsPanel } from "../../components/settings/spam/SpamSettingsPanel";
import { useOpenSettingsSection } from "../../routing/sections";
import { useSettingsNavItems } from "../settings";

export const Route = createFileRoute("/settings/spam")({
	component: SpamSettings,
});

function SpamSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();

	return (
		<SettingsShell
			items={navItems}
			activeId="spam"
			title="Spam & phishing"
			description="What Remit flagged, and when it acts."
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<SpamSettingsPanel />
		</SettingsShell>
	);
}
