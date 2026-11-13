import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPAM_REASON_NAMES } from "./spam-contract.js";
import { spamReasonSentence } from "./spam-copy.js";

describe("spamReasonSentence", () => {
	it("gives every reason name one plain sentence of its own", () => {
		const sentences = SPAM_REASON_NAMES.map((name) => {
			const sentence = spamReasonSentence(name);
			assert.ok(sentence, `${name} has no sentence`);
			assert.match(sentence, /^[A-Z].*\.$/, `${name} is not one sentence`);
			assert.doesNotMatch(sentence, /\.\s/, `${name} is more than a sentence`);
			return sentence;
		});
		assert.equal(new Set(sentences).size, SPAM_REASON_NAMES.length);
	});

	it("knows no sentence for a name this version has not seen", () => {
		assert.equal(spamReasonSentence("SomeFutureCheck"), undefined);
	});
});
