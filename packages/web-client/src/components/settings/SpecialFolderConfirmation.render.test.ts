import assert from "node:assert/strict";
import { afterEach, beforeEach, it } from "node:test";
import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { createElement } from "react";
import { createDomHarness, type DomHarness } from "../../test-support/dom";
import { type HttpMock, httpError, mockFetch } from "../../test-support/http";
import {
	info,
	infoFolders,
	matthijs,
	matthijsFolders,
} from "../../test-support/special-folders";
import { SpecialFoldersStep } from "../onboarding/OnboardingWizard";
import { SpecialFolderConfirmation } from "./SpecialFolderConfirmation";
import { SpecialFolderPrompt } from "./SpecialFolderPrompt";

let dom: DomHarness;
let http: HttpMock;
beforeEach(() => {
	globalThis.localStorage = window.localStorage;
});
afterEach(() => {
	dom?.close();
	http?.restore();
	localStorage.clear();
});

const select = (role: string) =>
	dom.query<HTMLSelectElement>(`select[aria-label="Folder for ${role}"]`) ??
	assert.fail(`Missing ${role}`);
const button = (name: string) => dom.byText("button", name);

it("preselects real folders and saves all four, including unchanged choices, before completing", async () => {
	let completed = false;
	http = mockFetch((call) =>
		call.path === "/config"
			? { accounts: [matthijs] }
			: call.path.endsWith("/mailboxes")
				? { items: matthijsFolders }
				: {},
	);
	dom = createDomHarness();
	// A cached create response must not seed the form.
	dom.queryClient.setQueryData(configOperationsGetConfigOptions().queryKey, {
		accounts: [{ ...matthijs, folderAppointments: [] }],
	});
	dom.renderApp(
		createElement(SpecialFolderConfirmation, {
			accountId: matthijs.accountId,
			onComplete: () => {
				completed = true;
			},
			onCancel: () => {},
		}),
	);
	await dom.waitFor(() => !!dom.query("select"));
	assert.equal(select("Trash").value, "trash");
	assert.equal(select("Sent").value, "sent");
	assert.equal(select("Drafts").value, "drafts");
	assert.equal(select("Archive").value, "archive");
	assert.equal(dom.queryAll("select").length, 4);
	assert.match(dom.text(), /INBOX\/Deleted Messages · 73 messages/);
	assert.match(select("Sent").textContent ?? "", /Sent · 0 msgs/);
	assert.match(select("Sent").textContent ?? "", /Sent Messages · 912 msgs/);
	dom.select(select("Sent"), "sent-empty");
	dom.click(button("Confirm folders"));
	await dom.waitFor(() => completed);
	const writes = http.calls.filter((call) => call.method === "PUT");
	assert.deepEqual(
		writes.map((call) => [call.path, call.body]),
		[
			["/accounts/acc-matthijs/folder-roles/Trash", { mailboxId: "trash" }],
			["/accounts/acc-matthijs/folder-roles/Sent", { mailboxId: "sent-empty" }],
			["/accounts/acc-matthijs/folder-roles/Drafts", { mailboxId: "drafts" }],
			["/accounts/acc-matthijs/folder-roles/Archive", { mailboxId: "archive" }],
		],
	);
});

it("preselects info's proposed Trash without hiding any of its alternatives", async () => {
	http = mockFetch((call) =>
		call.path === "/config" ? { accounts: [info] } : { items: infoFolders },
	);
	dom = createDomHarness();
	dom.renderApp(
		createElement(SpecialFolderConfirmation, {
			accountId: info.accountId,
			onComplete: () => {},
			onCancel: () => {},
		}),
	);
	await dom.waitFor(() => !!dom.query("select"));
	assert.equal(select("Trash").value, "trash");
	assert.deepEqual(
		Array.from(select("Trash").options).map((option) => option.textContent),
		[
			"Prullenbak · 3 msgs",
			"Trash · 62 msgs",
			"Deleted Messages · 0 msgs",
			"Spam · 17 msgs",
		],
	);
	assert.equal(
		(button("Confirm folders") as HTMLButtonElement).disabled,
		false,
	);
});

it("waits for discovery before refetching config and showing choices", async () => {
	let phase = "discovering_mailboxes";
	http = mockFetch((call) => {
		if (call.path.endsWith("/sync/status")) return { syncPhase: phase };
		if (call.path === "/config") return { accounts: [matthijs] };
		return { items: matthijsFolders };
	});
	dom = createDomHarness();
	dom.renderApp(
		createElement(SpecialFoldersStep, {
			accountId: matthijs.accountId,
			onComplete: () => {},
		}),
	);
	await dom.waitFor(() => http.to("/sync/status").length > 0);
	assert.equal(http.to("/config").length, 0);
	assert.equal(dom.query("select"), null);
	phase = "syncing_inbox";
	await dom.queryClient.invalidateQueries();
	await dom.waitFor(() => !!dom.query("select"));
	assert.equal(select("Trash").value, "trash");
	assert.equal(http.to("/config").length, 1);
});

it("leaves failed writes open and never signals completion", async () => {
	let completed = false;
	http = mockFetch((call) =>
		call.path === "/config"
			? { accounts: [matthijs] }
			: call.path.endsWith("/mailboxes")
				? { items: matthijsFolders }
				: httpError(409),
	);
	dom = createDomHarness();
	dom.renderApp(
		createElement(SpecialFolderConfirmation, {
			accountId: matthijs.accountId,
			onComplete: () => {
				completed = true;
			},
			onCancel: () => {},
		}),
	);
	await dom.waitFor(() => !!dom.query("select"));
	dom.click(button("Confirm folders"));
	await dom.waitFor(() => dom.text().includes("Couldn't save special folders"));
	assert.equal(completed, false);
	assert.equal(http.calls.filter((call) => call.method === "PUT").length, 1);
});

it("persists dismissal per account and does not prompt resolved accounts", () => {
	http = mockFetch();
	dom = createDomHarness();
	dom.renderApp(createElement(SpecialFolderPrompt, { account: matthijs }));
	assert.equal(dom.query("button"), null);
	dom.renderApp(
		createElement(SpecialFolderPrompt, { key: info.accountId, account: info }),
	);
	assert.match(dom.text(), /Confirm special folders for info/);
	dom.click(dom.byLabel("Dismiss"));
	dom.unmount();
	dom = createDomHarness();
	dom.renderApp(createElement(SpecialFolderPrompt, { account: info }));
	assert.equal(dom.query("button"), null);
	assert.equal(http.calls.length, 0);
});

it("keeps the prompt after cancelling review, then confirms only selected roles once", async () => {
	http = mockFetch((call) =>
		call.path === "/config"
			? { accounts: [info] }
			: call.path.endsWith("/mailboxes")
				? { items: infoFolders }
				: {},
	);
	dom = createDomHarness();
	dom.renderApp(createElement(SpecialFolderPrompt, { account: info }));
	dom.click(button("Review folders"));
	await dom.waitFor(() => !!dom.query("select"));
	dom.click(button("Cancel"));
	assert.match(dom.text(), /Confirm special folders for info/);
	dom.click(button("Review folders"));
	await dom.waitFor(() => !!dom.query("select"));
	dom.click(button("Confirm folders"));
	await dom.waitFor(() => dom.text() === "");
	assert.deepEqual(
		http.calls
			.filter((call) => call.method === "PUT")
			.map((call) => [call.path, call.body]),
		[["/accounts/acc-info/folder-roles/Trash", { mailboxId: "trash" }]],
	);
	dom.unmount();
	dom = createDomHarness();
	dom.renderApp(createElement(SpecialFolderPrompt, { account: info }));
	assert.equal(dom.text(), "");
});
