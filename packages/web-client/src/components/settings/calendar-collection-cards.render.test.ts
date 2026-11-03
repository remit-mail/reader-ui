import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React, { createElement } from "react";
import { renderToString } from "react-dom/server";
import { CalendarCreateCard } from "./CalendarCreateCard";
import { CalendarDetailsForm } from "./CalendarDetailsForm";
import { CalendarFeedCard } from "./CalendarFeedCard";

// The node test loader transpiles remit-ui's `.tsx` with the classic JSX
// runtime, which references a global `React`.
(globalThis as { React?: typeof React }).React = React;

const details = (problem = "", timezone = "Europe/Amsterdam") =>
	renderToString(
		createElement(CalendarDetailsForm, {
			calendarName: "Work",
			timezone,
			isBusy: false,
			problem,
			onSave: () => undefined,
			onDelete: () => undefined,
		}) as never,
	);

describe("CalendarDetailsForm", () => {
	it("offers the name, the zone, a save and a delete", () => {
		const html = details();
		assert.match(html, /value="Work"/);
		assert.match(html, /Europe\/Amsterdam/);
		assert.match(html, /Save changes/);
		assert.match(html, /Delete calendar/);
	});

	it("offers no zone as its own choice, read as UTC", () => {
		assert.match(details("", ""), /None \(read as UTC\)/);
	});

	it("keeps a zone the list does not hold rather than dropping it", () => {
		assert.match(details("", "Mars/Olympus"), /Mars\/Olympus/);
	});

	it("states a refusal in the server's words", () => {
		const html = details("cannot be removed");
		assert.match(html, /role="alert"/);
		assert.match(html.replaceAll("<!-- -->", ""), /Work was not changed/);
		assert.match(html, /cannot be removed/);
	});
});

describe("CalendarCreateCard", () => {
	const create = (problem = "") =>
		renderToString(
			createElement(CalendarCreateCard, {
				isBusy: false,
				problem,
				onCreate: () => Promise.resolve(true),
			}) as never,
		);

	it("asks for a name, an address and a zone", () => {
		const html = create();
		assert.match(html, /New calendar/);
		assert.match(html, />Name</);
		assert.match(html, />Address</);
		assert.match(html, />Time zone</);
		assert.match(html, /Add calendar/);
	});

	it("states a refused create where the button is", () => {
		const html = create("already addresses a calendar");
		assert.match(html, /The calendar was not added/);
		assert.match(html, /already addresses a calendar/);
	});
});

describe("CalendarFeedCard with details", () => {
	it("draws the calendar's settings above its address", () => {
		const html = renderToString(
			createElement(CalendarFeedCard, {
				calendarName: "Work",
				details: createElement("p", null, "calendar details here"),
				state: { status: "absent" },
				mintedUrl: "",
				isBusy: false,
				actionError: undefined,
				onMint: () => undefined,
				onRevoke: () => undefined,
				onDismissMinted: () => undefined,
				onRetry: () => undefined,
			}) as never,
		);
		assert.ok(
			html.indexOf("calendar details here") <
				html.indexOf("Create subscription address"),
		);
	});
});
