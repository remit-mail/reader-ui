import { AccountMenu as AccountMenuView } from "@remit/ui";
import { useOpenSettingsSection } from "../routing/sections";
import { useSettingsSlots } from "../settings-slots";
import { AccountSession } from "./AccountSession";

export const AccountMenu = () => {
	const openSettingsSection = useOpenSettingsSection();
	const slots = useSettingsSlots();
	return (
		<AccountSession>
			{({ email, signOut }) => (
				<AccountMenuView
					email={email}
					sections={slots.map(({ id, label, icon }) => ({ id, label, icon }))}
					onOpenSection={openSettingsSection}
					onSignOut={signOut}
				/>
			)}
		</AccountSession>
	);
};
