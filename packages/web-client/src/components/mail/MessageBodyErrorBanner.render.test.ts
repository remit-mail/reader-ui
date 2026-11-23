/** Rendering content recovery must not depend on a mounted identity SDK. */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { BodyFetchError } from "../../hooks/useMessageBodyContent";
import { MessageBodyErrorBanner } from "./MessageBodyErrorBanner";

const renderBanner = (error: unknown, onRetry?: () => void): string =>
	renderToString(
		createElement(MessageBodyErrorBanner, { error, onRetry }) as never,
	);

/**
 * The sign-in CTA is rendered as a `<button>` whose text is "Sign in again".
 * The string "Sign in again" also appears as the prefix of the auth-variant
 * detail copy, so the assertion must look for the BUTTON tag specifically,
 * not the bare substring.
 */
const hasSignInButton = (html: string): boolean =>
	/<button\b[^>]*>Sign in again<\/button>/.test(html);

describe("MessageBodyErrorBanner renders without an identity SDK", () => {
	it("renders the body-missing variant without throwing — local-dev / production both reach this branch", () => {
		const html = renderBanner(
			new BodyFetchError("body-missing", "missing", 403),
		);
		assert.match(html, /Message body is missing in storage/);
		assert.match(html, /data-reason="body-missing"/);
		assert.equal(
			hasSignInButton(html),
			false,
			"sign-in CTA must not appear for body-missing — only the auth variant",
		);
	});

	it("offers authentication recovery without requiring an active account", () => {
		const html = renderBanner(
			new BodyFetchError("auth", "Invalid id_token", 401),
		);
		assert.match(html, /Your session expired/);
		assert.match(html, /data-reason="auth"/);
		assert.equal(
			hasSignInButton(html),
			true,
			"renewal must also be available when the account session is absent",
		);
	});

	it("renders the generic variant for unknown errors without crashing", () => {
		const html = renderBanner(new Error("network down"));
		assert.match(html, /Couldn.+t load message body/);
		assert.match(html, /network down/);
	});

	it("renders a Retry button when onRetry is supplied (every variant)", () => {
		const html = renderBanner(
			new BodyFetchError("body-missing", "missing", 403),
			() => undefined,
		);
		assert.match(html, /<button\b[^>]*>Retry<\/button>/);
	});
});
