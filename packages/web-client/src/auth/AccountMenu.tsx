import { AccountMenu as AccountMenuView } from "@remit/ui";
import { useOpenSettingsSlot } from "../routing/sections";
import { useSettingsSlot } from "../settings-slots";
import { AccountSession } from "./AccountSession";

export const AccountMenu = () => {
	const openSettingsSlot = useOpenSettingsSlot();
	const security = useSettingsSlot("security");
	return (
		<AccountSession>
			{({ email, signOut }) => (
				<AccountMenuView
					email={email}
					onOpenSecurity={
						security ? () => openSettingsSlot(security.id) : undefined
					}
					onSignOut={signOut}
				/>
			)}
		</AccountSession>
	);
};
