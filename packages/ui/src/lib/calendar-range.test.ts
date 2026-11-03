import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calendarRangeTitle, datesFrom, weekStart } from "./calendar-range.js";

describe("weekStart", () => {
	it("is the Monday of the week", () => {
		assert.equal(weekStart("2026-11-02"), "2026-11-02");
		assert.equal(weekStart("2026-11-08"), "2026-11-02");
		assert.equal(weekStart("2027-01-01"), "2026-12-28");
	});
});

describe("datesFrom", () => {
	it("crosses a month end", () => {
		assert.deepEqual(datesFrom("2026-10-30", 4), [
			"2026-10-30",
			"2026-10-31",
			"2026-11-01",
			"2026-11-02",
		]);
	});
});

describe("calendarRangeTitle", () => {
	it("names the month and year of a week inside one month", () => {
		assert.equal(
			calendarRangeTitle("week", "2026-11-04", "en-GB"),
			"November 2026",
		);
	});

	it("names both months of a week that crosses one", () => {
		assert.equal(
			calendarRangeTitle("week", "2026-10-28", "en-GB"),
			"Oct – Nov 2026",
		);
		assert.equal(
			calendarRangeTitle("week", "2026-12-30", "en-GB"),
			"Dec 2026 – Jan 2027",
		);
	});

	it("names the day, the month and the year at their own zoom", () => {
		assert.equal(
			calendarRangeTitle("day", "2026-11-02", "en-GB"),
			"Monday, 2 November 2026",
		);
		assert.equal(
			calendarRangeTitle("month", "2026-11-20", "en-GB"),
			"November 2026",
		);
		assert.equal(calendarRangeTitle("year", "2026-11-20", "en-GB"), "2026");
	});
});
