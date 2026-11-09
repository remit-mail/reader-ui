import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NavLink } from "../../routing/nav-link";
import { useOpenSettingsSection } from "../../routing/sections";
import { useSettingsSlots } from "../../settings-slots";
import { useSettingsNavItems } from "../settings";

export const Route = createFileRoute("/settings/$slotId")({
	component: SlotSettings,
});

function SlotSettings() {
	const { slotId } = Route.useParams();
	const slot = useSettingsSlots().find(({ id }) => id === slotId);
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();
	const [helpOpen, setHelpOpen] = useState(true);

	return (
		<SettingsShell
			items={navItems}
			activeId={slotId}
			title={slot ? slot.label : "Section not found"}
			help={slot?.help}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			{slot ? (
				<slot.Component />
			) : (
				<div className="space-y-3 text-sm text-fg-muted">
					<p>This settings section doesn't exist.</p>
					<NavLink to="/settings" variant="inline">
						Back to settings
					</NavLink>
				</div>
			)}
		</SettingsShell>
	);
}
