import assert from "node:assert/strict";
import { test } from "node:test";
import {
	OversizedBody,
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
		await assert.rejects(
			busy.read(new Response(body), true),
			(error: unknown) =>
				error instanceof RunLimit && !(error instanceof OversizedBody),
		);
		await quiet.read(new Response("{}"));
		const response = await quiet.read(new Response(body));
		assert.equal((await response.arrayBuffer()).byteLength, body.byteLength);
	} finally {
		busy.close();
		quiet.close();
	}
});

test("only body bytes can mark a part oversized", async () => {
	const budget = new PeriodicBudget("tenant");
	try {
		await budget.read(new Response("{}"));
		await assert.rejects(
			budget.read(new Response(new Uint8Array(PERIODIC_MAX_BYTES + 1)), true),
			OversizedBody,
		);
	} finally {
		budget.close();
	}
});

test("a deadline keeps its run limit when the response stream errors", async () => {
	const budget = new PeriodicBudget("tenant");
	const body = new ReadableStream({
		start(controller) {
			budget.controller.signal.addEventListener("abort", () =>
				controller.error(budget.controller.signal.reason),
			);
		},
	});
	try {
		const reading = budget.read(new Response(body));
		budget.controller.abort();
		await assert.rejects(reading, RunLimit);
		assert.equal(body.locked, false);
	} finally {
		budget.close();
	}
});
