import assert from "node:assert";
import { describe, test } from "node:test";
import { buildSpamOverview, overviewDays } from "./spam-overview.js";

describe("buildSpamOverview", () => {
	test("draws a day with no verdicts as an empty bar, per kind", () => {
		const overview = buildSpamOverview(
			{
				spamByDay: [
					{ date: "2026-11-11", action: "Junk", kind: "Spam", count: 2 },
					{ date: "2026-11-11", action: "Warn", kind: "Spam", count: 1 },
					{ date: "2026-11-13", action: "Warn", kind: "Phishing", count: 3 },
				],
				spamScoreBands: [{ from: 0.85, count: 6 }],
			},
			["2026-11-11", "2026-11-12", "2026-11-13"],
		);
		assert.deepStrictEqual(overview.spam, [
			{ date: "2026-11-11", moved: 2, warned: 1 },
			{ date: "2026-11-12", moved: 0, warned: 0 },
			{ date: "2026-11-13", moved: 0, warned: 0 },
		]);
		assert.deepStrictEqual(overview.phishing[2], {
			date: "2026-11-13",
			moved: 0,
			warned: 3,
		});
		assert.strictEqual(overview.moved, 2);
		assert.strictEqual(overview.warned, 4);
		assert.strictEqual(overview.checkedAny, true);
	});

	test("reads as nothing checked when no score band holds a message", () => {
		const overview = buildSpamOverview({ spamByDay: [], spamScoreBands: [] }, [
			"2026-11-13",
		]);
		assert.strictEqual(overview.checkedAny, false);
	});
});

describe("overviewDays", () => {
	test("ends on today and runs oldest first", () => {
		const days = overviewDays(new Date(2026, 10, 13, 15, 0), 3);
		assert.deepStrictEqual(days, ["2026-11-11", "2026-11-12", "2026-11-13"]);
	});
});
