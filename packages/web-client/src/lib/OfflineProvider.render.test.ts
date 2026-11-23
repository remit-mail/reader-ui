import assert from "node:assert/strict";
import { it } from "node:test";
import { createElement, type ReactNode } from "react";
import { createDomHarness } from "../test-support/dom";
import { OfflineProvider } from "./OfflineProvider";
import { installOfflineRuntime } from "./offline-runtime";
import { OFFLINE_FORMAT } from "./offline-store";

it("renders no storage or session text while opening, restoring or showing mail", async (t) => {
	const dom = createDomHarness();
	const runtime = installOfflineRuntime({
		verifySession: async () => null,
		reauthenticate() {},
	});
	t.after(() => {
		dom.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	});
	let open!: () => void;
	let restore!: () => void;
	t.mock.method(
		runtime,
		"start",
		() =>
			new Promise<void>((resolve) => {
				open = resolve;
			}),
	);
	runtime.state = {
		verified: true,
		partition: {
			key: "tenant",
			generation: "generation",
			epoch: "epoch",
			format: OFFLINE_FORMAT,
		},
		usage: 0,
	};
	t.mock.method(runtime, "persister", () => ({
		persistClient: async () => {},
		restoreClient: async () => {
			await new Promise<void>((resolve) => {
				restore = resolve;
			});
			return undefined;
		},
		removeClient: async () => {},
	}));
	dom.renderApp(
		createElement(OfflineProvider, {
			runtime,
			client: dom.queryClient,
			gate: ({ children }: { children: ReactNode }) => children,
			// biome-ignore lint/correctness/noChildrenProp: createElement requires the children prop in this component’s type.
			children: "Mail shell",
		}),
	);
	assert.equal(dom.text(), "");
	open();
	await dom.waitFor(() => !!restore, "restoration to start");
	assert.equal(dom.text(), "");
	restore();
	await dom.waitFor(() => dom.text().includes("Mail shell"));
	assert.doesNotMatch(
		dom.text(),
		/Downloaded mail|Session verified|session unverified|Opening downloads|Restoring downloads|MiB used|may be removed|Keep downloads|Remove downloads|Verify your session/,
	);
});
