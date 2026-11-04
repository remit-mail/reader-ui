import { AppChrome } from "@remit/ui";
import type { ReactNode } from "react";
import { useLayoutTier } from "../../hooks/useLayoutTier";
import { DesktopAppBar } from "./DesktopAppBar";

export interface DesktopChromeProps {
	topBar: ReactNode;
	children: ReactNode;
}

export function DesktopChrome({ topBar, children }: DesktopChromeProps) {
	if (useLayoutTier() === "phone") return <>{children}</>;
	return (
		<div className="flex h-full w-full flex-col overflow-hidden bg-canvas">
			<AppChrome topBar={topBar} appBar={<DesktopAppBar />}>
				{children}
			</AppChrome>
		</div>
	);
}
