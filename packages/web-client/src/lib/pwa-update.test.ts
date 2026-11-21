import assert from "node:assert/strict";
import { test } from "node:test";
import { APP_SHA } from "./app-info";
import {
	canUpdate,
	observeServerBuild,
	registerUpdateBlocker,
} from "./pwa-update";

test("composition and pending writes independently block an update", () => {
	let composing = true;
	let pending = false;
	const removeCompose = registerUpdateBlocker(() => composing);
	const removeWrite = registerUpdateBlocker(() => pending);
	assert.equal(canUpdate(), false);
	composing = false;
	pending = true;
	assert.equal(canUpdate(), false);
	pending = false;
	assert.equal(canUpdate(), true);
	removeCompose();
	removeWrite();
});
test("a fresh server mismatch requests a worker update instead of reloading", () => {
	let updates = 0;
	const registration = {
		update: async () => {
			updates++;
			return {} as ServiceWorkerRegistration;
		},
	};
	observeServerBuild(APP_SHA, registration);
	observeServerBuild(undefined, registration);
	assert.equal(updates, 0);
	observeServerBuild("next-build", registration);
	assert.equal(updates, 1);
});
