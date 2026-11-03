import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	formatGuestList,
	invalidGuest,
	parseGuest,
	parseGuestList,
} from "./guest-list.js";

describe("parseGuestList", () => {
	it("reads bare and named addresses, lower-casing the address", () => {
		assert.deepEqual(
			parseGuestList("Ann Smith <Ann@Example.com>, bob@example.com").map(
				({ email, displayName, valid }) => ({ email, displayName, valid }),
			),
			[
				{ email: "ann@example.com", displayName: "Ann Smith", valid: true },
				{
					email: "bob@example.com",
					displayName: "bob@example.com",
					valid: true,
				},
			],
		);
	});

	it("splits on comma, semicolon and line break and drops blanks", () => {
		assert.deepEqual(
			parseGuestList("a@example.com;\n b@example.com,, ").map(
				(guest) => guest.email,
			),
			["a@example.com", "b@example.com"],
		);
	});

	it("keeps one entry per address", () => {
		assert.equal(parseGuestList("a@example.com, A <a@example.com>").length, 1);
	});

	it("keeps an entry that is not an email, marked invalid, so it can be fixed (FF1.7)", () => {
		const [entry] = parseGuestList("not-an-email");
		assert.equal(entry?.valid, false);
		assert.equal(entry?.text, "not-an-email");
		assert.equal(
			invalidGuest("a@example.com, not-an-email")?.text,
			"not-an-email",
		);
		assert.equal(invalidGuest("a@example.com"), undefined);
	});

	it("refuses an address with no dot in its domain", () => {
		assert.equal(parseGuest("ann@localhost").valid, false);
	});
});

describe("formatGuestList", () => {
	it("writes back what it parsed", () => {
		const text = "Ann Smith <ann@example.com>, bob@example.com, oops";
		assert.equal(formatGuestList(parseGuestList(text)), text);
	});
});
