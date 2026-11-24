import assert from "node:assert/strict";
import { test } from "node:test";
import { wrapHttpFailure } from "./api";
import { NetworkError } from "./network-error";
import { classifyPeopleFailure, peopleListFailureReason } from "./people";

test("People failures preserve the server's reason, including unavailable hosts", () => {
	const error = wrapHttpFailure(
		{ message: "People administration is unavailable on this host." },
		404,
	);
	assert.equal(peopleListFailureReason(error), error.message);
	assert.deepEqual(classifyPeopleFailure(error), {
		kind: "failed",
		reason: error.message,
	});
});

test("People transport failures do not claim the action made no change", () => {
	const error = new NetworkError(
		new Error("Connection closed before the response arrived"),
	);
	assert.deepEqual(classifyPeopleFailure(error), {
		kind: "failed",
		reason: error.message,
	});
});
