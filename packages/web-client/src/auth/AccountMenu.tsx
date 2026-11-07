import { AccountMenu as AccountMenuView } from "@remit/ui";
import { AccountSession } from "./AccountSession";

export const AccountMenu = () => (
	<AccountSession>
		{({ email, signOut, securityUrl }) => (
			<AccountMenuView
				email={email}
				securityUrl={securityUrl}
				onSignOut={signOut}
			/>
		)}
	</AccountSession>
);
