import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isoWeek } from "./iso-week.js";

describe("isoWeek", () => {
	it("puts 2 November 2026 in week 45", () => {
		assert.equal(isoWeek("2026-11-02"), 45);
		assert.equal(isoWeek("2026-11-08"), 45);
		assert.equal(isoWeek("2026-11-09"), 46);
	});

	it("counts the days before the first Thursday into the last year's week", () => {
		assert.equal(isoWeek("2027-01-01"), 53);
		assert.equal(isoWeek("2027-01-03"), 53);
		assert.equal(isoWeek("2027-01-04"), 1);
	});

	it("starts week 1 in December when the year begins on a Thursday or earlier", () => {
		assert.equal(isoWeek("2024-12-30"), 1);
		assert.equal(isoWeek("2026-01-01"), 1);
		assert.equal(isoWeek("2025-12-29"), 1);
	});
});
