import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SpamReason } from "./spam-contract.js";
import {
	SCORE_RANGE_ERROR,
	THRESHOLD_ORDER_ERROR,
	topSpamReason,
	validateThresholds,
} from "./spam-copy.js";

describe("validateThresholds", () => {
	it("accepts both ends of the 0 to 1 range", () => {
		assert.deepEqual(validateThresholds({ warn: "0", junk: "1" }), {
			ok: true,
			thresholds: { warn: 0, junk: 1 },
		});
	});

	it("rejects a value outside 0 to 1, or no value, on its own field", () => {
		assert.deepEqual(validateThresholds({ warn: "-0.1", junk: "1.01" }), {
			ok: false,
			errors: { warn: SCORE_RANGE_ERROR, junk: SCORE_RANGE_ERROR },
		});
		assert.deepEqual(validateThresholds({ warn: "0.4", junk: " " }), {
			ok: false,
			errors: { junk: SCORE_RANGE_ERROR },
		});
		assert.deepEqual(validateThresholds({ warn: "abc", junk: "0.8" }), {
			ok: false,
			errors: { warn: SCORE_RANGE_ERROR },
		});
	});

	it("requires Warn from below Move to Spam from", () => {
		const order = { ok: false, errors: { warn: THRESHOLD_ORDER_ERROR } };
		assert.deepEqual(validateThresholds({ warn: "0.9", junk: "0.85" }), order);
		assert.deepEqual(validateThresholds({ warn: "0.85", junk: "0.85" }), order);
		assert.equal(validateThresholds({ warn: "0.84", junk: "0.85" }).ok, true);
	});
});

describe("topSpamReason", () => {
	const reason = (name: SpamReason["name"], score: number): SpamReason => ({
		name,
		symbol: name,
		score,
		options: [],
	});

	it("picks the reason that added the most to the score", () => {
		assert.equal(
			topSpamReason([
				reason("ProviderSpam", 0.1),
				reason("LinkTextMismatch", 0.4),
				reason("DmarcFail", 0.2),
			])?.name,
			"LinkTextMismatch",
		);
	});

	it("keeps the first of two equal scores", () => {
		assert.equal(
			topSpamReason([reason("DmarcFail", 0.3), reason("ProviderSpam", 0.3)])
				?.name,
			"DmarcFail",
		);
	});

	it("has no top reason when there are none", () => {
		assert.equal(topSpamReason([]), undefined);
	});
});
