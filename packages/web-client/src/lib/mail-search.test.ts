import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mailSearchSchema } from "./mail-search.js";

describe("the /mail route search", () => {
	it("accepts an empty search, so the mail list renders on a bare /mail", () => {
		const parsed = mailSearchSchema.safeParse({});
		assert.ok(parsed.success);
		assert.deepEqual(parsed.data, {});
	});

	it("keeps every param a full search carries", () => {
		const parsed = mailSearchSchema.safeParse({
			q: "from:ada",
			wizard: "review",
			wizardFrom: "search",
		});
		assert.ok(parsed.success);
		assert.deepEqual(parsed.data, {
			q: "from:ada",
			wizard: "review",
			wizardFrom: "search",
		});
	});
});
