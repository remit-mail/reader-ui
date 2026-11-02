import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { layoutAllDay, layoutDay, zonedMoment } from "./time-grid-layout.js";

const at = (date: string, minute: number) => ({ date, minute });

describe("zonedMoment", () => {
	it("reads the wall clock in the zone asked for", () => {
		assert.deepEqual(
			zonedMoment("2026-11-04T09:30:00+01:00", "Europe/Amsterdam"),
			{
				date: "2026-11-04",
				minute: 9 * 60 + 30,
			},
		);
		assert.deepEqual(zonedMoment("2026-11-04T00:30:00+01:00", "UTC"), {
			date: "2026-11-03",
			minute: 23 * 60 + 30,
		});
	});
});

describe("layoutDay", () => {
	it("puts overlapping events side by side and a later one full width", () => {
		const placed = layoutDay("2026-11-04", [
			{ id: "a", start: at("2026-11-04", 780), end: at("2026-11-04", 840) },
			{ id: "b", start: at("2026-11-04", 810), end: at("2026-11-04", 870) },
			{ id: "c", start: at("2026-11-04", 900), end: at("2026-11-04", 960) },
		]);
		const byId = Object.fromEntries(placed.map((span) => [span.id, span]));
		assert.deepEqual([byId.a.column, byId.a.columns], [0, 2]);
		assert.deepEqual([byId.b.column, byId.b.columns], [1, 2]);
		assert.deepEqual([byId.c.column, byId.c.columns], [0, 1]);
	});

	it("clips an event that runs over midnight to the day drawn", () => {
		const [late] = layoutDay("2026-11-05", [
			{ id: "late", start: at("2026-11-04", 1380), end: at("2026-11-05", 60) },
		]);
		assert.deepEqual([late.top, late.bottom], [0, 60]);
	});
});

describe("layoutAllDay", () => {
	const week = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"];

	it("stacks bars that share a day into lanes", () => {
		const bars = layoutAllDay(week, [
			{ id: "trip", first: "2026-11-02", last: "2026-11-04" },
			{ id: "release", first: "2026-11-04", last: "2026-11-04" },
			{ id: "late", first: "2026-11-05", last: "2026-11-09" },
		]);
		const byId = Object.fromEntries(bars.map((bar) => [bar.id, bar]));
		assert.deepEqual(byId.trip, {
			id: "trip",
			startIndex: 0,
			span: 3,
			lane: 0,
		});
		assert.equal(byId.release.lane, 1);
		assert.deepEqual(byId.late, {
			id: "late",
			startIndex: 3,
			span: 1,
			lane: 0,
		});
	});
});
