import type { AppId, AppSwitchItem } from "@remit/ui";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useRetainOpenPanels } from "./fragment";

export interface AppSwitch {
	items: AppSwitchItem[];
	active: AppId;
	switchTo: (id: AppId) => void;
}

const appOfPath = (pathname: string): AppId =>
	pathname.startsWith("/calendar") ? "calendar" : "mail";

/**
 * Mail and calendar as two destinations. The panes the reader has up travel
 * with them, the way a nav link carries them; overlays stay behind.
 */
export function useAppSwitch(): AppSwitch {
	const navigate = useNavigate();
	const router = useRouter();
	const retainPanels = useRetainOpenPanels();
	const pathname = useLocation({ select: (location) => location.pathname });
	const active = appOfPath(pathname);

	const items = useMemo<AppSwitchItem[]>(
		() => [
			{
				id: "mail",
				label: "Mail",
				href: router.buildLocation({ to: "/mail", hash: retainPanels }).href,
			},
			{
				id: "calendar",
				label: "Calendar",
				href: router.buildLocation({ to: "/calendar", hash: retainPanels })
					.href,
			},
		],
		[router, retainPanels],
	);

	const switchTo = useCallback(
		(id: AppId) => {
			navigate({
				to: id === "calendar" ? "/calendar" : "/mail",
				hash: retainPanels,
			});
		},
		[navigate, retainPanels],
	);

	return { items, active, switchTo };
}
