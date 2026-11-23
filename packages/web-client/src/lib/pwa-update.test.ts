import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { APP_SHA } from "./app-info";
import { getRecentErrors } from "./console-errors";
import { getCurrentFatalError } from "./fatal-error";
import {
	canUpdate,
	installPwaUpdateCoordinator,
	observeServerBuild,
	registerUpdateBlocker,
} from "./pwa-update";
import { noopTelemetry } from "./telemetry";

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

test("a rejected registration and updates report one warning without a fatal", async () => {
	const failure = new TypeError("Service worker failed during installation");
	const original = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
	let registration: ServiceWorkerRegistration | undefined;
	const sw = Object.assign(new EventTarget(), {
		register: async () => {
			if (!registration) throw failure;
			return registration;
		},
	});
	Object.defineProperty(navigator, "serviceWorker", {
		configurable: true,
		value: sw,
	});
	const warn = mock.method(console, "warn", () => undefined);
	const record = mock.fn();
	try {
		installPwaUpdateCoordinator(() => false, {
			...noopTelemetry,
			recordError: record,
		});
		await new Promise<void>((resolve) => setImmediate(resolve));
		observeServerBuild("next-build", {
			update: async () => {
				throw failure;
			},
		});
		await new Promise<void>((resolve) => setImmediate(resolve));
		registration = Object.assign(new EventTarget(), {
			update: async () => {
				throw failure;
			},
		}) as unknown as ServiceWorkerRegistration;
		installPwaUpdateCoordinator(() => false, {
			...noopTelemetry,
			recordError: record,
		});
		await new Promise<void>((resolve) => setImmediate(resolve));
		window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));
		await new Promise<void>((resolve) => setImmediate(resolve));
		assert.equal(getCurrentFatalError(), null);
		assert.equal(record.mock.callCount(), 1);
		assert.deepEqual(record.mock.calls[0].arguments, [
			failure,
			{ severity: "warning", feature: "service-worker" },
		]);
		assert.equal(warn.mock.callCount(), 1);
		assert.match(
			getRecentErrors().at(-1) ?? "",
			/^Warning: Service worker unavailable:/,
		);
		assert.equal(document.documentElement.inert, undefined);
	} finally {
		window.dispatchEvent(new Event("pagehide"));
		warn.mock.restore();
		if (original) Object.defineProperty(navigator, "serviceWorker", original);
		else Reflect.deleteProperty(navigator, "serviceWorker");
	}
});
