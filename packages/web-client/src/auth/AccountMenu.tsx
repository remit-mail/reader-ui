import { AccountMenu as AccountMenuView } from "@remit/ui";
import { useGoToSection } from "../routing/sections";
import { AccountSession } from "./AccountSession";

export const AccountMenu = () => {
	const goToSection = useGoToSection();
	return (
		<AccountSession>
			{({ email, signOut, securityUrl }) => (
				<AccountMenuView
					email={email}
					onOpenSecurity={
						securityUrl ? () => goToSection("security") : undefined
					}
					onSignOut={signOut}
				/>
			)}
		</AccountSession>
	);
};
