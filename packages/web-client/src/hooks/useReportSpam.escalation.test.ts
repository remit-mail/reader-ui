import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createElement, Fragment } from "react";
import { FatalErrorOverlay } from "../components/ui/FatalErrorOverlay";
import { escalate } from "../lib/escalate";
import { __resetFatalError, subscribeFatalError } from "../lib/fatal-error";
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
	const queryClient = new QueryClient({
		queryCache: new QueryCache({ onError: escalate }),
		mutationCache: new MutationCache({ onError: escalate }),
		defaultOptions: { mutations: { retry: false } },
	});
	harness = createDomHarness({ queryClient });
	harness.renderApp(
		createElement(
			Fragment,
			null,
			createElement(FatalErrorOverlay),
			createElement(Probe),
		),
	);
	return () => {
		if (value === undefined) throw new Error("hook did not render");
		return value;
	};
};

/** See `useReportSpam.render.test.ts` — the chain from a resolved fetch to a re-render crosses enough async boundaries that a fixed microtask count reads as flaky under load. */
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

const bannerAlerts = () =>
	harness?.queryAll('[aria-label="Notifications"] [role="alert"]') ?? [];

const fatalOverlay = () =>
	harness?.query('[data-testid="fatal-error-overlay"]') ?? null;

afterEach(() => {
	harness?.close();
	harness = undefined;
	http.restore();
	__resetFatalError();
});

describe("useReportSpam under the real global cache handlers (#648 review, the join both existing tests missed)", () => {
	it("a per-message report failure banners once and never mounts the fatal overlay — report direction", async () => {
		const fatalsSeen: string[] = [];
		subscribeFatalError((fatal) => fatalsSeen.push(fatal.message));
		http = mockFetch(() => ({ failureCount: 1 }));
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));

		hook().reportSpam(["msg-1"]);
		await waitFor(() => bannerAlerts().length > 0);

		assert.equal(
			fatalOverlay() !== null,
			false,
			"the fatal overlay must not mount",
		);
		assert.deepEqual(fatalsSeen, [], "no fatal error must be raised");
		assert.equal(bannerAlerts().length, 1, "exactly one banner");
	});

	it("a per-message undo failure banners once and never mounts the fatal overlay — undo direction", async () => {
		const fatalsSeen: string[] = [];
		subscribeFatalError((fatal) => fatalsSeen.push(fatal.message));
		http = mockFetch(() => ({ failureCount: 1 }));
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-junk" }));

		hook().notSpam(["msg-1"]);
		await waitFor(() => bannerAlerts().length > 0);

		assert.equal(
			fatalOverlay() !== null,
			false,
			"the fatal overlay must not mount",
		);
		assert.deepEqual(fatalsSeen, [], "no fatal error must be raised");
		assert.equal(bannerAlerts().length, 1, "exactly one banner");
	});

	it("a 500 is shown beside the spam action", async () => {
		http = mockFetch(() => httpError(500, "spam service is down"));
		const hook = mountHook(() => useReportSpam({ mailboxId: "mbx-inbox" }));

		hook().reportSpam(["msg-1"]);
		await waitFor(() => bannerAlerts().length > 0);

		assert.equal(fatalOverlay(), null);
		assert.match(bannerAlerts()[0]?.textContent ?? "", /spam service is down/);
	});
});
