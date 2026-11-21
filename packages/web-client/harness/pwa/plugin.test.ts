import assert from "node:assert/strict";
import { test } from "node:test";
import { completePrecache, pwaPlugins } from "./plugin.ts";

test("precache covers generated config, lazy chunks, CSS, locales and fonts at canonical /", () => {
	const files = [
		"index.html",
		"config.js",
		"assets/route-hash.js",
		"assets/app.css",
		"locales/en/mail.json",
		"fonts/mail.woff2",
	];
	const entries = files.map((url) => ({ url, revision: "revision" }));
	const manifest = completePrecache(entries, [
		...files,
		"sw.js",
		"assets/app.js.map",
	]);
	assert.deepEqual(
		manifest.map(({ url }) => url),
		["/", ...files.slice(1)],
	);
	assert.ok(manifest.every(({ revision }) => revision === "revision"));
	assert.throws(
		() => completePrecache(entries.slice(0, 1), files),
		/config.js.*route-hash.js.*app.css.*mail.json.*mail.woff2/,
	);
	assert.throws(
		() => completePrecache(entries, [...files, "large.wasm"]),
		/Incomplete PWA precache: large.wasm/,
	);
	assert.throws(() => completePrecache([], []), /index.html, config.js/);
});
test("PWA tooling is opt-in", () => {
	assert.deepEqual(pwaPlugins("/unused"), []);
	assert.deepEqual(pwaPlugins("/unused", { enabled: false }), []);
});
