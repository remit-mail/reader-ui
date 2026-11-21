import assert from "node:assert/strict";
import { test } from "node:test";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { mergePersistedQueries, retainedReadingQuery } from "./offline-runtime";
import { admitContent, OFFLINE_FORMAT, type Partition } from "./offline-store";

const partition: Partition = {
	key: "tenant-a",
	generation: "generation-a",
	epoch: "epoch-a",
	format: OFFLINE_FORMAT,
};
const response = (
	body = "mail",
	mime = "text/plain",
	headers: Record<string, string> = {},
) =>
	new Response(body, {
		headers: {
			"content-type": mime,
			"x-remit-partition": partition.key,
			...headers,
		},
	});

test("content admission preserves legitimate HTML but refuses errors, wrong MIME, tenant, auth, shell, redirects and no-store", async () => {
	assert.equal(
		await admitContent(
			response("<p>mail</p>", "text/html; charset=utf-8"),
			"text/html",
			partition,
		),
		true,
	);
	for (const candidate of [
		new Response("pending", { status: 202 }),
		new Response("error", { status: 500 }),
		response("login", "text/html"),
		response("mail", "text/plain", { "cache-control": "private, no-store" }),
		response("mail", "text/plain", { "x-remit-partition": "other" }),
	])
		assert.equal(await admitContent(candidate, "text/plain", partition), false);
	assert.equal(
		await admitContent(
			response('<div id="root"></div>', "text/html"),
			"text/html",
			partition,
		),
		false,
	);
	for (const type of ["opaque", "opaqueredirect", "error"]) {
		const candidate = response();
		Object.defineProperty(candidate, "type", { value: type });
		assert.equal(await admitContent(candidate, "text/plain", partition), false);
	}
	const redirected = response();
	Object.defineProperty(redirected, "redirected", { value: true });
	assert.equal(await admitContent(redirected, "text/plain", partition), false);
});

test("retention admits reading data and excludes configuration, credentials, exports and drafts", () => {
	for (const id of [
		"messageOperationsDescribeMessage",
		"threadDetailOperationsListThreadMessages",
		"unifiedThreadOperationsListAllThreads",
		"mailboxOperationsListMailboxes",
	])
		assert.equal(retainedReadingQuery({ queryKey: [{ _id: id }] }), true);
	for (const id of [
		"configOperationsGetConfig",
		"outboxDetailOperationsGetOutboxMessage",
		"peopleOperationsListPeople",
		"configOperationsExportConfig",
	])
		assert.equal(retainedReadingQuery({ queryKey: [{ _id: id }] }), false);
	assert.equal(
		retainedReadingQuery({
			queryKey: [
				{
					_id: "messageOperationsDescribeMessage",
					headers: { Authorization: "secret" },
				},
			],
		}),
		false,
	);
	assert.equal(retainedReadingQuery({ queryKey: ["auth"] }), false);
});

test("retained snapshots merge page replacements and errors without overwriting newer descriptors", () => {
	const client = new QueryClient({
		defaultOptions: { queries: { gcTime: Infinity } },
	});
	const descriptor = [
		{ _id: "messageOperationsDescribeMessage", path: { messageId: "old" } },
	];
	const list = [{ _id: "unifiedThreadOperationsListAllThreads" }];
	const snapshot = (): PersistedClient => ({
		buster: String(OFFLINE_FORMAT),
		timestamp: Date.now(),
		clientState: dehydrate(client, {
			shouldDehydrateMutation: () => false,
			shouldDehydrateQuery: (query) =>
				query.state.status === "success" && retainedReadingQuery(query),
		}),
	});
	client.setQueryData(descriptor, "old mail", { updatedAt: 100 });
	client.setQueryData(list, ["old"], { updatedAt: 100 });
	const first = mergePersistedQueries(undefined, snapshot());
	client.clear();
	client.setQueryData(list, ["new page"], { updatedAt: 200 });
	let merged = mergePersistedQueries(first, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => JSON.stringify(query.queryKey) === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	assert.deepEqual(
		merged.clientState.queries.find(
			(query) => JSON.stringify(query.queryKey) === JSON.stringify(list),
		)?.state.data,
		["new page"],
	);
	client.setQueryData(descriptor, "stale tab", { updatedAt: 50 });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	client
		.getQueryCache()
		.find({ queryKey: descriptor })!
		.setState({ status: "error", error: new Error("Offline") });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"old mail",
	);
	client.setQueryData(descriptor, "newly refreshed", { updatedAt: 300 });
	merged = mergePersistedQueries(merged, snapshot());
	assert.equal(
		merged.clientState.queries.find(
			(query) => query.queryHash === JSON.stringify(descriptor),
		)?.state.data,
		"newly refreshed",
	);
	client.clear();
});
