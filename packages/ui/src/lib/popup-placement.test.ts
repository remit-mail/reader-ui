import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { placePopup } from "./popup-placement.js";

const viewport = { width: 1440, height: 900 };
const popup = { width: 400, height: 300 };
const overlaps = (
	a: { left: number; top: number; width: number; height: number },
	b: { left: number; top: number; width: number; height: number },
) =>
	a.left < b.left + b.width &&
	b.left < a.left + a.width &&
	a.top < b.top + b.height &&
	b.top < a.top + a.height;

describe("placePopup", () => {
	it("opens to the right of a range that has room there", () => {
		const anchor = { left: 500, top: 200, width: 120, height: 90 };
		const placed = placePopup(anchor, popup, viewport);
		assert.equal(placed.side, "right");
		assert.equal(placed.left, 628);
		assert.equal(placed.top, 200);
	});

	it("opens to the left when the right edge is too close", () => {
		const anchor = { left: 1200, top: 200, width: 120, height: 90 };
		const placed = placePopup(anchor, popup, viewport);
		assert.equal(placed.side, "left");
		assert.ok(!overlaps({ ...placed, ...popup }, anchor));
	});

	it("never covers the range, even on a narrow screen", () => {
		const narrow = { width: 500, height: 900 };
		const anchor = { left: 60, top: 100, width: 380, height: 120 };
		const placed = placePopup(anchor, popup, narrow);
		assert.equal(placed.side, "below");
		assert.ok(!overlaps({ ...placed, ...popup }, anchor));
	});

	it("keeps the popup inside the screen near the bottom", () => {
		const anchor = { left: 500, top: 820, width: 120, height: 40 };
		const placed = placePopup(anchor, popup, viewport);
		assert.equal(placed.top, 900 - 300 - 8);
	});

	it("centres the popup when the anchor is out of view or missing", () => {
		assert.equal(placePopup(null, popup, viewport).side, "center");
		const scrolledAway = { left: 500, top: -400, width: 120, height: 90 };
		const placed = placePopup(scrolledAway, popup, viewport);
		assert.deepEqual(placed, { left: 520, top: 300, side: "center" });
	});
});
