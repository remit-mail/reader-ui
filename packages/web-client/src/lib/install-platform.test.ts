import assert from "node:assert/strict";
import { it } from "node:test";
import { installPlatform } from "./install-platform";

it("offers a held Chrome Android prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
			touchPoints: 5,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Chrome Windows prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Edge Windows prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Brave Linux prompt", () => {
	// Brave shares Chrome's user agent; the event establishes installability.
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Chrome Mac prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Edge Mac prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("offers a held Brave Mac prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			touchPoints: 0,
			standalone: false,
			hasPrompt: true,
		}),
		"chromium-prompt",
	);
});

it("waits for Chrome Mac to offer an eligible prompt", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
			touchPoints: 0,
			standalone: false,
			hasPrompt: false,
		}),
		"none",
	);
});

it("offers the home-screen hint in iPhone Safari", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
			touchPoints: 5,
			standalone: false,
			hasPrompt: false,
		}),
		"ios-safari",
	);
});

it("offers the home-screen hint in iPad Safari", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
			touchPoints: 5,
			standalone: false,
			hasPrompt: false,
		}),
		"ios-safari",
	);
});

it("recognises iPadOS Safari reporting as a Mac by its touch points", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
			touchPoints: 5,
			standalone: false,
			hasPrompt: false,
		}),
		"ios-safari",
	);
});

it("offers the Dock hint in macOS Safari", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
			touchPoints: 0,
			standalone: false,
			hasPrompt: false,
		}),
		"macos-safari",
	);
});

it("hides the option in macOS Safari before Add to Dock existed", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
			touchPoints: 0,
			standalone: false,
			hasPrompt: false,
		}),
		"none",
	);
});

it("hides the option in Firefox Mac", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
			touchPoints: 0,
			standalone: false,
			hasPrompt: false,
		}),
		"none",
	);
});

it("hides the option in Firefox Android", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0",
			touchPoints: 5,
			standalone: false,
			hasPrompt: false,
		}),
		"none",
	);
});

it("does not offer Safari instructions in Chrome iOS", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.134 Mobile/15E148 Safari/604.1",
			touchPoints: 5,
			standalone: false,
			hasPrompt: false,
		}),
		"none",
	);
});

it("hides the option when iPhone Safari is already standalone", () => {
	assert.equal(
		installPlatform({
			userAgent:
				"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
			touchPoints: 5,
			standalone: true,
			hasPrompt: false,
		}),
		"none",
	);
});
