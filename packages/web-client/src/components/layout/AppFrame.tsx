import { AppBar, AppTabBar } from "@remit/ui";
import type { ReactNode } from "react";
import { useLayoutTier } from "../../hooks/useLayoutTier";
import { useAppSwitch } from "../../routing";

export interface AppFrameProps {
	children: ReactNode;
	/** A full-screen surface on a phone takes the tab bar's room too. */
	hideTabBar?: boolean;
	/** The shell inside draws the app bar itself, beneath its own top bar. */
	appBarInShell?: boolean;
}

export function AppFrameAppBar() {
	const { items, active, switchTo } = useAppSwitch();
	return <AppBar items={items} active={active} onNavigate={switchTo} />;
}

/**
 * Mail and calendar side by side as apps: a bar down the left edge on a wide
 * screen, a tab bar under the content on a phone.
 */
export function AppFrame({
	children,
	hideTabBar = false,
	appBarInShell = false,
}: AppFrameProps) {
	const isPhone = useLayoutTier() === "phone";
	const { items, active, switchTo } = useAppSwitch();

	if (isPhone) {
		return (
			<div
				className="flex h-full w-full flex-col"
				style={
					hideTabBar ? undefined : { ["--app-tab-bar" as string]: "3.5rem" }
				}
			>
				<div className="min-h-0 flex-1">{children}</div>
				{!hideTabBar && (
					<AppTabBar items={items} active={active} onNavigate={switchTo} />
				)}
			</div>
		);
	}

	return (
		<div className="flex h-full w-full">
			{!appBarInShell && (
				<AppBar items={items} active={active} onNavigate={switchTo} />
			)}
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
