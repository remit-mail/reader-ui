/**
 * Mounts the real hook against the real fetch seam to prove the pending state
 * a press needs actually toggles (issue #648 review): with no optimistic
 * cache patch, a press that never flips `isReporting`/`isRestoring` would be
 * a genuinely dead control — nothing visible changes until the request lands.
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { createDomHarness, type DomHarness } from "../test-support/dom";
import { type HttpMock, httpError, mockFetch } from "../test-support/http";
import { useReportSpam } from "./useReportSpam";

let harness: DomHarness | undefined;
let http: HttpMock;

const mountHook = <T>(useHook: () => T): (() => T) => {
	let value: T | undefined;
	const Probe = () => {
		value = useHook();
		return null;
	};
	harness = createDomHarness();
	harness.renderApp(createElement(Probe));
	return () => {
		if (value === undefined) throw new Error("hook did not render");
		return value;
	};
};

afterEach(() => {
	harness?.close();
	harness = undefined;
	http.restore();
});

/**
 * Polls `predicate` until it's true, yielding real event-loop turns between
 * attempts rather than spinning a fixed count of microtask flushes — the
 * chain from a resolved fetch to a re-render crosses enough async boundaries
 * (response parsing, `throwOnBulkFailure`, `onSuccess`'s invalidation, React's
 * commit) that a fixed count reads as flaky under load instead of wrong.
 */
const waitFor = async (
	predicate: () => boolean,
	timeoutMs = 2000,
): Promise<void> => {
	if (!harness) throw new Error("nothing mounted");
	const deadline = Date.now() + timeoutMs;
	while (!predicate()) {
		if (Date.now() > deadline) {
			throw new Error(
				`waitFor: condition never became true within ${timeoutMs}ms`,
			);
		}
		await harness.flush();
		await harness.wait(5);
	}
};

describe("useReportSpam pending state (#648 review)", () => {
	it("isReporting goes true for the duration of an in-flight report, then false", async () => {
		let resolveRequest: (() => void) | undefined;
		http = mockFetch(
			() =>
				new Promise((resolve) => {
					resolveRequest = () => resolve({ successCount: 1, failureCount: 0 });
				}),
		);
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));

		assert.equal(hook().isReporting, false);

		hook().reportSpam(["msg-1"]);
		await waitFor(() => hook().isReporting === true);

		assert.ok(resolveRequest, "the request never reached the mock");
		resolveRequest?.();
		await waitFor(() => hook().isReporting === false);
	});

	it("isRestoring goes true for the duration of an in-flight undo, then false", async () => {
		let resolveRequest: (() => void) | undefined;
		http = mockFetch(
			() =>
				new Promise((resolve) => {
					resolveRequest = () => resolve({ successCount: 1, failureCount: 0 });
				}),
		);
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-junk" }));

		assert.equal(hook().isRestoring, false);

		hook().notSpam(["msg-1"]);
		await waitFor(() => hook().isRestoring === true);

		resolveRequest?.();
		await waitFor(() => hook().isRestoring === false);
	});

	it("sends the request to the report-spam endpoint with the pressed message id", async () => {
		http = mockFetch(() => ({ successCount: 1, failureCount: 0 }));
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));

		hook().reportSpam(["msg-1"]);
		await waitFor(() => http.to("/messages/report-spam").length > 0);

		const calls = http.to("/messages/report-spam");
		assert.equal(calls.length, 1);
		assert.deepEqual(calls[0].body, { messageIds: ["msg-1"] });
	});
});

const bannerAlerts = () =>
	harness?.queryAll('[aria-label="Notifications"] [role="alert"]') ?? [];

describe("useReportSpam failures", () => {
	for (const action of ["reportSpam", "notSpam"] as const) {
		it(`${action} shows a per-message failure once`, async () => {
			http = mockFetch(() => ({ failureCount: 1 }));
			const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));
			hook()[action](["msg-1"]);
			await waitFor(() => bannerAlerts().length > 0);
			assert.equal(bannerAlerts().length, 1);
			assert.match(
				bannerAlerts()[0]?.textContent ?? "",
				/This message could not be processed/,
			);
		});
	}
	it("shows a 500 beside the spam action", async () => {
		http = mockFetch(() => httpError(500, "spam service is down"));
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));
		hook().reportSpam(["msg-1"]);
		await waitFor(() => bannerAlerts().length > 0);
		assert.match(bannerAlerts()[0]?.textContent ?? "", /spam service is down/);
	});
});
