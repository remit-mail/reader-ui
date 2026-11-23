import assert from "node:assert/strict";
import { it } from "node:test";
import { checkAgainSummarySentence } from "./check-again-panel.js";

it("reports actual moves independently of verdict changes", () => {
	const summary = {
		nowSpam: 0,
		nowSuspected: 0,
		noLongerSuspected: 0,
		moved: 1,
	};
	assert.equal(
		checkAgainSummarySentence(summary),
		"No verdicts changed. 1 message moved.",
	);
	assert.equal(
		checkAgainSummarySentence({ ...summary, nowSpam: 2, moved: 2 }),
		"2 changed: 2 now reach Spam. 2 messages moved.",
	);
	assert.equal(
		checkAgainSummarySentence({ ...summary, nowSpam: 1, moved: 0 }),
		"1 changed: 1 now reach Spam. Nothing moved.",
	);
});
