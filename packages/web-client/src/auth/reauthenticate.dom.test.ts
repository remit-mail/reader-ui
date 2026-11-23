import assert from "node:assert/strict";
import { it } from "node:test";
import { createElement } from "react";
import { MessageBodyErrorBanner } from "../components/mail/MessageBodyErrorBanner";
import { SignedOutOverlay } from "../components/ui/SignedOutOverlay";
import { BodyFetchError } from "../hooks/useMessageBodyContent";
import { reportSignedOut, resetSignedOut } from "../lib/signed-out";
import { createDomHarness } from "../test-support/dom";
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
