import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { configOperationsGetConfigQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { createElement } from "react";
import { createDomHarness, type DomHarness } from "../test-support/dom";
import { makeAccount, makeThreadMessage } from "../test-support/fixtures";
import { type HttpMock, mockFetch } from "../test-support/http";
import { useDeleteMessages } from "./useDeleteMessages";

let dom: DomHarness | undefined;
let http: HttpMock | undefined;
afterEach(() => {
	dom?.close();
	http?.restore();
});

const messages = [
	makeThreadMessage({ messageId: "m1", mailboxId: "inbox" }),
	makeThreadMessage({ messageId: "m2", mailboxId: "archive" }),
];
const Delete = () => {
	const { deleteMessages } = useDeleteMessages({
		mailboxId: "inbox",
	});
	return createElement(
		"button",
		{
			type: "button",
			onClick: () =>
				deleteMessages(
					messages.map((message) => ({
						id: message.messageId,
						mailboxId: message.mailboxId,
						accountId: "acc-1",
					})),
				),
		},
		"Delete",
	);
};

it("Undo returns each trashed message to its original folder", async () => {
	http = mockFetch(() => ({ successCount: 2, failureCount: 0 }));
	dom = createDomHarness();
	dom.queryClient.setQueryData(configOperationsGetConfigQueryKey(), {
		accounts: [
			makeAccount({
				accountId: "acc-1",
				folderAppointments: [
					{ role: "Trash", mailboxId: "trash", source: "Appointed" },
				],
			}),
		],
	});
	dom.renderApp(createElement(Delete));
	dom.click(dom.byText("button", "Delete"));
	await dom.waitFor(() => dom?.text().includes("Undo") === true);
	dom.click(dom.byText("button", "Undo"));
	await dom.waitFor(() => http?.to("/messages/move").length === 2);
	assert.deepEqual(
		http.to("/messages/move").map((call) => call.body),
		[
			{ messageIds: ["m1"], destinationMailboxId: "inbox" },
			{ messageIds: ["m2"], destinationMailboxId: "archive" },
		],
	);
});
