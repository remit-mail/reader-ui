import assert from "node:assert/strict";
import { afterEach, it, mock } from "node:test";
import i18n from "i18next";
import { createElement } from "react";
import { initReactI18next } from "react-i18next";

import { installOfflineRuntime } from "../../lib/offline-runtime";
import { createDomHarness } from "../../test-support/dom";
import {
	OfflineStorageRow,
	OfflineStorageSettings,
} from "./OfflineStorageSettings";

await i18n.use(initReactI18next).init({
	lng: "en",
	resources: { en: { common: {} } },
	defaultNS: "common",
	initImmediate: false,
});

afterEach(() => mock.restoreAll());

it("renders usage and removes downloads only on request, with no session or persistence text", () => {
	const dom = createDomHarness();
	try {
		const remove = mock.fn();
		dom.render(
			createElement(OfflineStorageRow, { usage: 12582912, onRemove: remove }),
		);
		assert.match(dom.text(), /Downloaded mail: 12.0 MiB used/);
		assert.doesNotMatch(dom.text(), /Session|may be removed|Keep downloads/);
		assert.equal(remove.mock.callCount(), 0);
		dom.click(dom.byText("button", "Remove downloads"));
		assert.equal(remove.mock.callCount(), 1);
	} finally {
		dom.close();
	}
});

it("refreshes the storage estimate when Advanced settings opens", async () => {
	const dom = createDomHarness();
	const runtime = installOfflineRuntime({
		verifySession: async () => null,
		reauthenticate() {},
	});
	try {
		runtime.state = { verified: true, usage: 1048576 };
		const storage = mock.method(runtime, "storage", async () => {});
		dom.render(createElement(OfflineStorageSettings));
		await dom.flush();
		assert.equal(storage.mock.callCount(), 1);
		assert.match(dom.text(), /1.0 MiB used/);
	} finally {
		dom.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	}
});
