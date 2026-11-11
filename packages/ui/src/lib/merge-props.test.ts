import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeProps } from "./merge-props.js";

describe("mergeProps", () => {
	it("calls same-named handlers in order", () => {
		const calls: string[] = [];
		const merged = mergeProps(
			{ onClick: () => calls.push("first") },
			{ onClick: () => calls.push("second") },
		);
		merged.onClick();
		assert.deepEqual(calls, ["first", "second"]);
	});
});
