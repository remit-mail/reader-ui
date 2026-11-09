import { SettingsShell } from "@remit/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AccountSession } from "../../auth/AccountSession";
import { SETTINGS_ID_TO_PATH, useSettingsNavItems } from "../settings";
import { securityHelp } from "./-shared/help-copy";

export const Route = createFileRoute("/settings/security")({
	component: SecuritySettings,
});

function SecuritySettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const [helpOpen, setHelpOpen] = useState(true);

	const handleSelectNav = (id: string) => {
		const path = SETTINGS_ID_TO_PATH[id];
		if (path) void navigate({ to: path });
	};

	return (
		<SettingsShell
			items={navItems}
			activeId="security"
			title="Security"
			description="Protect your account with a second step and passkeys."
			help={securityHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={handleSelectNav}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<div className="space-y-3 text-sm text-fg-muted">
				<p>
					Two-factor authentication asks for a code or a security key after your
					password. Passkeys let you sign in with your fingerprint, face or
					device lock instead of a password.
				</p>
				<AccountSession>
					{({ securityUrl }) =>
						securityUrl ? (
							<a
								href={securityUrl}
								className="font-medium text-accent hover:underline"
							>
								Manage two-factor authentication and passkeys
							</a>
						) : null
					}
				</AccountSession>
			</div>
		</SettingsShell>
	);
}
