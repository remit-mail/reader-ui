import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initialFocus, moveFocus, stretchRange } from "./grid-keyboard.js";

const week = [
	"2026-11-02",
	"2026-11-03",
	"2026-11-04",
	"2026-11-05",
	"2026-11-06",
	"2026-11-07",
	"2026-11-08",
];

describe("the grid's tab stop", () => {
	it("sits on the current hour of today", () => {
		assert.deepEqual(initialFocus(week, "2026-11-04", 14 * 60 + 37), {
			date: "2026-11-04",
			minute: 14 * 60,
		});
	});

	it("sits on the first day in view when today is not", () => {
		assert.deepEqual(initialFocus(week, "2026-12-01", 9 * 60 + 5), {
			date: "2026-11-02",
			minute: 9 * 60,
		});
	});
});

describe("arrow keys", () => {
	const slot = { date: "2026-11-04", minute: 10 * 60 };

	it("move a quarter hour up or down", () => {
		assert.equal(moveFocus(slot, "ArrowUp", week)?.minute, 9 * 60 + 45);
		assert.equal(moveFocus(slot, "ArrowDown", week)?.minute, 10 * 60 + 15);
	});

	it("move a day across, and stop at the edges of the view", () => {
		assert.equal(moveFocus(slot, "ArrowLeft", week)?.date, "2026-11-03");
		assert.equal(moveFocus(slot, "ArrowRight", week)?.date, "2026-11-05");
		assert.equal(
			moveFocus({ date: "2026-11-08", minute: 0 }, "ArrowRight", week)?.date,
			"2026-11-08",
		);
		assert.equal(
			moveFocus({ date: "2026-11-02", minute: 0 }, "ArrowUp", week)?.minute,
			0,
		);
	});

	it("leave every other key alone", () => {
		assert.equal(moveFocus(slot, "Enter", week), null);
	});
});

describe("Shift and the arrows", () => {
	it("stretch the range from where the stretch began", () => {
		assert.deepEqual(
			stretchRange(
				{ date: "2026-11-04", minute: 10 * 60 },
				{ date: "2026-11-04", minute: 11 * 60 + 15 },
			),
			{
				date: "2026-11-04",
				endDate: "2026-11-04",
				startTime: "10:00",
				endTime: "11:30",
				allDay: false,
			},
		);
	});

	it("stretch upwards as well as down", () => {
		const range = stretchRange(
			{ date: "2026-11-04", minute: 10 * 60 },
			{ date: "2026-11-04", minute: 9 * 60 },
		);
		assert.equal(range.startTime, "09:00");
		assert.equal(range.endTime, "10:15");
	});

	it("stretch across days into one range", () => {
		const range = stretchRange(
			{ date: "2026-11-04", minute: 22 * 60 },
			{ date: "2026-11-05", minute: 60 },
		);
		assert.deepEqual(range, {
			date: "2026-11-04",
			startTime: "22:00",
			endDate: "2026-11-05",
			endTime: "01:15",
			allDay: false,
		});
	});
});
