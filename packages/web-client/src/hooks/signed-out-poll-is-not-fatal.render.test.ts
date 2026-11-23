import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
	MutationCache,
	QueryCache,
	QueryClient,
	useMutation,
} from "@tanstack/react-query";
import { createElement, Fragment, useEffect } from "react";
import { FatalErrorOverlay } from "../components/ui/FatalErrorOverlay";
import { ApiError } from "../lib/api";
import { escalate } from "../lib/escalate";
import { __resetFatalError } from "../lib/fatal-error";
import { isSignedOut, resetSignedOut } from "../lib/signed-out";
import { createDomHarness, type DomHarness } from "../test-support/dom";
import { type HttpMock, httpError, mockFetch } from "../test-support/http";
import { SelfUpdateProvider } from "./use-system-update";

let harness: DomHarness | undefined;
let http: HttpMock | undefined;

afterEach(() => {
	harness?.close();
	harness = undefined;
	http?.restore();
	http = undefined;
	__resetFatalError();
	resetSignedOut();
});

const escalatingClient = (): QueryClient =>
	new QueryClient({
		queryCache: new QueryCache({ onError: escalate }),
		mutationCache: new MutationCache({ onError: escalate }),
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

const fatalOverlay = () =>
	harness?.query('[data-testid="fatal-error-overlay"]') ?? null;

/** A write nobody pressed a button for, refused for want of a session. */
const SoftWrite = () => {
	const mutation = useMutation({
		mutationFn: async (): Promise<void> => {
			throw new ApiError("signed out", 401);
		},
	});
	const { mutate } = mutation;
	useEffect(() => {
		mutate();
	}, [mutate]);
	return null;
};

describe("a 401 and who was waiting on it", () => {
	it("shows the signed-out notice, not the fatal page, when the root update poll is signed out", async () => {
		http = mockFetch((call) => {
			if (call.path.endsWith("/system/update")) {
				return httpError(401, "session expired");
			}
			return {};
		});

		harness = createDomHarness({ queryClient: escalatingClient() });
		harness.renderApp(
			createElement(
				Fragment,
				null,
				createElement(FatalErrorOverlay),
				createElement(SelfUpdateProvider, null),
			),
		);
		await harness.flush();
		await harness.wait(50);
		await harness.flush();

		assert.ok(
			http.to("/system/update").length > 0,
			"the poll was made, so the 401 really was classified",
		);
		assert.equal(
			fatalOverlay(),
			null,
			"a background poll's 401 must not take the whole app down",
		);
		assert.ok(isSignedOut(), "the 401 says the session is gone");
	});

	it("takes a soft write's 401 to the signed-out notice", async () => {
		harness = createDomHarness({ queryClient: escalatingClient() });
		harness.renderApp(
			createElement(
				Fragment,
				null,
				createElement(FatalErrorOverlay),
				createElement(SoftWrite),
			),
		);
		await harness.flush();
		await harness.wait(50);
		await harness.flush();

		assert.ok(isSignedOut(), "a signed-out session must reach the notice");
		assert.equal(fatalOverlay(), null);
	});
});
