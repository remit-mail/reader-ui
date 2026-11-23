import assert from "node:assert/strict";
import { it } from "node:test";
import { createElement } from "react";
import { MessageBodyErrorBanner } from "../components/mail/MessageBodyErrorBanner";
import { SignedOutOverlay } from "../components/ui/SignedOutOverlay";
import { BodyFetchError } from "../hooks/useMessageBodyContent";
import { reportSignedOut, resetSignedOut } from "../lib/signed-out";
import { createDomHarness } from "../test-support/dom";
import { mockFetch } from "../test-support/http";
import { betterAuthProvider } from "./better-auth-provider";
import { combinedAuthProvider } from "./combined-provider";
import { AuthProviderProvider, noneAuthProvider } from "./provider";
import { SignInAgain } from "./SignInAgain";

it("all real sign-in recovery controls renew without logging the live user out", () => {
	for (const control of [
		createElement(SignedOutOverlay, { key: "overlay" }),
		createElement(SignInAgain, { key: "settings" }),
		createElement(MessageBodyErrorBanner, {
			key: "body",
			error: new BodyFetchError("auth", "Authentication required", 401),
		}),
	]) {
		const harness = createDomHarness();
		let renewed = 0;
		let signedOut = 0;
		reportSignedOut();
		try {
			harness.render(
				createElement(
					AuthProviderProvider,
					{
						value: {
							...noneAuthProvider,
							reauthenticate: () => {
								renewed++;
							},
							Account: ({ children }) =>
								children({
									email: "live@example.com",
									signOut: () => {
										signedOut++;
									},
								}),
						},
					},
					control,
				),
			);
			harness.click(harness.byText("button", "Sign in"));
			assert.equal(renewed, 1);
			assert.equal(signedOut, 0);
		} finally {
			harness.close();
			resetSignedOut();
		}
	}
});

for (const [name, provider] of [
	["better-auth", betterAuthProvider],
	["combined", combinedAuthProvider],
] as const) {
	it(`${name} recovery discards a fresh rejected bearer token while preserving the login cookie`, async () => {
		const harness = createDomHarness();
		const previousConfig = globalThis.__REMIT_CONFIG__;
		const originalWindow = globalThis.window;
		const storageDescriptor = Object.getOwnPropertyDescriptor(
			globalThis,
			"sessionStorage",
		);
		Object.defineProperty(globalThis, "sessionStorage", {
			value: originalWindow.sessionStorage,
			configurable: true,
		});
		globalThis.__REMIT_CONFIG__ = { betterAuthEnabled: true };
		provider.resetToken();
		const expiresAt = Math.floor(Date.now() / 1000) + 3600;
		const token = (label: string) =>
			`header.${Buffer.from(JSON.stringify({ exp: expiresAt, label })).toString("base64url")}.signature`;
		const rejected = token("rejected");
		const renewed = token("renewed");
		const storageKey = "remit.better-auth.token";
		sessionStorage.setItem(
			storageKey,
			JSON.stringify({ value: rejected, expiresAt }),
		);
		document.cookie = "better-auth.session_token=live-login; Path=/";
		const loginCookie = document.cookie;
		const navigationTokens: (string | null)[] = [];
		const http = mockFetch(({ path, headers }) => {
			if (path === "/api/auth/token") {
				assert.equal(document.cookie, loginCookie);
				return { token: renewed };
			}
			if (path === "/api/protected")
				return new Response(null, {
					status: headers.authorization === `Bearer ${renewed}` ? 204 : 401,
				});
			throw new Error(`Unexpected auth request: ${path}`);
		});
		const protectedRequest = async () =>
			fetch("/api/protected", {
				headers: { Authorization: `Bearer ${await provider.getToken()}` },
			});
		try {
			assert.equal(await provider.getToken(), rejected);
			assert.equal(http.to("/api/auth/token").length, 0);
			assert.equal((await protectedRequest()).status, 401);
			reportSignedOut();
			harness.render(
				createElement(
					AuthProviderProvider,
					{ value: provider },
					createElement(SignedOutOverlay),
				),
			);
			globalThis.window = new Proxy(originalWindow, {
				get(target, key) {
					if (key === "location")
						return {
							reload: () => {
								navigationTokens.push(sessionStorage.getItem(storageKey));
							},
						};
					return Reflect.get(target, key, target);
				},
			});
			harness.click(harness.byText("button", "Sign in"));
			globalThis.window = originalWindow;
			assert.deepEqual(
				navigationTokens,
				[null],
				"the persisted token must be cleared before navigation",
			);
			assert.equal(
				(await protectedRequest()).status,
				204,
				"the in-memory rejected token must be replaced too",
			);
			assert.equal(http.to("/api/auth/token").length, 1);
			assert.equal(document.cookie, loginCookie);
			assert.equal(http.to("/api/auth/sign-out").length, 0);
		} finally {
			globalThis.window = originalWindow;
			harness.close();
			http.restore();
			provider.resetToken();
			resetSignedOut();
			document.cookie = "better-auth.session_token=; Max-Age=0; Path=/";
			globalThis.__REMIT_CONFIG__ = previousConfig;
			if (storageDescriptor)
				Object.defineProperty(globalThis, "sessionStorage", storageDescriptor);
			else Reflect.deleteProperty(globalThis, "sessionStorage");
		}
	});
}
