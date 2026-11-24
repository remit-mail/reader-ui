import assert from "node:assert/strict";
import { test } from "node:test";
import { wrapHttpFailure } from "./api";

test("HTTP failures show sanitized validation paths and messages", () => {
	const body = {
		message: "Invalid request",
		errors: [
			{
				path: "/name",
				rule: "minLength",
				message: "must NOT have fewer than 1 characters",
			},
			{ path: "/clauses/0/value", rule: "type", message: "must be string" },
			{
				path: "",
				rule: "required",
				message: "must have required property 'name'",
			},
		],
	};
	const error = wrapHttpFailure(body, 400);
	assert.equal(
		error.message,
		"/name: must NOT have fewer than 1 characters; /clauses/0/value: must be string; /: must have required property 'name'",
	);
	assert.equal(error.status, 400);
	assert.equal(error.body, body);
});

test("HTTP failures keep the server message or status when no validation detail exists", () => {
	assert.equal(
		wrapHttpFailure({ message: "Export unavailable", errors: [] }, 503).message,
		"Export unavailable",
	);
	assert.equal(
		wrapHttpFailure(undefined, 502).message,
		"Request failed with status 502",
	);
});
