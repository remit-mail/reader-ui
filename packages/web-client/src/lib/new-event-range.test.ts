import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	newEventSearchSchema,
	rangeFromSearch,
	searchFromRange,
} from "./new-event-range.js";

const AMS = "Europe/Amsterdam";

describe("the /new range", () => {
	it("reads start and end written with an offset, on the device's clock", () => {
		assert.deepEqual(
			rangeFromSearch(
				"2026-11-05T14:00:00+01:00",
				"2026-11-05T15:30:00+01:00",
				"2026-11-02",
				AMS,
			),
			{
				date: "2026-11-05",
				endDate: "2026-11-05",
				startTime: "14:00",
				endTime: "15:30",
				allDay: false,
			},
		);
	});

	it("reads civil dates as an all-day range, end exclusive", () => {
		const range = rangeFromSearch(
			"2026-11-05",
			"2026-11-07",
			"2026-11-02",
			AMS,
		);
		assert.equal(range.allDay, true);
		assert.equal(range.endDate, "2026-11-06");
	});

	it("falls back to 09:00 to 10:00 on the URL date when a bound is missing or unreadable", () => {
		const fallback = {
			date: "2026-11-02",
			endDate: "2026-11-02",
			startTime: "09:00",
			endTime: "10:00",
			allDay: false,
		};
		assert.deepEqual(
			rangeFromSearch(
				undefined,
				"2026-11-05T15:30:00+01:00",
				"2026-11-02",
				AMS,
			),
			fallback,
		);
		const parsed = newEventSearchSchema.parse({
			start: "tomorrow",
			end: "2026-11-05T15:30:00",
		});
		assert.equal(parsed.start, undefined);
		assert.equal(parsed.end, undefined);
		assert.deepEqual(
			rangeFromSearch(parsed.start, parsed.end, "2026-11-02", AMS),
			fallback,
		);
		assert.deepEqual(
			rangeFromSearch(
				"2026-11-05T15:30:00+01:00",
				"2026-11-05T14:00:00+01:00",
				"2026-11-02",
				AMS,
			),
			fallback,
		);
	});

	it("writes a range back as it reads it", () => {
		const range = rangeFromSearch(
			"2026-11-05T14:00:00+01:00",
			"2026-11-05T15:30:00+01:00",
			"2026-11-02",
			AMS,
		);
		assert.deepEqual(searchFromRange(range, AMS), {
			start: "2026-11-05T14:00:00+01:00",
			end: "2026-11-05T15:30:00+01:00",
		});
	});
});
