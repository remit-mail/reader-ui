import assert from "node:assert/strict";
import { afterEach, it, mock } from "node:test";
import i18n from "i18next";
import { createElement } from "react";
import { initReactI18next } from "react-i18next";

import { installOfflineRuntime } from "../../lib/offline-runtime";
import { createDomHarness } from "../../test-support/dom";
import { OfflineStorageSettings } from "./OfflineStorageSettings";

await i18n.use(initReactI18next).init({
	lng: "en",
	resources: { en: { common: {} } },
	defaultNS: "common",
	initImmediate: false,
});

afterEach(() => mock.restoreAll());

it("refreshes the storage estimate when Advanced settings opens", async () => {
	const dom = createDomHarness();
	const runtime = installOfflineRuntime({
		sessionUrl: "/api/session",
		reauthenticate() {},
	});
	try {
		const estimate = mock.fn(async () => ({
			usage: 12582912,
			quota: 1073741824,
		}));
		Object.defineProperty(navigator, "storage", {
			configurable: true,
			value: { estimate, persisted: async () => false },
		});
		dom.render(createElement(OfflineStorageSettings));
		await dom.waitFor(() => dom.text().includes("12.0 MiB used"));
		assert.equal(estimate.mock.callCount(), 1);
	} finally {
		dom.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	}
});
