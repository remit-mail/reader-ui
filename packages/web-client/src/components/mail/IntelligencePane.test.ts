import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { resolveSpamAction } from "./IntelligencePane";

describe("resolveSpamAction", () => {
	test("offers Report spam on an unreported message outside Junk", () => {
		assert.equal(resolveSpamAction({}, false), "reportSpam");
	});

	test("offers Not spam on an unreported Junk message (reader#1553)", () => {
		assert.equal(resolveSpamAction({}, true), "notSpam");
	});

	test("keeps the undo on a reported message, in Junk or not (#648)", () => {
		const reported = { spamReport: { reportedAt: Date.now() } };
		assert.equal(resolveSpamAction(reported, true), "undoSpamReport");
		assert.equal(resolveSpamAction(reported, false), "undoSpamReport");
	});
});
