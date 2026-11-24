import assert from "node:assert/strict";
import { test } from "node:test";
import {
	PERIODIC_MAX_BYTES,
	PERIODIC_MAX_MS,
	PeriodicBudget,
	RunLimit,
} from "./periodic-refresh";

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
		await busy.read(new Response(new Uint8Array(2048)));
		await assert.rejects(busy.read(new Response(body)), RunLimit);
		await quiet.read(new Response("{}"), "api");
		const response = await quiet.read(new Response(body), "body");
		assert.equal((await response.arrayBuffer()).byteLength, body.byteLength);
	} finally {
		busy.close();
		quiet.close();
	}
});
