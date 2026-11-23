import { AccountMenu as AccountMenuView } from "@remit/ui";
import { useOpenSettingsSection } from "../routing/sections";
import { useSettingsSlots } from "../settings-slots";
import { useAuthProvider } from "./provider";

export const AccountMenu = () => {
	const { Account } = useAuthProvider();
	const openSettingsSection = useOpenSettingsSection();
	const slots = useSettingsSlots();
	return (
		<Account>
			{({ email, signOut }) => (
				<AccountMenuView
					email={email}
					sections={slots.map(({ id, label, icon }) => ({ id, label, icon }))}
					onOpenSection={openSettingsSection}
					onSignOut={signOut}
				/>
			)}
		</Account>
	);
};
