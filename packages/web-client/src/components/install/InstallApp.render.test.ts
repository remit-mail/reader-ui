import assert from "node:assert/strict";
import { afterEach, it, mock } from "node:test";
import { createElement } from "react";
import { createDomHarness, type DomHarness } from "../../test-support/dom";
import { InstallApp, InstallSettings } from "./InstallApp";
import { InstallProvider } from "./InstallProvider";

let dom: DomHarness | undefined;
let media: MediaQueryList;
afterEach(() => {
	dom?.close();
	dom = undefined;
	window.localStorage.clear();
	mock.restoreAll();
});

function mount({
	enabled = true,
	standalone = false,
	ios = false,
	displayStandalone = false,
} = {}) {
	dom = createDomHarness();
	media = Object.assign(new window.EventTarget(), {
		matches: displayStandalone,
		media: "(display-mode: standalone)",
	}) as MediaQueryList;
	const matchMedia = window.matchMedia;
	mock.method(window, "matchMedia", (query: string) =>
		query === "(display-mode: standalone)" ? media : matchMedia(query),
	);
	mock.getter(navigator, "userAgent", () =>
		ios
			? "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/18.0 Mobile/15 Safari/604.1"
			: "Mozilla/5.0 (Windows NT 10.0) Chrome/131.0 Safari/537.36",
	);
	Object.defineProperty(navigator, "standalone", {
		configurable: true,
		value: standalone,
	});
	dom.render(
		createElement(
			InstallProvider,
			{ enabled },
			createElement(InstallApp),
			createElement(InstallSettings),
		),
	);
	return dom;
}

function offer(outcome: "accepted" | "dismissed" = "accepted") {
	assert.ok(dom);
	const prompt = mock.fn(async () => undefined);
	const event = Object.assign(
		new window.Event("beforeinstallprompt", { cancelable: true }),
		{
			prompt,
			userChoice: Promise.resolve({ outcome }),
		},
	);
	dom.dispatch(window, event);
	return { event, prompt };
}

it("waits for Chromium eligibility, prevents the default and prompts on click", async () => {
	const dom = mount();
	assert.equal(dom.text(), "");
	const { event, prompt } = offer();
	assert.equal(event.defaultPrevented, true);
	assert.equal(prompt.mock.callCount(), 0);
	dom.click(dom.byText("button", "Install app"));
	await dom.flush();
	assert.equal(prompt.mock.callCount(), 1);
	assert.equal(dom.text(), "");
});

it("hides after appinstalled, including a later prompt event", () => {
	const dom = mount();
	offer();
	assert.match(dom.text(), /Install app/);
	dom.dispatch(window, new window.Event("appinstalled"));
	offer();
	assert.equal(dom.text(), "");
});

it("hides when launched standalone on iOS", () => {
	const dom = mount({ standalone: true, ios: true });
	offer();
	assert.equal(dom.text(), "");
});

it("hides when launched in standalone display mode", () => {
	const dom = mount({ displayStandalone: true });
	offer();
	assert.equal(dom.text(), "");
});

it("hides when display mode becomes standalone", () => {
	const dom = mount();
	offer();

	Object.defineProperty(media, "matches", { configurable: true, value: true });
	dom.dispatch(media, new window.Event("change"));
	assert.equal(dom.text(), "");
});

it("keeps iOS standalone hidden when the media query changes", () => {
	const dom = mount({ standalone: true, ios: true });
	dom.dispatch(media, new window.Event("change"));
	assert.equal(dom.text(), "");
});

it("remembers dismissal across mounts and restores from settings", () => {
	let dom = mount({ ios: true });
	dom.click(dom.byLabel("Dismiss install option"));
	assert.equal(dom.query('[aria-label="Dismiss install option"]'), null);
	dom.close();
	dom = mount({ ios: true });
	assert.equal(dom.query('[aria-label="Dismiss install option"]'), null);
	dom.click(dom.byText("button", "Show install option again"));
	assert.match(dom.text(), /Install app/);
	assert.equal(window.localStorage.getItem("remit.installDismissed"), null);
});

it("remembers dismissal of the native prompt", async () => {
	const dom = mount();
	offer("dismissed");
	dom.click(dom.byText("button", "Install app"));
	await dom.flush();
	offer();
	assert.equal(dom.query('[aria-label="Dismiss install option"]'), null);
	assert.equal(window.localStorage.getItem("remit.installDismissed"), "true");
});

it("does not capture events or show controls when the preset disables PWA", () => {
	window.localStorage.setItem("remit.installDismissed", "true");
	const dom = mount({ enabled: false, ios: true });
	const { event } = offer();
	assert.equal(event.defaultPrevented, false);
	assert.equal(dom.text(), "");
});

it("shows and closes the two-step Safari hint", () => {
	const dom = mount({ ios: true });
	dom.click(dom.byText("button", "Install app"));
	assert.match(dom.text(), /Tap Share in Safari/);
	assert.match(dom.text(), /Choose Add to Home Screen/);
	dom.click(dom.byText("button", "Got it"));
	assert.equal(dom.query('[role="dialog"]'), null);
});
