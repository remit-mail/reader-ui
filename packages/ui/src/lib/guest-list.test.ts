import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { invalidGuest, parseGuest, withGuest } from "./guest-list.js";

describe("parseGuest", () => {
	it("reads bare and named addresses, lower-casing the address", () => {
		assert.deepEqual(
			["Ann Smith <Ann@Example.com>", "bob@example.com"].map((text) => {
				const { email, displayName, valid } = parseGuest(text);
				return { email, displayName, valid };
			}),
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

	it("keeps an entry that is not an email, marked invalid, so it can be fixed (FF1.7)", () => {
		const entry = parseGuest("not-an-email");
		assert.equal(entry.valid, false);
		assert.equal(entry.text, "not-an-email");
		assert.equal(
			invalidGuest([parseGuest("a@example.com"), entry])?.text,
			"not-an-email",
		);
		assert.equal(invalidGuest([parseGuest("a@example.com")]), undefined);
	});

	it("refuses an address with no dot in its domain", () => {
		assert.equal(parseGuest("ann@localhost").valid, false);
	});
});

describe("withGuest", () => {
	it("keeps one entry per address", () => {
		const once = withGuest([], parseGuest("a@example.com"));
		assert.equal(withGuest(once, parseGuest("A <a@example.com>")).length, 1);
	});
});
