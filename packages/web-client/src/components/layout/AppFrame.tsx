import { AppTabBar } from "@remit/ui";
import type { ReactNode } from "react";
import { useLayoutTier } from "../../hooks/useLayoutTier";
import { useAppSwitch } from "../../routing";

export interface AppFrameProps {
	children: ReactNode;
	hideTabBar?: boolean;
}

/**
 * On a phone, the tab bar under the content. Wide screens get their app bar
 * from the shell's own `appBar` slot, so the frame adds nothing there.
 */
export function AppFrame({ children, hideTabBar = false }: AppFrameProps) {
	const isPhone = useLayoutTier() === "phone";
	const { items, active, switchTo } = useAppSwitch();

	if (!isPhone) return <>{children}</>;

	return (
		<div
			className="flex h-full w-full flex-col"
			style={hideTabBar ? undefined : { ["--app-tab-bar" as string]: "3.5rem" }}
		>
			<div className="min-h-0 flex-1">{children}</div>
			{!hideTabBar && (
				<AppTabBar items={items} active={active} onNavigate={switchTo} />
			)}
		</div>
	);
}
