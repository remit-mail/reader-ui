export interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Placement {
	left: number;
	top: number;
	side: "right" | "left" | "below" | "above" | "center";
}

const GAP = 8;

const clamp = (value: number, low: number, high: number): number =>
	Math.min(Math.max(value, low), Math.max(low, high));

const inView = (anchor: Box, viewport: Size): boolean =>
	anchor.width > 0 &&
	anchor.height > 0 &&
	anchor.left < viewport.width &&
	anchor.left + anchor.width > 0 &&
	anchor.top < viewport.height &&
	anchor.top + anchor.height > 0;

export function centred(popup: Size, viewport: Size): Placement {
	return {
		left: Math.max(GAP, (viewport.width - popup.width) / 2),
		top: Math.max(GAP, (viewport.height - popup.height) / 2),
		side: "center",
	};
}

/**
 * Where a popup goes beside what it describes: to the right when there is
 * room, else to the left, else below or above, and never over the anchor. An
 * anchor that is missing or out of view centres the popup instead.
 */
export function placePopup(
	anchor: Box | null,
	popup: Size,
	viewport: Size,
): Placement {
	if (!anchor || !inView(anchor, viewport)) return centred(popup, viewport);
	const top = clamp(anchor.top, GAP, viewport.height - popup.height - GAP);
	const right = anchor.left + anchor.width + GAP;
	if (right + popup.width <= viewport.width - GAP)
		return { left: right, top, side: "right" };
	const left = anchor.left - GAP - popup.width;
	if (left >= GAP) return { left, top, side: "left" };
	const across = clamp(anchor.left, GAP, viewport.width - popup.width - GAP);
	const below = anchor.top + anchor.height + GAP;
	if (below + popup.height <= viewport.height - GAP)
		return { left: across, top: below, side: "below" };
	const above = anchor.top - GAP - popup.height;
	if (above >= GAP) return { left: across, top: above, side: "above" };
	return centred(popup, viewport);
}
