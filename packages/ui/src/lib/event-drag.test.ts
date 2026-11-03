import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	moveDays,
	moveTimed,
	resizeDays,
	resizeTimed,
	snappedMinutes,
} from "./event-drag.js";

const at = (date: string, minute: number) => ({ date, minute });

describe("moving a timed event", () => {
	it("snaps pointer travel to quarter hours", () => {
		assert.equal(snappedMinutes(11, 48), 15);
		assert.equal(snappedMinutes(5, 48), 0);
		assert.equal(snappedMinutes(-49, 48), -60);
	});

	it("keeps its length and can change day", () => {
		const moved = moveTimed(
			at("2026-11-04", 600),
			at("2026-11-04", 690),
			1,
			45,
		);
		assert.deepEqual(moved, {
			start: at("2026-11-05", 645),
			end: at("2026-11-05", 735),
		});
	});

	it("carries an end past midnight onto the next day", () => {
		const moved = moveTimed(
			at("2026-11-04", 1320),
			at("2026-11-04", 1380),
			0,
			90,
		);
		assert.deepEqual(moved.end, at("2026-11-05", 30));
	});
});

describe("resizing a timed event", () => {
	it("moves the end in quarter hours", () => {
		assert.deepEqual(
			resizeTimed(at("2026-11-04", 600), at("2026-11-04", 660), 30),
			at("2026-11-04", 690),
		);
	});

	it("never leaves it shorter than a quarter hour", () => {
		assert.deepEqual(
			resizeTimed(at("2026-11-04", 600), at("2026-11-04", 660), -300),
			at("2026-11-04", 615),
		);
	});
});

describe("all-day events", () => {
	it("move by whole days", () => {
		assert.deepEqual(moveDays("2026-11-06", "2026-11-07", -2), {
			first: "2026-11-04",
			last: "2026-11-05",
		});
	});

	it("span more days from the right edge, never fewer than one", () => {
		assert.equal(resizeDays("2026-11-06", "2026-11-06", 2), "2026-11-08");
		assert.equal(resizeDays("2026-11-06", "2026-11-07", -5), "2026-11-06");
	});
});
