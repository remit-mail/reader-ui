import assert from "node:assert";
import { describe, test } from "node:test";
import type {
	RemitImapClassificationConfigured,
	RemitImapClassificationPreset,
} from "@remit/api-http-client/types.gen.ts";
import {
	BAD_URL,
	groupPresets,
	PASTE_KEY,
	providerSave,
	switchingFrom,
} from "./classification.js";

const mistral: RemitImapClassificationPreset = {
	presetId: "Mistral",
	label: "Mistral",
	group: "Hosted",
	adapterShape: "ChatJsonSchema",
	defaultBaseUrl: "https://api.mistral.ai/v1",
	defaultModel: "mistral-small-latest",
	needsKey: true,
	price: { state: "NoPrice" },
};

const local: RemitImapClassificationPreset = {
	presetId: "Local",
	label: "Local",
	group: "Local",
	adapterShape: "ChatJsonSchema",
	defaultModel: "llama3.1:8b",
	needsKey: false,
	price: { state: "NoPrice" },
};

const jina: RemitImapClassificationPreset = {
	...mistral,
	presetId: "Jina",
	label: "Jina",
};

const savedMistral: RemitImapClassificationConfigured = {
	state: "Configured",
	presetId: "Mistral",
	model: "",
	baseUrl: "",
	apiKeySaved: true,
	enabled: false,
	dailyLimit: 500,
	savedAt: 0,
};

const draft = (
	overrides: Partial<Parameters<typeof providerSave>[0]> = {},
) => ({
	presetId: undefined,
	model: "",
	baseUrl: "",
	apiKey: "",
	...overrides,
});

describe("providerSave", () => {
	test("asks for a key when the preset needs one and none is saved", () => {
		const result = providerSave(draft({ presetId: "Mistral" }), mistral, {
			state: "NotConfigured",
		});
		assert.deepStrictEqual(result, {
			ok: false,
			field: "ApiKey",
			message: PASTE_KEY,
		});
	});

	test("keeps the saved key of the same preset without naming the preset", () => {
		const result = providerSave(
			draft({ presetId: "Mistral", model: " mistral-large " }),
			mistral,
			savedMistral,
		);
		assert.deepStrictEqual(result, {
			ok: true,
			body: { classificationModel: "mistral-large", classificationBaseUrl: "" },
		});
	});

	test("names the preset and its key when switching", () => {
		const result = providerSave(
			draft({ presetId: "Jina", apiKey: "jina-key" }),
			jina,
			savedMistral,
		);
		assert.deepStrictEqual(result, {
			ok: true,
			body: {
				classificationPresetId: "Jina",
				classificationModel: "",
				classificationBaseUrl: "",
				classificationApiKey: "jina-key",
			},
		});
	});

	test("refuses a base URL that is not http or https", () => {
		const result = providerSave(
			draft({ presetId: "Local", baseUrl: "ftp://gpu-box.lan" }),
			local,
			{ state: "NotConfigured" },
		);
		assert.deepStrictEqual(result, {
			ok: false,
			field: "BaseUrl",
			message: BAD_URL,
		});
	});

	test("requires a base URL when the preset has no default", () => {
		const result = providerSave(draft({ presetId: "Local" }), local, {
			state: "NotConfigured",
		});
		assert.strictEqual(result.ok, false);
	});

	test("sends no key for a preset that needs none", () => {
		const result = providerSave(
			draft({
				presetId: "Local",
				baseUrl: "http://gpu-box.lan:11434/v1",
				apiKey: "stray",
			}),
			local,
			{ state: "NotConfigured" },
		);
		assert.deepStrictEqual(result, {
			ok: true,
			body: {
				classificationPresetId: "Local",
				classificationModel: "",
				classificationBaseUrl: "http://gpu-box.lan:11434/v1",
			},
		});
	});
});

describe("groupPresets", () => {
	test("keeps one group per preset group in first-seen order", () => {
		const groups = groupPresets([mistral, local, jina]);
		assert.deepStrictEqual(
			groups.map((group) => [
				group.group,
				group.presets.map((preset) => preset.presetId),
			]),
			[
				["Hosted", ["Mistral", "Jina"]],
				["Local", ["Local"]],
			],
		);
	});
});

describe("switchingFrom", () => {
	test("names the saved preset only when another one is picked", () => {
		const presets = [mistral, jina];
		assert.strictEqual(
			switchingFrom(savedMistral, "Jina", presets)?.label,
			"Mistral",
		);
		assert.strictEqual(
			switchingFrom(savedMistral, "Mistral", presets),
			undefined,
		);
		assert.strictEqual(
			switchingFrom({ state: "NotConfigured" }, "Jina", presets),
			undefined,
		);
	});
});
