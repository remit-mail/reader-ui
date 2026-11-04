import { AppTopBar, Button } from "@remit/ui";
import { Settings } from "lucide-react";
import { AccountMenu } from "../../auth/AccountMenu";
import { useGoToSection } from "../../routing";

export function CalendarTopBar() {
	const goToSection = useGoToSection();
	return (
		<AppTopBar
			search={null}
			actions={
				<>
					<Button
						variant="ghost"
						size="sm"
						icon={<Settings className="size-4" />}
						title="Settings"
						aria-label="Settings"
						onClick={() => goToSection("accounts")}
					/>
					<AccountMenu />
				</>
			}
		/>
	);
}
