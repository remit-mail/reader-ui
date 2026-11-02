import type { Page } from "playwright/test";

const HOUR = 48;

/** Scrolls the time grid so the minute shows, and returns the point on the given day there. */
export async function slotPoint(
	page: Page,
	dayIndex: number,
	minute: number,
	days = 7,
): Promise<{ x: number; y: number }> {
	await page.getByRole("grid", { name: "Time grid" }).evaluate(
		(grid, top) => {
			grid.scrollTop = top;
		},
		Math.max(0, (minute / 60) * HOUR - 120),
	);
	const box = await page.locator("[data-time-columns]").boundingBox();
	if (!box) throw new Error("no time grid on screen");
	return {
		x: box.x + box.width * ((dayIndex + 0.5) / days),
		y: box.y + (minute / 60) * HOUR + 2,
	};
}

/** A press and a move of a few slots, released: a dragged range. */
export async function dragRange(
	page: Page,
	dayIndex: number,
	fromMinute: number,
	toMinute: number,
	days = 7,
): Promise<void> {
	const start = await slotPoint(page, dayIndex, fromMinute, days);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(
		start.x,
		start.y + ((toMinute - fromMinute) / 60) * HOUR,
		{
			steps: 6,
		},
	);
	await page.mouse.up();
}

/** A press without movement: a click on one slot. */
export async function clickSlot(
	page: Page,
	dayIndex: number,
	minute: number,
	days = 7,
): Promise<void> {
	const point = await slotPoint(page, dayIndex, minute, days);
	await page.mouse.click(point.x, point.y);
}

/** A finger held still on a point, then dragged and lifted, through CDP touch events. */
export async function holdAndDrag(
	page: Page,
	from: { x: number; y: number },
	to: { x: number; y: number },
	holdMs: number,
): Promise<void> {
	const cdp = await page.context().newCDPSession(page);
	const touch = (
		type: "touchStart" | "touchMove" | "touchEnd",
		point: { x: number; y: number },
	) =>
		cdp.send("Input.dispatchTouchEvent", {
			type,
			touchPoints: type === "touchEnd" ? [] : [{ x: point.x, y: point.y }],
		});
	await touch("touchStart", from);
	await page.waitForTimeout(holdMs);
	const steps = 6;
	for (let step = 1; step <= steps; step += 1) {
		await touch("touchMove", {
			x: from.x + ((to.x - from.x) * step) / steps,
			y: from.y + ((to.y - from.y) * step) / steps,
		});
	}
	await touch("touchEnd", to);
	await cdp.detach();
}
