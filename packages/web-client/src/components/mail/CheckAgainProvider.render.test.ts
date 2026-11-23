import assert from "node:assert/strict";
import { it } from "node:test";
import type { RemitImapRescanResult } from "@remit/api-http-client/types.gen.ts";
import { createElement } from "react";
import { createDomHarness } from "../../test-support/dom";
import { CheckAgainProvider, useCheckAgain } from "./CheckAgainProvider";

it("requests placement and reports the response's moved count", async (t) => {
	const dom = createDomHarness();
	t.after(() => dom.close());
	const requests: Request[] = [];
	t.mock.method(globalThis, "fetch", async (request: Request) => {
		requests.push(request);
		return Response.json({
			successful: [
				{
					messageId: "message",
					verdict: { state: "ScreenedOut", screen: { rule: "Newsletter" } },
					labels: [],
					moved: true,
				},
			],
			failed: [],
		} satisfies RemitImapRescanResult);
	});
	function Trigger() {
		const checkAgain = useCheckAgain();
		return createElement(
			"button",
			{
				type: "button",
				onClick: () =>
					checkAgain?.checkAgain(
						[
							{
								messageId: "message",
								accountId: "account",
								mailboxId: "junk",
								threadId: undefined,
								subject: "Newsletter",
								before: undefined,
							},
						],
						{ panel: true },
					),
			},
			"Check again",
		);
	}
	dom.renderApp(
		createElement(CheckAgainProvider, null, createElement(Trigger)),
	);
	dom.click(dom.byText("button", "Check again"));
	await dom.waitFor(() => dom.text().includes("1 message moved."));
	assert.equal(requests.length, 1);
	const request = requests[0];
	assert.ok(request);
	assert.equal(
		new URL(request.url).pathname,
		"/accounts/account/messages/rescan",
	);
	assert.deepEqual(await request.json(), {
		messageIds: ["message"],
		move: true,
	});
	assert.doesNotMatch(dom.text(), /Nothing moved/);
});
