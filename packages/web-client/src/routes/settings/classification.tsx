import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ClassificationPanel } from "../../components/settings/classification/ClassificationPanel";
import { useOpenSettingsSection } from "../../routing/sections";
import { useSettingsNavItems } from "../settings";

export const Route = createFileRoute("/settings/classification")({
	component: ClassificationSettings,
});

const classificationHelp = (
	<div className="space-y-3">
		<p>
			A model labels new mail: spam and phishing, priority, personal, and a
			category. With classification off, or when a call fails, the built-in
			rules label it.
		</p>
		<p>
			The API key is stored encrypted on the server and never sent back to the
			browser. Test connection sends one built-in sample message, with the form
			as it stands, and changes nothing.
		</p>
	</div>
);

function ClassificationSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();
	const [helpOpen, setHelpOpen] = useState(true);

	return (
		<SettingsShell
			items={navItems}
			activeId="classification"
			title="Mail classification"
			description="Label new mail with a model. Mail already in your folders keeps its labels."
			help={classificationHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((open) => !open)}
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<ClassificationPanel />
		</SettingsShell>
	);
}
