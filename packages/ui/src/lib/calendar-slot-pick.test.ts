import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	allDayRange,
	clickRange,
	isDrag,
	isDraggedSelection,
	minuteAt,
	pointPick,
	rangeMinutes,
	rangePick,
	timedRange,
} from "./calendar-slot-pick.js";

describe("pointPick", () => {
	it("drafts an hour from the point that was clicked", () => {
		assert.deepEqual(pointPick("2026-06-10T14:30:00+02:00", false), {
			date: "2026-06-10",
			endDate: "2026-06-10",
			startTime: "14:30",
			endTime: "15:30",
			allDay: false,
		});
	});

	it("reads the clock off the string, not off the host's zone", () => {
		/* The same instant, written in two zones. A pick reads the wall clock the
		   grid drew, so each keeps its own — a Date would collapse both to the
		   runner's zone. */
		assert.equal(
			pointPick("2026-06-10T09:00:00+02:00", false).startTime,
			"09:00",
		);
		assert.equal(pointPick("2026-06-10T07:00:00Z", false).startTime, "07:00");
	});

	it("carries an all-day point with no clock at all", () => {
		assert.deepEqual(pointPick("2026-06-10", true), {
			date: "2026-06-10",
			endDate: "2026-06-10",
			startTime: "",
			endTime: "",
			allDay: true,
		});
	});

	it("rolls a draft that runs past midnight round the clock", () => {
		const pick = pointPick("2026-06-10T23:30:00+02:00", false);
		assert.equal(pick.endTime, "00:30");
		assert.equal(pick.endDate, "2026-06-11");
	});
});

describe("rangePick", () => {
	it("keeps both ends of a dragged range", () => {
		assert.deepEqual(
			rangePick(
				"2026-06-10T09:00:00+02:00",
				"2026-06-10T11:30:00+02:00",
				false,
			),
			{
				date: "2026-06-10",
				endDate: "2026-06-10",
				startTime: "09:00",
				endTime: "11:30",
				allDay: false,
			},
		);
	});

	it("keeps a dragged range that runs past midnight on its own end day", () => {
		assert.deepEqual(
			rangePick(
				"2026-06-10T22:00:00+02:00",
				"2026-06-11T01:00:00+02:00",
				false,
			),
			{
				date: "2026-06-10",
				endDate: "2026-06-11",
				startTime: "22:00",
				endTime: "01:00",
				allDay: false,
			},
		);
	});

	it("drops the clock off an all-day range and keeps its last day", () => {
		assert.deepEqual(rangePick("2026-06-10", "2026-06-13", true), {
			date: "2026-06-10",
			endDate: "2026-06-12",
			startTime: "",
			endTime: "",
			allDay: true,
		});
	});
});

describe("isDraggedSelection", () => {
	const slot = 30;

	it("calls one slot a click, not a drag", () => {
		assert.equal(
			isDraggedSelection(
				"2026-06-10T09:00:00+02:00",
				"2026-06-10T09:30:00+02:00",
				false,
				slot,
			),
			false,
		);
	});

	it("calls anything wider than a slot a drag", () => {
		assert.equal(
			isDraggedSelection(
				"2026-06-10T09:00:00+02:00",
				"2026-06-10T10:00:00+02:00",
				false,
				slot,
			),
			true,
		);
	});

	it("measures against the slot in force, so a coarser grid clicks wider", () => {
		assert.equal(
			isDraggedSelection(
				"2026-06-10T09:00:00+02:00",
				"2026-06-10T10:00:00+02:00",
				false,
				60,
			),
			false,
		);
	});

	it("calls a single all-day cell a click", () => {
		assert.equal(
			isDraggedSelection("2026-06-10", "2026-06-11", true, slot),
			false,
		);
	});

	it("calls two all-day cells a drag", () => {
		assert.equal(
			isDraggedSelection("2026-06-10", "2026-06-12", true, slot),
			true,
		);
	});

	it("survives a day that changed length under it", () => {
		/* The Amsterdam DST spring forward: 25 to 26 October is 25 hours long, and
		   rounding is what keeps that one cell a click. */
		assert.equal(
			isDraggedSelection(
				"2026-10-25T00:00:00+02:00",
				"2026-10-26T00:00:00+01:00",
				true,
				slot,
			),
			false,
		);
	});
});

describe("dragging a range", () => {
	it("calls a press that moved less than 4 pixels a click", () => {
		assert.equal(isDrag(3, 0), false);
		assert.equal(isDrag(2, 2), false);
		assert.equal(isDrag(0, 4), true);
	});

	it("snaps to the quarter hour the pointer is over", () => {
		assert.equal(minuteAt(0, 48), 0);
		assert.equal(minuteAt(47, 48), 45);
		assert.equal(minuteAt(48 * 9 + 13, 48), 9 * 60 + 15);
		assert.equal(minuteAt(48 * 30, 48), 1425);
		assert.equal(minuteAt(-5, 48), 0);
	});

	it("keeps a timed range in the column it started in, either way up", () => {
		assert.deepEqual(timedRange("2026-11-04", 8 * 60, 9 * 60 + 30), {
			date: "2026-11-04",
			endDate: "2026-11-04",
			startTime: "08:00",
			endTime: "09:45",
			allDay: false,
		});
		assert.deepEqual(
			timedRange("2026-11-04", 9 * 60 + 30, 8 * 60),
			timedRange("2026-11-04", 8 * 60, 9 * 60 + 30),
		);
	});

	it("ends a drag to the bottom at the next midnight", () => {
		const late = timedRange("2026-11-04", 23 * 60, 23 * 60 + 45);
		assert.equal(late.endDate, "2026-11-05");
		assert.equal(late.endTime, "00:00");
		assert.deepEqual(rangeMinutes(late), { start: 23 * 60, end: 1440 });
	});

	it("selects an hour from the quarter a click lands on", () => {
		assert.deepEqual(clickRange("2026-11-04", 14 * 60 + 15), {
			date: "2026-11-04",
			endDate: "2026-11-04",
			startTime: "14:15",
			endTime: "15:15",
			allDay: false,
		});
	});

	it("spans days in the all-day row, in either direction", () => {
		assert.deepEqual(allDayRange("2026-11-06", "2026-11-03"), {
			date: "2026-11-03",
			endDate: "2026-11-06",
			startTime: "",
			endTime: "",
			allDay: true,
		});
	});
});
