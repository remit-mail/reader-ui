import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	reloadOnceForChunkFailure,
	STALE_BUILD_RELOAD_KEY_PREFIX,
} from "./stale-build";

const memoryGuard = (): Pick<Storage, "getItem" | "setItem"> => {
	const store = new Map<string, string>();
	return {
		getItem: (key) => store.get(key) ?? null,
		setItem: (key, value) => {
			store.set(key, value);
		},
	};
};

describe("reloadOnceForChunkFailure", () => {
	it("reloads once per build, keyed by its commit", () => {
		const guard = memoryGuard();
		let reloads = 0;
		const ports = {
			reload: () => {
				reloads += 1;
			},
			guard,
			commit: "aaa",
		};
		assert.equal(reloadOnceForChunkFailure(ports), true);
		assert.equal(reloadOnceForChunkFailure(ports), false);
		assert.equal(reloads, 1);
		assert.notEqual(guard.getItem(`${STALE_BUILD_RELOAD_KEY_PREFIX}aaa`), null);
	});

	it("reloads again for a different build", () => {
		const guard = memoryGuard();
		guard.setItem(`${STALE_BUILD_RELOAD_KEY_PREFIX}aaa`, "1");
		let reloads = 0;
		const reload = () => {
			reloads += 1;
		};
		assert.equal(
			reloadOnceForChunkFailure({ reload, guard, commit: "aaa" }),
			false,
		);
		assert.equal(
			reloadOnceForChunkFailure({ reload, guard, commit: "bbb" }),
			true,
		);
		assert.equal(reloads, 1);
	});
});

it("keeps unsaved work and does not consume the reload attempt while blocked", async () => {
	const { registerUpdateBlocker } = await import("./pwa-update");
	const guard = memoryGuard();
	let reloads = 0;
	const ports = {
		guard,
		commit: "blocked",
		reload: () => {
			reloads++;
		},
	};
	const release = registerUpdateBlocker(() => true);
	try {
		assert.equal(reloadOnceForChunkFailure(ports), false);
		assert.equal(reloads, 0);
		assert.equal(
			guard.getItem(`${STALE_BUILD_RELOAD_KEY_PREFIX}blocked`),
			null,
		);
	} finally {
		release();
	}
	assert.equal(reloadOnceForChunkFailure(ports), true);
});
