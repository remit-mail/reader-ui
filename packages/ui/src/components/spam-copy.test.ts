import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RemitImapSpamReason } from "@remit/api-http-client/types.gen.ts";
import { topSpamReason } from "./spam-copy.js";

describe("topSpamReason", () => {
	const reason = (
		name: RemitImapSpamReason["name"],
		score: number,
	): RemitImapSpamReason => ({
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
