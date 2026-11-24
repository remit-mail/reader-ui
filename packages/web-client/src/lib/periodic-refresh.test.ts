import assert from "node:assert/strict";
import { test } from "node:test";
import {
	candidateMessages,
	OversizedBody,
	PERIODIC_MAX_BYTES,
	PERIODIC_MAX_MS,
	PeriodicBudget,
	RunLimit,
} from "./periodic-refresh";

test("each candidate is considered once across INBOX pages", () => {
	const seen = new Set(["earlier-inbox"]);
	assert.deepEqual(
		[
			...candidateMessages(
				["first", "earlier-inbox", "first", "second"].map((messageId) => ({
					messageId,
				})),
				seen,
			),
		],
		["first", "second"],
	);
	assert.deepEqual([...candidateMessages([{ messageId: "first" }], seen)], []);
});

test("the elapsed time limit includes the deadline", () => {
	const budget = new PeriodicBudget("tenant", 1_000);
	try {
		budget.check(1_000 + PERIODIC_MAX_MS - 1);
		assert.throws(() => budget.check(1_000 + PERIODIC_MAX_MS), RunLimit);
	} finally {
		budget.close();
	}
});

test("a metadata spike stops the run without marking the body oversized", async () => {
	const busy = new PeriodicBudget("tenant");
	const quiet = new PeriodicBudget("tenant");
	const body = new Uint8Array(PERIODIC_MAX_BYTES - 1024);
	try {
		await busy.read(new Response(new Uint8Array(2048)), "api");
		await assert.rejects(
			busy.read(new Response(body), "body"),
			(error) => error instanceof RunLimit && !(error instanceof OversizedBody),
		);
		await quiet.read(new Response("{}"), "api");
		const response = await quiet.read(new Response(body), "body");
		assert.equal((await response.arrayBuffer()).byteLength, body.byteLength);
	} finally {
		busy.close();
		quiet.close();
	}
});

test("a streamed body that exceeds the full cap is oversized", async () => {
	const budget = new PeriodicBudget("tenant");
	try {
		await assert.rejects(
			budget.read(new Response(new Uint8Array(PERIODIC_MAX_BYTES + 1)), "body"),
			OversizedBody,
		);
	} finally {
		budget.close();
	}
});

test("a body that fits a fresh budget can exceed the rest of a used budget", async () => {
	const budget = new PeriodicBudget("tenant");
	try {
		await budget.read(new Response("first body"), "body");
		await assert.rejects(
			budget.read(new Response(new Uint8Array(PERIODIC_MAX_BYTES - 1)), "body"),
			(error) => error instanceof RunLimit && !(error instanceof OversizedBody),
		);
	} finally {
		budget.close();
	}
});
