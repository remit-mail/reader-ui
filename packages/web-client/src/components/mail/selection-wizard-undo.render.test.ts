import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { createElement } from "react";
import { createDomHarness, type DomHarness } from "../../test-support/dom";
import { makeAccount, makeMailbox } from "../../test-support/fixtures";
import { type HttpMock, mockFetch } from "../../test-support/http";
import { SelectionWizardHost } from "./SelectionWizardHost";

(globalThis as { self?: typeof globalThis }).self ??= globalThis;

let dom: DomHarness | undefined;
let http: HttpMock | undefined;
afterEach(() => {
	dom?.close();
	http?.restore();
});

it("marks a bounded selection immediately and Undo preserves messages already read", async () => {
	http = mockFetch((call) => {
		if (call.path.endsWith("/config"))
			return { accounts: [makeAccount({ accountId: "acc-1" })] };
		if (call.path.endsWith("/mailboxes"))
			return {
				items: [makeMailbox({ mailboxId: "inbox", fullPath: "INBOX" })],
			};
		return { successCount: 2, failureCount: 0, items: [] };
	});
	const root = createRootRoute({ component: Outlet });
	const mail = createRoute({
		getParentRoute: () => root,
		path: "/mail",
		validateSearch: (search: Record<string, unknown>) => search,
		component: () =>
			createElement(SelectionWizardHost, {
				verb: "markRead",
				accountId: "acc-1",
				mailboxId: "inbox",
				onFinished: () => {},
				selection: [false, true].map((isRead, index) => ({
					id: `m${index}`,
					accountId: "acc-1",
					mailboxId: "inbox",
					isRead,
					sender: "Alice",
					email: "a@example.com",
					subject: "Hello",
					date: "Today",
				})),
			}),
	});
	const router = createRouter({
		routeTree: root.addChildren([mail]),
		history: createMemoryHistory({ initialEntries: ["/mail?wizard=match"] }),
	});
	await router.load();
	dom = createDomHarness();
	dom.renderApp(createElement(RouterProvider, { router }));
	await dom.flush();
	await dom.wait(20);
	await dom.waitFor(() => dom?.text().includes("Mark read") === true);
	dom.click(dom.byText("button", "Mark read"));
	await dom.waitFor(() => dom?.text().includes("Undo") === true);
	assert.equal(http.to("/messages/flags").length, 1);
	dom.click(dom.byText("button", "Undo"));
	await dom.waitFor(() => http?.to("/messages/flags").length === 2);
	assert.deepEqual(
		http.to("/messages/flags").map((call) => call.body),
		[
			{ messageIds: ["m0", "m1"], isRead: true },
			{ messageIds: ["m0"], isRead: false },
		],
	);
});
