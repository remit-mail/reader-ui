import assert from "node:assert/strict";
import { test } from "node:test";
import { AppShellSlotted } from "@remit/ui";
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterContextProvider,
} from "@tanstack/react-router";
import { createElement } from "react";
import { MailNav } from "../components/mail/MailNav";
import { DeleteAccountDialog } from "../components/settings/DeleteAccountDialog";
import { installOfflineRuntime } from "../lib/offline-runtime";
import { createDomHarness } from "../test-support/dom";
import { AccountMenu } from "./AccountMenu";
import {
	type AuthAccountProps,
	AuthProviderProvider,
	noneAuthProvider,
} from "./provider";

Object.defineProperty(globalThis, "self", {
	configurable: true,
	value: window,
});

test("account menu awaits exactly one wipe before provider logout", async (t) => {
	const view = createDomHarness({ viewportWidth: 390 });
	const runtime = installOfflineRuntime({
		verifySession: async () => null,
		reauthenticate: () => {},
	});
	t.after(() => {
		view.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	});

	const order: string[] = [];
	let finish!: () => void;
	const wipe = t.mock.method(runtime, "removeDownloads", async () => {
		order.push("wipe");
		await new Promise<void>((resolve) => {
			finish = resolve;
		});
	});
	const provider = {
		...noneAuthProvider,
		Account: ({ children }: AuthAccountProps) =>
			children({
				email: "reader@example.test",
				signOut: () => {
					order.push("logout");
				},
			}),
	};
	const router = createRouter({
		routeTree: createRootRoute(),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	view.renderApp(
		createElement(
			AuthProviderProvider,
			{ value: provider },
			createElement(RouterContextProvider, {
				router,
				// biome-ignore lint/correctness/noChildrenProp: RouterContextProvider requires children in its props type.
				children: createElement(AccountMenu),
			}),
		),
	);
	await view.flush();
	view.click(view.byLabel("Account"));
	view.click(document.querySelector('[role="menuitem"]:last-child')!);
	await view.waitFor(() => wipe.mock.callCount() === 1, "wipe started");
	assert.deepEqual(order, ["wipe"]);
	finish();
	await view.waitFor(() => order.includes("logout"), "provider signed out");
	assert.deepEqual(order, ["wipe", "logout"]);
	assert.equal(wipe.mock.callCount(), 1);
});

test("mobile navigation awaits exactly one wipe before provider logout", async (t) => {
	const view = createDomHarness({ viewportWidth: 390 });
	const runtime = installOfflineRuntime({
		verifySession: async () => null,
		reauthenticate: () => {},
	});
	t.after(() => {
		view.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	});
	t.mock.method(globalThis, "fetch", async () =>
		Response.json({ accounts: [], items: [], entries: [], warnings: [] }),
	);
	const order: string[] = [];
	let finish!: () => void;
	const wipe = t.mock.method(runtime, "removeDownloads", async () => {
		order.push("wipe");
		await new Promise<void>((resolve) => {
			finish = resolve;
		});
	});
	const provider = {
		...noneAuthProvider,
		Account: ({ children }: AuthAccountProps) =>
			children({
				email: "reader@example.test",
				signOut: () => {
					order.push("logout");
				},
			}),
	};
	const router = createRouter({
		routeTree: createRootRoute(),
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	view.renderApp(
		createElement(
			AuthProviderProvider,
			{ value: provider },
			createElement(RouterContextProvider, {
				router,
				// biome-ignore lint/correctness/noChildrenProp: RouterContextProvider requires children in its props type.
				children: createElement(AppShellSlotted, {
					nav: createElement(MailNav, { accounts: [] }),
					list: null,
					initialWidth: 390,
					navOpen: true,
				}),
			}),
		),
	);
	await view.flush();
	view.click(document.querySelector('[data-testid="sign-out-button"]')!);
	await view.waitFor(() => wipe.mock.callCount() === 1, "wipe started");
	assert.deepEqual(order, ["wipe"]);
	finish();
	await view.waitFor(() => order.includes("logout"), "provider signed out");
	assert.deepEqual(order, ["wipe", "logout"]);
	assert.equal(wipe.mock.callCount(), 1);
});

test("delete account awaits exactly one wipe before provider logout", async (t) => {
	const view = createDomHarness();
	const runtime = installOfflineRuntime({
		verifySession: async () => null,
		reauthenticate: () => {},
	});
	t.after(() => {
		view.close();
		(Reflect.get(runtime, "channel") as BroadcastChannel).close();
	});
	t.mock.method(globalThis, "fetch", async () =>
		Response.json({ accounts: [], items: [], entries: [], warnings: [] }),
	);
	const order: string[] = [];
	let finish!: () => void;
	const wipe = t.mock.method(runtime, "removeDownloads", async () => {
		order.push("wipe");
		await new Promise<void>((resolve) => {
			finish = resolve;
		});
	});
	const provider = {
		...noneAuthProvider,
		Account: ({ children }: AuthAccountProps) =>
			children({
				email: "reader@example.test",
				signOut: () => {
					order.push("logout");
				},
			}),
	};

	view.renderApp(
		createElement(
			AuthProviderProvider,
			{ value: provider },
			createElement(DeleteAccountDialog, { open: true, onClose: () => {} }),
		),
	);
	await view.flush();
	view.type(document.querySelector("input")!, "reader@example.test");
	view.click(
		[...document.querySelectorAll("button")].find((button) =>
			button.textContent?.includes("Delete everything"),
		)!,
	);
	await view.waitFor(() => wipe.mock.callCount() === 1, "wipe started", 5000);
	assert.deepEqual(order, ["wipe"]);
	finish();
	await view.waitFor(() => order.includes("logout"), "provider signed out");
	assert.deepEqual(order, ["wipe", "logout"]);
	assert.equal(wipe.mock.callCount(), 1);
});
