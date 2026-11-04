import { AppBar } from "@remit/ui";
import { useAppSwitch } from "../../routing";

export function DesktopAppBar() {
	const { items, active, switchTo } = useAppSwitch();
	return <AppBar items={items} active={active} onNavigate={switchTo} />;
}
