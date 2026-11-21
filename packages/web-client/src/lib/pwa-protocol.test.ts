import assert from "node:assert/strict";
import { test } from "node:test";
import {
	activateWhenSafe,
	COMMIT_UPDATE,
	isAppNavigation,
	PREPARE_UPDATE,
	RELEASE_UPDATE,
	type UpdateClient,
} from "./pwa-protocol";

const tab = (
	id: string,
	safe: boolean | undefined,
): UpdateClient & { released: boolean } => ({
	id,
	released: false,
	postMessage(message, ports) {
		if (
			(message === PREPARE_UPDATE || message === COMMIT_UPDATE) &&
			safe !== undefined
		)
			(ports[0] as MessagePort).postMessage(safe);
		if (message === RELEASE_UPDATE) this.released = true;
	},
});
test("shell navigation excludes authentication and private endpoints", () => {
	for (const path of [
		"/api/config",
		"/content/a",
		"/outbox-upload/a",
		"/upload",
		"/cdn-cgi/access/login",
		"/oauth/callback",
		"/auth/callback",
		"/login",
		"/logout",
		"/mail?reauth=1",
	]) {
		assert.equal(
			isAppNavigation(new URL(path, "https://mail.example")),
			false,
			path,
		);
	}
	for (const path of [
		"/",
		"/mail/inbox",
		"/settings/accounts",
		"/calendar",
		"/mail?reauth=0",
	]) {
		assert.equal(
			isAppNavigation(new URL(path, "https://mail.example")),
			true,
			path,
		);
	}
});
test("one dirty or unresponsive tab vetoes activation and releases safe tabs", async () => {
	for (const safe of [false, undefined]) {
		const tabs = [tab("clean", true), tab("dirty", safe)];
		let activated = false;
		assert.equal(
			await activateWhenSafe(
				async () => tabs,
				async () => {
					activated = true;
				},
			),
			false,
		);
		assert.equal(activated, false);
		assert.ok(tabs.every((client) => client.released));
	}
});
test("all tabs must accept, including tabs opened during preparation", async () => {
	const tabs = [tab("one", true), tab("two", true)];
	let activated = 0;
	assert.equal(
		await activateWhenSafe(
			async () => tabs,
			async () => {
				activated++;
			},
		),
		true,
	);
	assert.equal(activated, 1);
	let calls = 0;
	assert.equal(
		await activateWhenSafe(
			async () => (++calls === 1 ? tabs : [...tabs, tab("new", true)]),
			async () => {
				activated++;
			},
		),
		false,
	);
	assert.equal(activated, 1);
});

test("a write starting during preparation or an activation failure releases the held tabs", async () => {
	const lateWrite = tab("late-write", true);
	lateWrite.postMessage = (message, ports) => {
		if (message === RELEASE_UPDATE) lateWrite.released = true;
		else (ports[0] as MessagePort).postMessage(message === PREPARE_UPDATE);
	};
	assert.equal(
		await activateWhenSafe(
			async () => [lateWrite],
			async () => {
				assert.fail("pending write must veto commit");
			},
		),
		false,
	);
	assert.equal(lateWrite.released, true);
	const clean = tab("clean", true);
	await assert.rejects(
		activateWhenSafe(
			async () => [clean],
			async () => {
				throw new Error("activation failed");
			},
		),
		/activation failed/,
	);
	assert.equal(clean.released, true);
});

test("a dirty tab opened during a delayed commit prevents activation", async () => {
	const old = tab("old", true);
	const dirty = tab("arriving-dirty", false);
	const tabs = [old];
	let commitRequested!: () => void;
	const committing = new Promise<void>((resolve) => {
		commitRequested = resolve;
	});
	let finishCommit!: () => void;
	old.postMessage = (message, ports) => {
		if (message === RELEASE_UPDATE) old.released = true;
		else if (message === COMMIT_UPDATE) {
			finishCommit = () => (ports[0] as MessagePort).postMessage(true);
			commitRequested();
		} else (ports[0] as MessagePort).postMessage(true);
	};
	let activations = 0;
	const activation = activateWhenSafe(
		async () => [...tabs],
		async () => {
			activations++;
		},
	);
	await committing;
	tabs.push(dirty);
	finishCommit();
	assert.equal(await activation, false);
	assert.equal(activations, 0);
	assert.equal(old.released, true);
});
