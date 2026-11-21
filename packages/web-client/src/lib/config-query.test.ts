import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { makeConfig } from "../test-support/fixtures";
import { type HttpMock, mockFetch } from "../test-support/http";
import { configQueryOptions } from "./config-query";

let http: HttpMock | undefined;

afterEach(() => {
	http?.restore();
	http = undefined;
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("configQueryOptions", () => {
	it("keeps one config read when its only observer remounts mid-flight", async () => {
		let answer: (value: unknown) => void = () => {};
		http = mockFetch(
			() =>
				new Promise((resolve) => {
					answer = resolve;
				}),
		);
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});

		const unsubscribe = new QueryObserver(
			queryClient,
			configQueryOptions(),
		).subscribe(() => {});
		await settle();
		unsubscribe();
		const remounted = new QueryObserver(queryClient, configQueryOptions());
		const stop = remounted.subscribe(() => {});
		await settle();
		answer(makeConfig([]));
		await settle();

		assert.equal(http.to("/config").length, 1);
		assert.equal(remounted.getCurrentResult().status, "success");
		stop();
		queryClient.clear();
	});
});
