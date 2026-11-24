import assert from "node:assert/strict";
import { test } from "node:test";
import { PeopleErrorCode } from "@remit/domain-enums";
import { wrapHttpFailure } from "./api";
import { NetworkError } from "./network-error";
import { isPeopleSignedOut, peopleFailureReason } from "./people";

test("only authentication refusals mark the People session signed out", () => {
	for (const [status, code, expected] of [
		[401, "unauthorized", true],
		[403, PeopleErrorCode.CallerDisabled, true],
		[403, PeopleErrorCode.SignInDisabled, true],
		[403, "forbidden", false],
		[503, PeopleErrorCode.SignInDisabled, false],
	] as const) {
		assert.equal(
			isPeopleSignedOut(wrapHttpFailure({ code }, status)),
			expected,
		);
	}
});

test("People failures preserve the server's reason, including unavailable hosts", () => {
	const error = wrapHttpFailure(
		{ message: "People administration is unavailable on this host." },
		404,
	);
	assert.equal(peopleFailureReason(error), error.message);
});

test("People transport failures do not claim the action made no change", () => {
	const error = new NetworkError(
		new Error("Connection closed before the response arrived"),
	);
	assert.equal(peopleFailureReason(error), error.message);
});
