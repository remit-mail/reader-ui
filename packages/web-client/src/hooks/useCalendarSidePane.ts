import { useCallback, useState } from "react";
import {
	readSidePanePref,
	resolveSidePaneOpen,
	writeSidePanePref,
} from "../lib/calendar-side-pane-pref";
import { panelsWithOverlay, useOpenPanels, useSetOpenPanels } from "../routing";

export interface CalendarSidePane {
	/** The pane beside the grid on a wide tier. */
	open: boolean;
	toggle: () => void;
	/** The slide-over that holds the same pane on a phone. */
	navOpen: boolean;
	setNavOpen: (open: boolean) => void;
}

/**
 * The hamburger's state. On a wide tier it shows and hides the `sidebar` pane
 * by replace and records the choice on this device; on a phone it raises the
 * `nav` slide-over instead.
 */
export function useCalendarSidePane(isPhone: boolean): CalendarSidePane {
	const panels = useOpenPanels();
	const setOpenPanels = useSetOpenPanels();
	const [prefersOpen, setPrefersOpen] = useState(readSidePanePref);
	const open = !isPhone && resolveSidePaneOpen(panels, prefersOpen);
	const navOpen = isPhone && panels.includes("nav");

	const toggle = useCallback(() => {
		if (isPhone) {
			setOpenPanels(panelsWithOverlay(panels, navOpen ? undefined : "nav"));
			return;
		}
		const next = !open;
		writeSidePanePref(next);
		setPrefersOpen(next);
		const others = panels.filter((panel) => panel !== "sidebar");
		setOpenPanels(next ? [...others, "sidebar"] : others);
	}, [isPhone, navOpen, open, panels, setOpenPanels]);

	const setNavOpen = useCallback(
		(next: boolean) => {
			setOpenPanels(panelsWithOverlay(panels, next ? "nav" : undefined));
		},
		[panels, setOpenPanels],
	);

	return { open, toggle, navOpen, setNavOpen };
}
