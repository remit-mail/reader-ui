import { SettingsShell } from "@remit/ui";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSettingsSlot } from "../../settings-slots";
import { settingsPath, useSettingsNavItems } from "../settings";

export const Route = createFileRoute("/settings/$slotId")({
	component: SlotSettings,
});

function SlotSettings() {
	const { slotId } = Route.useParams();
	const slot = useSettingsSlot(slotId);
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const [helpOpen, setHelpOpen] = useState(true);

	if (!slot) return <Navigate to="/settings/accounts" />;

	return (
		<SettingsShell
			items={navItems}
			activeId={slot.id}
			title={slot.label}
			help={slot.help}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={(id) => void navigate({ to: settingsPath(id) })}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<slot.Component />
		</SettingsShell>
	);
}
