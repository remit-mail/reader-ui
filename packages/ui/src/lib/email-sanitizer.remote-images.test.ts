/**
 * Every way an email can name a remote image, and what blocking does to each
 * (#352).
 *
 * `src` on an `<img>` is the obvious one and was the only one the hook rewrote.
 * Three more fetch without a click and none of them are forbidden by config:
 * `srcset` on an `<img>` wins over `src` on any 2x screen, a `<source srcset>`
 * inside a `<picture>` outranks the `<img>` it wraps in every modern browser,
 * and `<video poster>` loads before playback. A blocked or untrusted sender's
 * tracker fires through any of them, so blocking has to close all four.
 *
 * Mounted against jsdom because DOMPurify needs a real DOM.
 */

import "@remit/test-dom";
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createEmailSanitizer } from "./email-sanitizer.js";

const TRACKER = "https://tracker.example/pixel.png";
const TRACKER_2X = "https://tracker.example/pixel@2x.png";
const POSTER = "https://tracker.example/poster.jpg";

const sanitize = (html: string, allowExternalImages: boolean): string =>
	createEmailSanitizer({ allowExternalImages })(html).html;

// The blocked `<img src>` is deliberately parked in `data-blocked-src` so
// "load once" can restore it. Anywhere else, a tracker URL in the output is a
// fetch the browser will make.
const remoteUrlsOutsideBlockedSrc = (html: string): string[] =>
	[...html.replace(/data-blocked-src="[^"]*"/g, "").matchAll(/https:\/\/\S+/g)]
		.map((match) => match[0])
		.filter((url) => url.includes("tracker.example"));

describe("blocking closes every remote-image vector (#352)", () => {
	test("drops srcset on an img, keeping the placeholder swap", () => {
		const html = sanitize(
			`<img src="${TRACKER}" srcset="${TRACKER_2X} 2x" alt="x" />`,
			false,
		);
		assert.doesNotMatch(html, /srcset/);
		assert.match(html, /data-blocked-src="https:\/\/tracker\.example/);
		assert.match(html, /src="data:image\/svg\+xml/);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});

	test("drops srcset on an img whose src is a harmless data URI", () => {
		const html = sanitize(
			`<img src="data:image/gif;base64,R0lGOD" srcset="${TRACKER_2X} 2x" />`,
			false,
		);
		assert.doesNotMatch(html, /srcset/);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});

	test("neuters a picture's source, which would otherwise beat the placeholder img", () => {
		const html = sanitize(
			`<picture><source srcset="${TRACKER_2X}" type="image/png" /><img src="${TRACKER}" /></picture>`,
			false,
		);
		assert.doesNotMatch(html, /srcset/);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});

	test("neuters a bare source src", () => {
		const html = sanitize(
			`<video><source src="${TRACKER}" type="video/mp4" /></video>`,
			false,
		);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});

	test("drops a video poster, which loads before any playback", () => {
		const html = sanitize(`<video poster="${POSTER}"></video>`, false);
		assert.doesNotMatch(html, /poster/);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});
});

describe("loading images restores every vector (#352)", () => {
	test("keeps srcset on an img", () => {
		const html = sanitize(
			`<img src="${TRACKER}" srcset="${TRACKER_2X} 2x" alt="x" />`,
			true,
		);
		assert.match(html, /srcset="[^"]*pixel@2x\.png/);
		assert.match(html, /src="https:\/\/tracker\.example\/pixel\.png"/);
		assert.doesNotMatch(html, /data-blocked-src/);
	});

	test("keeps a picture's source srcset", () => {
		const html = sanitize(
			`<picture><source srcset="${TRACKER_2X}" type="image/png" /><img src="${TRACKER}" /></picture>`,
			true,
		);
		assert.match(html, /srcset="[^"]*pixel@2x\.png/);
	});

	test("keeps a source src", () => {
		const html = sanitize(
			`<video><source src="${TRACKER}" type="video/mp4" /></video>`,
			true,
		);
		assert.match(html, /src="https:\/\/tracker\.example\/pixel\.png"/);
	});

	test("keeps a video poster", () => {
		const html = sanitize(`<video poster="${POSTER}"></video>`, true);
		assert.match(html, /poster="https:\/\/tracker\.example\/poster\.jpg"/);
	});
});

describe("permitted external image resolver", () => {
	const markup = `<img src="${TRACKER}" srcset="${TRACKER} 1x, ${TRACKER_2X} 2x"><picture><source srcset="${TRACKER_2X} 600w"></picture><video poster="${POSTER}"></video><svg><image href="${TRACKER}" /></svg><table background="${TRACKER}"><tr><td>Image</td></tr></table><img src="data:image/png;base64,abcd" style="background:url('${TRACKER}')"><div style="background:url('${TRACKER}')"></div><style>.x {background:url('${TRACKER}')}</style>`;
	test("blocked sources never call the resolver, and CSS remains scrubbed", () => {
		let calls = 0;
		const html = createEmailSanitizer({
			allowExternalImages: false,
			resolveExternalImage: () => {
				calls++;
				return undefined;
			},
		})(markup).html;
		assert.equal(calls, 0);
		assert.doesNotMatch(html, /url\(/);
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});
	test("rewrites src, sanitized srcset and posters, preserving local sources", () => {
		const calls: string[] = [];
		const html = createEmailSanitizer({
			allowExternalImages: true,
			resolveExternalImage: (url) => {
				calls.push(url);
				return "blob:https://mail.example/image";
			},
		})(markup).html;
		assert.deepEqual(new Set(calls), new Set([TRACKER, TRACKER_2X, POSTER]));
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
		assert.match(html, /srcset="blob:[^"]* 1x, blob:[^"]* 2x"/);
		assert.match(html, /data:image\/png;base64,abcd/);
		assert.match(html, /url\(&quot;blob:|url\("blob:/);
	});
	test("pending remote bytes never leave a direct image URL in the output", () => {
		const html = createEmailSanitizer({
			allowExternalImages: true,
			resolveExternalImage: () => undefined,
		})(markup).html;
		assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
	});
	test("image-set strings, comments and escaped CSS cannot bypass the gate, with or without a proxy", () => {
		for (const allowExternalImages of [false, true]) {
			for (const proxy of [false, true]) {
				const calls: string[] = [];
				const html = createEmailSanitizer({
					allowExternalImages,
					resolveExternalImage: proxy
						? (url) => {
								calls.push(url);
								return "blob:https://mail.example/image";
							}
						: undefined,
				})(
					`<div style='background:image-set(/**/"${TRACKER}" 1x)'></div><img src="data:image/png;base64,abcd" style='background:image-set("${TRACKER_2X}" 2x)'><div style="background:u\\72l(${POSTER})"></div>`,
				).html;
				assert.deepEqual(calls, []);
				assert.deepEqual(remoteUrlsOutsideBlockedSrc(html), []);
				assert.doesNotMatch(html, /image-set/);
			}
		}
	});
});
