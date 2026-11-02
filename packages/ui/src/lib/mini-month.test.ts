import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { miniMonthWeeks, shiftMonth } from "./mini-month.js";

const november = miniMonthWeeks({
	month: "2026-11-17",
	today: "2026-11-02",
	rangeStart: "2026-11-02",
	rangeEnd: "2026-11-08",
});

describe("miniMonthWeeks", () => {
	it("starts on the Monday before the first and numbers each ISO week", () => {
		assert.equal(november[0].days[0].date, "2026-10-26");
		assert.deepEqual(
			november.map((week) => week.weekNumber),
			[44, 45, 46, 47, 48, 49],
		);
		assert.equal(november.at(-1)?.days.at(-1)?.date, "2026-12-06");
	});

	it("marks the days outside the month", () => {
		assert.equal(november[0].days[0].inMonth, false);
		assert.equal(november[0].days[6].inMonth, true);
	});

	it("marks today and the range on the grid", () => {
		const marked = november.flatMap((week) => week.days);
		assert.deepEqual(
			marked.filter((day) => day.isToday).map((day) => day.date),
			["2026-11-02"],
		);
		assert.equal(marked.filter((day) => day.inRange).length, 7);
	});

	it("draws a month that starts on a Monday without a leading week", () => {
		const june = miniMonthWeeks({
			month: "2026-06-01",
			today: "",
			rangeStart: "",
			rangeEnd: "",
		});
		assert.equal(june[0].days[0].date, "2026-06-01");
		assert.equal(june.length, 5);
	});
});

describe("shiftMonth", () => {
	it("crosses a year in both directions", () => {
		assert.equal(shiftMonth("2026-12-31", 1), "2027-01-01");
		assert.equal(shiftMonth("2026-01-15", -1), "2025-12-01");
	});
});
