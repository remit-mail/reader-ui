import assert from "node:assert/strict";
import { test } from "node:test";
import { AppShellSlotted } from "@remit/ui";
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterContextProvider,
} from "@tanstack/react-router";
import { createElement, type ReactNode } from "react";
import { DeleteConfirmDialog } from "../components/mail/DeleteConfirmDialog";
import { MailNav } from "../components/mail/MailNav";
import { MessageBodyErrorBanner } from "../components/mail/MessageBodyErrorBanner";
import { DeleteAccountDialog } from "../components/settings/DeleteAccountDialog";
import { SignedOutOverlay } from "../components/ui/SignedOutOverlay";
import { BodyFetchError } from "../hooks/useMessageBodyContent";
import { installOfflineRuntime } from "../lib/offline-runtime";
import { reportSignedOut, resetSignedOut } from "../lib/signed-out";
import { createDomHarness, type DomHarness } from "../test-support/dom";
import { AccountMenu } from "./AccountMenu";
import { AuthProviderProvider, noneAuthProvider } from "./provider";
import { SignInAgain } from "./SignInAgain";

Object.defineProperty(globalThis, "self", {
	configurable: true,
	value: window,
});
const noop = () => {};
const surfaces: {
	name: string;
	element: () => ReactNode;
	click: (view: DomHarness) => void;
}[] = [
	{
		name: "account menu",
		element: () => createElement(AccountMenu),
		click: (view) => {
			view.click(view.byLabel("Account"));
			view.click(document.querySelector('[role="menuitem"]:last-child')!);
		},
	},
	{
		name: "mobile navigation",
		element: () =>
			createElement(AppShellSlotted, {
				nav: createElement(MailNav, { accounts: [] }),
				list: null,
				initialWidth: 390,
				navOpen: true,
			}),
		click: (view) =>
			view.click(document.querySelector('[data-testid="sign-out-button"]')!),
	},
	{
		name: "sign in again",
		element: () => createElement(SignInAgain),
		click: (view) => view.click(view.byText("button", "Sign in again")),
	},
	{
		name: "body authentication error",
		element: () =>
			createElement(MessageBodyErrorBanner, {
				error: new BodyFetchError("auth", "expired"),
			}),
		click: (view) => view.click(view.byText("button", "Sign in again")),
	},
	{
		name: "signed-out overlay",
		element: () => {
			reportSignedOut();
			return createElement(SignedOutOverlay);
		},
		click: (view) => view.click(view.byText("button", "Sign in")),
	},
	{
		name: "delete unavailable",
		element: () =>
			createElement(DeleteConfirmDialog, {
				isOpen: true,
				messageIds: ["message"],
				outcome: "unavailable",
				onConfirm: noop,
				onCancel: noop,
			}),
		click: (view) =>
			view.click(
				[...document.querySelectorAll("button")].find((button) =>
					button.textContent?.includes("Sign in"),
				)!,
			),
	},
	{
		name: "delete account",
		element: () =>
			createElement(DeleteAccountDialog, { open: true, onClose: noop }),
		click: (view) => {
			view.type(document.querySelector("input")!, "reader@example.test");
			view.click(
				[...document.querySelectorAll("button")].find((button) =>
					button.textContent?.includes("Delete everything"),
				)!,
			);
		},
	},
];

for (const surface of surfaces)
	test(`${surface.name} awaits exactly one wipe before provider logout`, async (t) => {
		const view = createDomHarness({ viewportWidth: 390 });
		const runtime = installOfflineRuntime({
			verifySession: async () => null,
			reauthenticate: noop,
		});
		t.after(() => {
			view.close();
			resetSignedOut();
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
			Account: ({ children }: Parameters<typeof noneAuthProvider.Account>[0]) =>
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
					children: surface.element(),
				}),
			),
		);
		await view.flush();
		surface.click(view);
		await view.waitFor(() => wipe.mock.callCount() > 0, "wipe started", 5000);
		assert.deepEqual(order, ["wipe"]);
		finish();
		await view.waitFor(() => order.includes("logout"), "provider signed out");
		assert.deepEqual(order, ["wipe", "logout"]);
		assert.equal(wipe.mock.callCount(), 1);
	});
