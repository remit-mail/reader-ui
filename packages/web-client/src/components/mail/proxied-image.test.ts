import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { createDomHarness } from "../../test-support/dom";
import { MessageBody } from "./MessageBody";

const remote = "https://images.example/photo?token=secret";
const html = `<img src="${remote}" srcset="${remote} 1x, /large.png 2x"><style>.photo {background:url('${remote}')}</style>`;

Object.defineProperty(globalThis, "ResizeObserver", {
	configurable: true,
	value: class {
		observe() {}
		disconnect() {}
	},
});

test("blocked means no fetch; load once proxies every image source and creates revocable blob URLs", async (t) => {
	const previous = globalThis.__REMIT_CONFIG__;
	globalThis.__REMIT_CONFIG__ = { externalImageProxyUrl: "/api/image-proxy" };
	const view = createDomHarness();
	t.after(() => {
		view.close();
		globalThis.__REMIT_CONFIG__ = previous;
	});
	const requests: string[] = [];
	t.mock.method(
		globalThis,
		"fetch",
		async (_url: RequestInfo | URL, init?: RequestInit) => {
			requests.push(String(init?.body));
			return new Response("bytes", {
				headers: { "content-type": "image/png" },
			});
		},
	);
	const objects = t.mock.method(
		URL,
		"createObjectURL",
		() => "blob:http://localhost/image",
	);
	const revoke = t.mock.method(URL, "revokeObjectURL", () => {});
	view.renderApp(createElement(MessageBody, { html, messageId: "message" }));
	await view.flush();
	assert.equal(requests.length, 0);
	view.click(view.byText("button", "Load once"));
	await view.waitFor(
		() => requests.length === 2,
		"both distinct image candidates proxied",
	);
	await view.waitFor(
		() =>
			view.query("iframe")?.getAttribute("srcdoc")?.includes('src="blob:') ===
			true,
		"blob image rendered",
	);
	assert.deepEqual(
		new Set(requests),
		new Set([remote, new URL("/large.png", document.baseURI).href]),
	);
	assert.equal(objects.mock.callCount(), 2);
	view.unmount();
	assert.equal(revoke.mock.callCount(), 2);
});

test("blocked sender overrides trust, and an unset proxy keeps permitted direct URLs", async (t) => {
	const previous = globalThis.__REMIT_CONFIG__;
	globalThis.__REMIT_CONFIG__ = { externalImageProxyUrl: "/api/image-proxy" };
	const view = createDomHarness();
	t.after(() => {
		view.close();
		globalThis.__REMIT_CONFIG__ = previous;
	});
	const fetch = t.mock.method(globalThis, "fetch", async () => {
		throw new Error("blocked image fetched");
	});
	view.renderApp(
		createElement(MessageBody, { html, isBlocked: true, isTrusted: true }),
	);
	await view.flush();
	assert.equal(fetch.mock.callCount(), 0);
	assert.equal(
		view
			.query("iframe")
			?.getAttribute("srcdoc")
			?.includes('<img src="https://images.example'),
		false,
	);
	globalThis.__REMIT_CONFIG__ = {};
	view.renderApp(createElement(MessageBody, { html, isTrusted: true }));
	await view.flush();
	assert.equal(fetch.mock.callCount(), 0);
	assert.ok(view.query("iframe")?.getAttribute("srcdoc")?.includes(remote));
});

for (const [name, markup] of [
	["CSS-only", `<div style="background:url('${remote}')">Photo</div>`],
	[
		"srcset-only",
		`<img src="data:image/png;base64,abcd" srcset="${remote} 2x">`,
	],
])
	test(`${name} sources offer Load once without fetching before permission`, async (t) => {
		const previous = globalThis.__REMIT_CONFIG__;
		globalThis.__REMIT_CONFIG__ = { externalImageProxyUrl: "/api/image-proxy" };
		const view = createDomHarness();
		t.after(() => {
			view.close();
			globalThis.__REMIT_CONFIG__ = previous;
		});
		const fetch = t.mock.method(
			globalThis,
			"fetch",
			async () =>
				new Response("bytes", { headers: { "content-type": "image/png" } }),
		);
		t.mock.method(URL, "createObjectURL", () => "blob:http://localhost/image");
		t.mock.method(URL, "revokeObjectURL", () => {});
		view.renderApp(createElement(MessageBody, { html: markup }));
		await view.flush();
		assert.equal(fetch.mock.callCount(), 0);
		view.click(view.byText("button", "Load once"));
		await view.waitFor(
			() => fetch.mock.callCount() === 1,
			"permitted image requested",
		);
		await view.waitFor(
			() =>
				view
					.query("iframe")
					?.getAttribute("srcdoc")
					?.includes("blob:http://localhost/image") === true,
			"local image rendered",
		);
	});
