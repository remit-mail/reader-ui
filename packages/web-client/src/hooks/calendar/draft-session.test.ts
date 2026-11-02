import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CalendarSlotPick } from "@remit/ui";
import {
	type DraftSession,
	drawnRange,
	escapeTarget,
	IDLE,
	draftSessionReducer as reduce,
	type SessionLayers,
} from "./draft-session.js";

const range = (startTime: string, endTime: string): CalendarSlotPick => ({
	date: "2026-11-04",
	endDate: "2026-11-04",
	startTime,
	endTime,
	allDay: false,
});
const none: SessionLayers = { eventPopup: false, sidebar: false, nav: false };
const morning = range("08:00", "09:45");
const afternoon = range("14:00", "15:00");

const opened = (): DraftSession =>
	reduce(IDLE, {
		type: "gesture",
		gesture: { type: "drag-end", range: morning },
		layers: none,
	});

const typed = (): DraftSession => {
	const session = opened();
	if (session.mode !== "quick") throw new Error("not open");
	return reduce(session, {
		type: "change",
		draft: { ...session.draft, title: "Design review", location: "Room 3" },
	});
};

describe("a drag", () => {
	it("draws the range while it moves and opens quick-create on release", () => {
		const dragging = reduce(IDLE, {
			type: "gesture",
			gesture: { type: "drag", range: morning },
			layers: none,
		});
		assert.deepEqual(drawnRange(dragging), morning);
		const session = opened();
		assert.equal(session.mode, "quick");
		assert.deepEqual(drawnRange(session), morning);
	});

	it("is cancelled by Esc, which opens nothing", () => {
		const dragging = reduce(IDLE, {
			type: "gesture",
			gesture: { type: "drag", range: morning },
			layers: none,
		});
		assert.equal(escapeTarget(dragging, none), "drag");
		const cancelled = reduce(dragging, { type: "escape", layers: none });
		assert.deepEqual(cancelled, IDLE);
	});
});

describe("a new selection while quick-create is open", () => {
	it("moves the draft and keeps every typed field", () => {
		const moved = reduce(typed(), {
			type: "gesture",
			gesture: { type: "drag-end", range: afternoon },
			layers: none,
		});
		assert.equal(moved.mode, "quick");
		if (moved.mode !== "quick") return;
		assert.deepEqual(moved.draft.range, afternoon);
		assert.equal(moved.draft.title, "Design review");
		assert.equal(moved.draft.location, "Room 3");
	});
});

describe("dismissing quick-create", () => {
	it("removes popup and range on a click on the grid, and that click starts no range", () => {
		const dismissed = reduce(typed(), {
			type: "gesture",
			gesture: { type: "click", range: afternoon, origin: null },
			layers: none,
		});
		assert.deepEqual(dismissed, IDLE);
		const next = reduce(dismissed, {
			type: "gesture",
			gesture: { type: "click", range: afternoon, origin: null },
			layers: none,
		});
		assert.equal(next.mode, "quick");
	});

	it("removes popup and range on a click on the toolbar or the side pane", () => {
		assert.deepEqual(reduce(typed(), { type: "outside" }), IDLE);
	});

	it("discards after a failed save just the same", () => {
		const failed = reduce(reduce(typed(), { type: "save" }), {
			type: "save-failed",
			problem: "The server didn't answer",
		});
		assert.equal(failed.mode === "quick" && failed.status, "failed");
		assert.deepEqual(reduce(failed, { type: "outside" }), IDLE);
	});
});

describe("saving", () => {
	it("keeps every field when the save fails", () => {
		const failed = reduce(reduce(typed(), { type: "save" }), {
			type: "save-failed",
			problem: "The server didn't answer",
		});
		assert.equal(failed.mode, "quick");
		if (failed.mode !== "quick") return;
		assert.equal(failed.draft.title, "Design review");
		assert.equal(failed.problem, "The server didn't answer");
	});

	it("closes the popup when a retry lands", () => {
		const failed = reduce(reduce(typed(), { type: "save" }), {
			type: "save-failed",
			problem: "x",
		});
		const retried = reduce(reduce(failed, { type: "save" }), { type: "saved" });
		assert.deepEqual(retried, IDLE);
	});
});

describe("the advanced sidebar", () => {
	const expanded = (): DraftSession => reduce(typed(), { type: "expand" });
	const withSidebar: SessionLayers = { ...none, sidebar: true };

	it("carries the typed draft over", () => {
		const session = expanded();
		assert.equal(session.mode, "sidebar");
		assert.equal(
			session.mode === "sidebar" && session.draft.title,
			"Design review",
		);
	});

	it("ignores a click on the grid and outside it", () => {
		const session = expanded();
		const clicked = reduce(session, {
			type: "gesture",
			gesture: { type: "click", range: afternoon, origin: null },
			layers: withSidebar,
		});
		assert.deepEqual(clicked, session);
		assert.deepEqual(reduce(session, { type: "outside" }), session);
	});

	it("moves its draft on a new drag", () => {
		const moved = reduce(expanded(), {
			type: "gesture",
			gesture: { type: "drag-end", range: afternoon },
			layers: withSidebar,
		});
		assert.deepEqual(drawnRange(moved), afternoon);
	});
});

describe("Esc", () => {
	it("closes only the top layer, in order", () => {
		const all: SessionLayers = { eventPopup: true, sidebar: true, nav: true };
		const dragging = reduce(opened(), {
			type: "gesture",
			gesture: { type: "drag", range: afternoon },
			layers: none,
		});
		assert.equal(escapeTarget(dragging, all), "drag");
		const afterDrag = reduce(dragging, { type: "escape", layers: all });
		assert.equal(escapeTarget(afterDrag, all), "popup");
		const afterPopup = reduce(afterDrag, { type: "escape", layers: all });
		assert.deepEqual(afterPopup, IDLE);
		assert.equal(escapeTarget(IDLE, all), "event-popup");
		assert.equal(escapeTarget(IDLE, { ...all, eventPopup: false }), "sidebar");
		assert.equal(escapeTarget(IDLE, { ...none, nav: true }), "nav");
		assert.equal(escapeTarget(IDLE, none), null);
	});
});
