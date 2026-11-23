import assert from "node:assert/strict";
import { test } from "node:test";
import { externalImageBytes, requestExternalImage } from "./external-image";
import { OFFLINE_FORMAT, type Partition } from "./offline-store";

const partition: Partition = {
	key: "tenant",
	generation: "generation",
	epoch: "epoch",
	format: OFFLINE_FORMAT,
};
const response = (headers: Record<string, string> = {}, status = 200) =>
	new Response("image bytes", {
		status,
		headers: {
			"content-type": "image/png",
			"x-remit-partition": "tenant",
			...headers,
		},
	});

test("proxy uses a POST body and never places the destination in its request URL", async (t) => {
	const destination = "https://images.example/pixel?secret=one";
	const mock = t.mock.method(
		globalThis,
		"fetch",
		async (url: string, init: RequestInit) => {
			assert.equal(url, "/api/image-proxy");
			assert.deepEqual(init, {
				method: "POST",
				credentials: "same-origin",
				redirect: "manual",
				headers: { "Content-Type": "text/plain;charset=UTF-8" },
				body: destination,
			});
			return response();
		},
	);
	assert.equal(
		await (
			await externalImageBytes(
				await requestExternalImage("/api/image-proxy", destination),
				partition,
			)
		).text(),
		"image bytes",
	);
	assert.equal(mock.mock.callCount(), 1);
});

test("admission refuses wrong partition, MIME, status, redirects and interrupted streams", async () => {
	for (const candidate of [
		response({ "x-remit-partition": "other" }),
		response({ "x-remit-partition": "" }),
		response({ "content-type": "text/html" }),
		response({ "content-type": "image/svg+xml" }),
		response({}, 206),
		response({}, 500),
	])
		await assert.rejects(externalImageBytes(candidate, partition));
	for (const property of ["redirected", "type"]) {
		const candidate = response();
		Object.defineProperty(candidate, property, {
			value: property === "type" ? "opaqueredirect" : true,
		});
		await assert.rejects(externalImageBytes(candidate, partition));
	}
	const interrupted = new Response(
		new ReadableStream({
			start(controller) {
				controller.enqueue(new Uint8Array([1]));
				controller.error(new Error("interrupted"));
			},
		}),
		{ headers: { "content-type": "image/png", "x-remit-partition": "tenant" } },
	);
	await assert.rejects(
		externalImageBytes(interrupted, partition),
		/interrupted/,
	);
});
