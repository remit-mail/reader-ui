import assert from "node:assert";
import { describe, test } from "node:test";
import type { RemitImapMessageSpamVerdict } from "@remit/api-http-client/types.gen.ts";
import {
	applyRescanResult,
	type CheckAgainTarget,
	EMPTY_SUMMARY,
	rescanBatches,
} from "./check-again.js";

const target = (
	messageId: string,
	accountId: string,
	before?: CheckAgainTarget["before"],
): CheckAgainTarget => ({
	messageId,
	accountId,
	mailboxId: `inbox-${accountId}`,
	threadId: undefined,
	subject: `Subject ${messageId}`,
	before,
});

const spamLabel = { labelId: "label-spam", name: "Spam", color: "Orange" };

describe("rescanBatches", () => {
	test("splits by account, then into tens, keeping the selection order", () => {
		const targets = [
			...Array.from({ length: 12 }, (_, i) => target(`a${i}`, "acct-a")),
			target("b0", "acct-b"),
		];
		const batches = rescanBatches(targets);
		assert.deepStrictEqual(
			batches.map((batch) => [
				batch.accountId,
				batch.targets.map((t) => t.messageId),
			]),
			[
				[
					"acct-a",
					["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"],
				],
				["acct-a", ["a10", "a11"]],
				["acct-b", ["b0"]],
			],
		);
	});
});

describe("applyRescanResult", () => {
	test("counts what changed and names each failure by subject", () => {
		const [batch] = rescanBatches([
			target("m1", "acct"),
			target("m2", "acct", { label: spamLabel, suspected: true }),
			target("m3", "acct", { label: spamLabel, suspected: true }),
			target("m4", "acct"),
		]);
		assert.ok(batch);
		const checked = (
			action: "None" | "Warn" | "Junk",
		): RemitImapMessageSpamVerdict => ({
			state: "Checked",
			score: 0.5,
			action,
			kind: "Spam",
			reasons: [],
			modelOutcome: "OutOfBand",
		});
		const outcome = applyRescanResult(
			{ summary: EMPTY_SUMMARY, failures: [] },
			batch,
			{
				successful: [
					{ messageId: "m1", verdict: checked("Junk"), labels: [] },
					{ messageId: "m2", verdict: checked("None"), labels: [] },
					{ messageId: "m3", verdict: checked("Warn"), labels: [] },
				],
				failed: [{ messageId: "m4", code: "RateLimited", retryable: true }],
			},
		);
		assert.deepStrictEqual(outcome.summary, {
			nowSpam: 1,
			nowSuspected: 0,
			noLongerSuspected: 1,
		});
		assert.deepStrictEqual(outcome.failures, [
			{
				messageId: "m4",
				subject: "Subject m4",
				code: "RateLimited",
				retryable: true,
			},
		]);
	});
});
