import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getRecentErrors } from "./console-errors";
import {
	__resetFatalError,
	getCurrentFatalError,
	reportFatalError,
	subscribeFatalError,
} from "./fatal-error";

afterEach(() => {
	__resetFatalError();
});

describe("reportFatalError", () => {
	it("notifies subscribers with the classified fatal", () => {
		const seen: string[] = [];
		subscribeFatalError((fatal) => seen.push(fatal.message));

		reportFatalError(new Error("server exploded"));

		assert.deepEqual(seen, ["server exploded"]);
	});

	it("records the fatal into the recent-errors ring (bug-report flow reads it)", () => {
		reportFatalError(new Error("ring me"));
		const recent = getRecentErrors();
		assert.ok(
			recent.some((line) => line.includes("Fatal: ring me")),
			"expected the fatal to land in the console-errors ring",
		);
	});

	it("assigns a correlation id and exposes the current fatal", () => {
		const fatal = reportFatalError(new Error("with id"));
		assert.ok(fatal.correlationId.length > 0);
		assert.equal(getCurrentFatalError(), fatal);
	});

	it("unsubscribe stops further notifications", () => {
		let count = 0;
		const unsubscribe = subscribeFatalError(() => {
			count += 1;
		});
		reportFatalError(new Error("one"));
		unsubscribe();
		reportFatalError(new Error("two"));
		assert.equal(count, 1);
	});
});

describe("fatal error details", () => {
	it("carries the error stack so the bug report can seed from it", () => {
		const error = new Error("with stack");
		const fatal = reportFatalError(error);
		assert.equal(fatal.stack, error.stack);
	});
});
