/**
 * The fragment across the mail↔calendar switch, and the calendar's side pane.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveSidePaneOpen } from "../lib/calendar-side-pane-pref.js";
import {
	formatOpenPanels,
	isOverlayPanel,
	panelFragments,
	panelsWithOverlay,
	parseOpenPanels,
	retainOpenPanelsAtTier,
} from "./fragment.js";

const retainOnDesktop = retainOpenPanelsAtTier(true);
const retainOnPhone = retainOpenPanelsAtTier(false);

describe("the side pane", () => {
	it("joins the union as a pane, ahead of the overlays", () => {
		assert.deepEqual(panelFragments, [
			"intelligence",
			"sidebar",
			"nav",
			"shortcuts",
		]);
		assert.equal(isOverlayPanel("sidebar"), false);
	});

	it("travels with the reader on a wide tier", () => {
		assert.equal(retainOnDesktop("sidebar,nav"), "sidebar");
	});

	it("is up when the address names it, whatever this device chose", () => {
		assert.equal(resolveSidePaneOpen(["sidebar"], false), true);
	});

	it("follows this device's last choice when the fragment is empty", () => {
		assert.equal(resolveSidePaneOpen([], true), true);
		assert.equal(resolveSidePaneOpen([], false), false);
	});

	it("treats an address naming only the rail as silent about the pane", () => {
		assert.equal(resolveSidePaneOpen(["intelligence"], true), true);
	});

	it("is down when the address names other panels and not this one", () => {
		assert.equal(resolveSidePaneOpen(["intelligence", "nav"], true), false);
	});
});

describe("crossing between mail and the calendar", () => {
	// The nav entry is a `NavLink`, so both directions go through the same
	// retention the mail lists already navigate under.
	it("carries the rail into the calendar and back out again", () => {
		assert.equal(retainOnDesktop("intelligence"), "intelligence");
	});

	it("leaves the slide-over the reader picked the entry from behind", () => {
		assert.equal(retainOnDesktop("nav"), "");
		assert.equal(retainOnDesktop("intelligence,nav"), "intelligence");
	});

	it("leaves the drawer behind on a tier that has no rail", () => {
		assert.equal(retainOnPhone("intelligence"), "");
		assert.equal(retainOnPhone("intelligence,nav"), "");
	});
});

describe("reaching for the folders while on the calendar", () => {
	const opened = (hash: string): string =>
		formatOpenPanels(panelsWithOverlay(parseOpenPanels(hash), "nav"));
	const closed = (hash: string): string =>
		formatOpenPanels(panelsWithOverlay(parseOpenPanels(hash), undefined));

	it("keeps the rail the reader arrived with", () => {
		assert.equal(opened("intelligence"), "intelligence,nav");
		assert.equal(closed("intelligence,nav"), "intelligence");
	});

	it("puts the slide-over up over nothing else, and takes it down again", () => {
		assert.equal(opened(""), "nav");
		assert.equal(closed("nav"), "");
	});

	it("replaces whichever overlay was up, because two cannot be", () => {
		assert.equal(opened("intelligence,shortcuts"), "intelligence,nav");
	});
});
