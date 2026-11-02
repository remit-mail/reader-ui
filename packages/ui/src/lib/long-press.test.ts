import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clickRange } from "./calendar-slot-pick.js";
import {
	HOLD_MS,
	pressMove,
	pressStart,
	pressTick,
	stepHandle,
} from "./long-press.js";

describe("a hold on an empty slot", () => {
	it("selects once it has held still for 500 ms", () => {
		const press = pressStart(100, 200, 1000);
		assert.equal(pressTick(press, 1000 + HOLD_MS - 1).phase, "pending");
		assert.equal(pressTick(press, 1000 + HOLD_MS).phase, "held");
	});

	it("drops nothing when the finger scrolls first", () => {
		const scrolled = pressMove(pressStart(100, 200, 0), 100, 230);
		assert.equal(scrolled.phase, "scrolled");
		assert.equal(pressTick(scrolled, HOLD_MS * 2).phase, "scrolled");
	});

	it("forgives a tremor smaller than the slop", () => {
		assert.equal(pressMove(pressStart(100, 200, 0), 103, 204).phase, "pending");
	});

	it("keeps a held press held when the finger then moves", () => {
		const held = pressTick(pressStart(0, 0, 0), HOLD_MS);
		assert.equal(pressMove(held, 0, 300).phase, "held");
	});
});

describe("dragging a handle", () => {
	const hour = clickRange("2026-11-04", 10 * 60);

	it("moves the end in quarter-hour steps", () => {
		assert.equal(stepHandle(hour, "end", 12, 48).endTime, "11:15");
		assert.equal(stepHandle(hour, "end", 25, 48).endTime, "11:30");
		assert.equal(stepHandle(hour, "end", 5, 48).endTime, "11:00");
	});

	it("moves the start and leaves the end", () => {
		const earlier = stepHandle(hour, "start", -48, 48);
		assert.equal(earlier.startTime, "09:00");
		assert.equal(earlier.endTime, "11:00");
	});

	it("never leaves the block shorter than a quarter hour", () => {
		assert.equal(stepHandle(hour, "end", -480, 48).endTime, "10:15");
		assert.equal(stepHandle(hour, "start", 480, 48).startTime, "10:45");
	});
});
