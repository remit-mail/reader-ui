import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PeoplePanel } from "../../components/settings/people/PeoplePanel";
import { SETTINGS_ID_TO_PATH, useSettingsNavItems } from "../settings";

export const Route = createFileRoute("/settings/people")({
	component: PeopleSettings,
});

const peopleHelp = (
	<div className="space-y-3">
		<p>
			Anyone signed in here can manage every account. Each action asks for your
			own password first, and is recorded with who took it and from where.
		</p>
		<p>
			Disabling an account signs that person out within 15 minutes and stops
			their calendar feed links. Their mail stays. You cannot disable your own
			account, so one account always stays on.
		</p>
		<p>
			A reset link works once, for 24 hours, and is shown only once. Making one
			stops the old password at once.
		</p>
		<p>
			The person who runs this server can turn all sign-in off with{" "}
			<code>remit sign-in off</code>, and recover an account from the host with{" "}
			<code>remit people enable</code> or <code>remit people reset</code>.
		</p>
	</div>
);

function PeopleSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const [helpOpen, setHelpOpen] = useState(true);

	return (
		<SettingsShell
			items={navItems}
			activeId="people"
			title="People"
			description="Everyone with an account on this server."
			help={peopleHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((open) => !open)}
			onSelect={(id) => {
				const path = SETTINGS_ID_TO_PATH[id];
				if (path) void navigate({ to: path });
			}}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<PeoplePanel />
		</SettingsShell>
	);
}
