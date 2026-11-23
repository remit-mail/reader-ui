import assert from "node:assert/strict";
import { it } from "node:test";
import {
	messageOperationsDescribeMessageOptions,
	messageOperationsDescribeMessageQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useQuery } from "@tanstack/react-query";
import { createElement } from "react";
import { createDomHarness } from "../test-support/dom";
import { mockFetch } from "../test-support/http";
import { useMessageBodyContent } from "./useMessageBodyContent";

it("renews an expired body link through describe and reads the same part from the cache", async () => {
	const harness = createDomHarness();
	const part = {
		bodyPartId: "part-1",
		partPath: "1",
		mediaType: "TEXT",
		mediaSubtype: "PLAIN",
		contentUrl: "/content/old",
		isMultipart: false,
		sizeOctets: 10,
	};
	const message = { messageId: "message-1", bodyParts: [part] };
	const options = { path: { messageId: message.messageId } };
	harness.queryClient.setQueryData(
		messageOperationsDescribeMessageQueryKey(options),
		message,
	);
	const http = mockFetch(({ path }) => {
		if (path.endsWith("/message-1"))
			return {
				...message,
				bodyParts: [{ ...part, contentUrl: "/content/new" }],
			};
		if (path === "/content/old")
			return new Response("expired", {
				status: 403,
				headers: { "x-remit-403-reason": "expired" },
			});
		if (path === "/content/new") return new Response("renewed mail body");
		throw new Error(`Unexpected request: ${path}`);
	});
	function Body() {
		const { data } = useQuery({
			...messageOperationsDescribeMessageOptions(options),
			staleTime: Infinity,
		});
		const { data: content, error } = useMessageBodyContent({
			messageId: message.messageId,
			bodyParts: data?.bodyParts,
		});
		return createElement("p", null, error ? String(error) : content?.body);
	}
	try {
		harness.renderApp(createElement(Body));
		await harness.waitFor(() => harness.text().includes("renewed mail body"));
		const paths = http.calls.map((call) => call.path);
		assert.equal(paths[0], "/content/old");
		assert.ok(
			paths.indexOf("/api/messages/message-1") < paths.indexOf("/content/new"),
		);
		assert.equal(paths.filter((path) => path === "/content/old").length, 1);
	} finally {
		harness.close();
		http.restore();
	}
});
