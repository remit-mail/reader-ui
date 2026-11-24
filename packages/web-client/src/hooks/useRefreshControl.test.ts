import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
	inboxSyncedAt,
	REFRESH_POLL_MS,
	type SyncStatusReading,
	waitForSettled,
} from "./useRefreshControl.js";

const BASELINE = 1_700_000_000_000;
const REQUESTED = BASELINE + 1;
const LATER = BASELINE + 5_000;

/** Replays `readings` in order and holds on the last one, counting reads so a
 * test can say when the wait made up its mind. */
const scriptedReader = (readings: readonly SyncStatusReading[]) => {
	const state = { reads: 0 };
	const readStatus = async (): Promise<SyncStatusReading> => {
		const reading = readings[Math.min(state.reads, readings.length - 1)];
		state.reads += 1;
		if (!reading) throw new Error("no reading scripted");
		return reading;
	};
	return { state, readStatus };
};

const wait = (readings: readonly SyncStatusReading[]) => {
	const { state, readStatus } = scriptedReader(readings);
	return {
		state,
		outcome: waitForSettled({
			readStatus,
			requestedAt: REQUESTED,
			signal: new AbortController().signal,
			pollMs: 0,
		}),
	};
};

describe("waitForSettled", () => {
	test("ignores an older round's error and confirms on a later round", async () => {
		const { state, outcome } = wait([
			{ syncPhase: "error", syncRequestedAt: BASELINE },
			{ syncPhase: "syncing_inbox", syncRequestedAt: REQUESTED },
			{ syncPhase: "complete", syncRequestedAt: LATER },
		]);

		assert.equal(await outcome, true);
		assert.equal(state.reads, 3);
	});

	test("confirms when the requested round completes", async () => {
		const { state, outcome } = wait([
			{ syncPhase: "complete", syncRequestedAt: REQUESTED },
		]);

		assert.equal(await outcome, true);
		assert.equal(state.reads, 1);
	});

	test("fails once on the requested round's error", async () => {
		const { state, outcome } = wait([
			{ syncPhase: "error", syncRequestedAt: BASELINE },
			{ syncPhase: "error", syncRequestedAt: REQUESTED },
			{ syncPhase: "complete", syncRequestedAt: LATER },
		]);

		await assert.rejects(outcome, /Sync failed for this account/);
		assert.equal(state.reads, 2);
	});

	test("ends without reading again when cancelled", async ({ mock }) => {
		mock.timers.enable({ apis: ["setTimeout"] });
		const controller = new AbortController();
		const { state, readStatus } = scriptedReader([
			{ syncPhase: "syncing_inbox" },
		]);
		const outcome = waitForSettled({
			requestedAt: REQUESTED,
			readStatus,
			signal: controller.signal,
		});
		await Promise.resolve();
		controller.abort();
		assert.equal(await outcome, false);
		mock.timers.tick(REFRESH_POLL_MS);
		assert.equal(state.reads, 1);
	});

	test("an account that has never synced confirms on its first stamp", async () => {
		const { state, readStatus } = scriptedReader([
			{ syncPhase: "idle", syncRequestedAt: undefined },
			{ syncPhase: "complete", syncRequestedAt: LATER },
		]);

		const outcome = await waitForSettled({
			readStatus,
			requestedAt: REQUESTED,
			signal: new AbortController().signal,
			pollMs: 0,
		});

		assert.equal(outcome, true);
		assert.equal(state.reads, 2);
	});

	test("surfaces a failed status read", async () => {
		const failure = new Error("signed out");
		await assert.rejects(
			waitForSettled({
				readStatus: () => Promise.reject(failure),
				requestedAt: REQUESTED,
				signal: new AbortController().signal,
			}),
			failure,
		);
	});
});

const inbox = (lastSyncedAt: number) => ({
	fullPath: "INBOX",
	lastSyncedAt,
});
const junk = (lastSyncedAt: number) => ({
	fullPath: "Junk",
	lastSyncedAt,
});

describe("inboxSyncedAt", () => {
	test("reads the INBOX stamp whatever case the server spells it in", () => {
		assert.equal(
			inboxSyncedAt({
				mailboxes: [junk(LATER), { fullPath: "Inbox", lastSyncedAt: BASELINE }],
			}),
			BASELINE,
		);
	});

	test("is zero for an account with no INBOX or no stamp yet", () => {
		assert.equal(inboxSyncedAt({ mailboxes: [junk(LATER)] }), 0);
		assert.equal(inboxSyncedAt({ mailboxes: [{ fullPath: "INBOX" }] }), 0);
		assert.equal(inboxSyncedAt({}), 0);
	});
});

describe("waitForSettled inbox handoff", () => {
	// A round is every folder in queue order, but the mail somebody pressed
	// refresh for is in their inbox. Waiting for the whole round meant the new
	// mail sat unshown while Junk and Trash went by.
	test("announces the inbox while the round is still running", async () => {
		const announced: number[] = [];
		const { state, readStatus } = scriptedReader([
			{
				syncPhase: "syncing_inbox",
				syncRequestedAt: LATER,
				mailboxes: [inbox(BASELINE)],
			},
			{
				syncPhase: "syncing_others",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
			{
				syncPhase: "syncing_others",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
			{
				syncPhase: "complete",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
		]);

		const outcome = await waitForSettled({
			readStatus,
			requestedAt: REQUESTED,
			baselineInboxSyncedAt: BASELINE,
			onInboxSynced: () => announced.push(state.reads),
			signal: new AbortController().signal,
			pollMs: 0,
		});

		assert.equal(outcome, true);
		// Second reading, two readings before the round confirmed.
		assert.deepEqual(announced, [2]);
		assert.equal(state.reads, 4);
	});

	test("announces the inbox once, not on every poll", async () => {
		let announced = 0;
		const { readStatus } = scriptedReader([
			{
				syncPhase: "syncing_others",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
			{
				syncPhase: "syncing_others",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
			{
				syncPhase: "complete",
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			},
		]);

		await waitForSettled({
			readStatus,
			requestedAt: REQUESTED,
			baselineInboxSyncedAt: BASELINE,
			onInboxSynced: () => {
				announced += 1;
			},
			signal: new AbortController().signal,
			pollMs: 0,
		});

		assert.equal(announced, 1);
	});

	// The caller already treats a settled round as the confirmed state and
	// reloads there, so announcing on the same reading would double the work.
	test("does not announce when the round settles first", async () => {
		let announced = 0;

		await waitForSettled({
			readStatus: async () => ({
				syncPhase: "complete" as const,
				syncRequestedAt: LATER,
				mailboxes: [inbox(LATER)],
			}),
			requestedAt: REQUESTED,
			baselineInboxSyncedAt: BASELINE,
			onInboxSynced: () => {
				announced += 1;
			},
			signal: new AbortController().signal,
			pollMs: 0,
		});

		assert.equal(announced, 0);
	});

	// A folder other than INBOX syncing is not the mail being waited for.
	test("does not announce on another folder's stamp moving", async () => {
		let announced = 0;

		await waitForSettled({
			readStatus: scriptedReader([
				{
					syncPhase: "syncing_others",
					syncRequestedAt: LATER,
					mailboxes: [inbox(BASELINE), junk(LATER)],
				},
				{
					syncPhase: "complete",
					syncRequestedAt: LATER,
					mailboxes: [inbox(BASELINE), junk(LATER)],
				},
			]).readStatus,
			requestedAt: REQUESTED,
			baselineInboxSyncedAt: BASELINE,
			onInboxSynced: () => {
				announced += 1;
			},
			signal: new AbortController().signal,
			pollMs: 0,
		});

		assert.equal(announced, 0);
	});
});
