import type {
	RemitImapClassificationConfigured,
	RemitImapClassificationField,
	RemitImapClassificationPreset,
	RemitImapClassificationPresetGroup,
	RemitImapClassificationPresetId,
	RemitImapClassificationSettings,
	RemitImapClassificationTestFailed,
	RemitImapClassificationUsage,
	RemitImapUpdateUserSettingsInput,
} from "@remit/api-http-client/types.gen.ts";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";
import {
	getErrorStatus,
	ownsServerErrorsMeta,
	softErrorStatuses,
} from "./error-classifier";

export const classificationQueryMeta = softErrorStatuses(403);

export const classificationActionMeta = {
	...softErrorStatuses(400, 403, 404, 409, 422, 429),
	...ownsServerErrorsMeta,
};

export const isClassificationSignedOut = (error: unknown): boolean =>
	getErrorStatus(error) === 403;

export interface ProviderDraft {
	presetId: RemitImapClassificationPresetId | undefined;
	model: string;
	baseUrl: string;
	apiKey: string;
}

export const draftFromSettings = (
	settings: RemitImapClassificationSettings,
): ProviderDraft =>
	settings.state === "Configured"
		? {
				presetId: settings.presetId,
				model: settings.model,
				baseUrl: settings.baseUrl,
				apiKey: "",
			}
		: { presetId: undefined, model: "", baseUrl: "", apiKey: "" };

export const draftForPreset = (
	presetId: RemitImapClassificationPresetId,
	settings: RemitImapClassificationSettings,
): ProviderDraft =>
	settings.state === "Configured" && settings.presetId === presetId
		? draftFromSettings(settings)
		: { presetId, model: "", baseUrl: "", apiKey: "" };

export interface PresetGroup {
	group: RemitImapClassificationPresetGroup;
	label: string;
	presets: RemitImapClassificationPreset[];
}

const GROUP_LABELS: Record<RemitImapClassificationPresetGroup, string> = {
	Hosted: "Hosted",
	Custom: "Your own endpoint",
	Local: "Self-hosted",
};

export const groupPresets = (
	presets: readonly RemitImapClassificationPreset[],
): PresetGroup[] => {
	const groups: PresetGroup[] = [];
	for (const preset of presets) {
		const existing = groups.find((entry) => entry.group === preset.group);
		if (existing) {
			existing.presets.push(preset);
			continue;
		}
		groups.push({
			group: preset.group,
			label: GROUP_LABELS[preset.group],
			presets: [preset],
		});
	}
	return groups;
};

export const needsBaseUrl = (preset: RemitImapClassificationPreset): boolean =>
	preset.defaultBaseUrl === undefined;

export const hasSavedKey = (
	settings: RemitImapClassificationSettings,
	presetId: RemitImapClassificationPresetId | undefined,
): settings is RemitImapClassificationConfigured =>
	settings.state === "Configured" &&
	settings.presetId === presetId &&
	settings.apiKeySaved;

export type ProviderSave =
	| { ok: true; body: RemitImapUpdateUserSettingsInput }
	| { ok: false; field: RemitImapClassificationField; message: string };

export const PASTE_KEY = "Paste an API key";
export const BAD_URL = "Enter a URL that starts with http:// or https://";

const isHttpUrl = (value: string): boolean => {
	if (!URL.canParse(value)) return false;
	const { protocol } = new URL(value);
	return protocol === "http:" || protocol === "https:";
};

export const providerSave = (
	draft: ProviderDraft,
	preset: RemitImapClassificationPreset,
	settings: RemitImapClassificationSettings,
): ProviderSave => {
	const baseUrl = draft.baseUrl.trim();
	const apiKey = draft.apiKey.trim();
	if (baseUrl !== "" && !isHttpUrl(baseUrl)) {
		return { ok: false, field: "BaseUrl", message: BAD_URL };
	}
	if (baseUrl === "" && needsBaseUrl(preset)) {
		return { ok: false, field: "BaseUrl", message: BAD_URL };
	}
	if (
		preset.needsKey &&
		apiKey === "" &&
		!hasSavedKey(settings, preset.presetId)
	) {
		return { ok: false, field: "ApiKey", message: PASTE_KEY };
	}
	const switching =
		settings.state !== "Configured" || settings.presetId !== preset.presetId;
	return {
		ok: true,
		body: {
			...(switching ? { classificationPresetId: preset.presetId } : {}),
			classificationModel: draft.model.trim(),
			classificationBaseUrl: baseUrl,
			...(preset.needsKey && apiKey !== ""
				? { classificationApiKey: apiKey }
				: {}),
		},
	};
};

export const switchingFrom = (
	settings: RemitImapClassificationSettings,
	presetId: RemitImapClassificationPresetId | undefined,
	presets: readonly RemitImapClassificationPreset[],
): RemitImapClassificationPreset | undefined => {
	if (settings.state !== "Configured" || presetId === undefined) {
		return undefined;
	}
	if (settings.presetId === presetId) return undefined;
	return presets.find((preset) => preset.presetId === settings.presetId);
};

export const testFailureHeadline = (
	failure: RemitImapClassificationTestFailed,
): string => {
	const answer =
		failure.status === undefined ? failure.kind : `${failure.status}`;
	return `Test failed after ${failure.latencyMs} ms: ${answer}`;
};

export const classificationReportHref = (
	title: string,
	detail: string,
): string =>
	buildGitHubIssueUrl(
		buildBugReportContext({
			title: `Mail classification: ${title}`,
			errorMessage: `${title}. ${detail}`,
		}),
	);

export const presetNote = (preset: RemitImapClassificationPreset): string => {
	const key = preset.needsKey ? "Needs an API key." : "No key needed.";
	if (preset.price.state !== "Priced") return key;
	const price = new Intl.NumberFormat("en", {
		style: "currency",
		currency: preset.price.currency,
		maximumFractionDigits: 4,
	}).format(preset.price.perMillionInputTokens);
	return `${key} ${price} per million input tokens.`;
};

export const LIMIT_INVALID = "Enter a whole number of 1 or more.";

const INT32_MAX = 2_147_483_647;

export type DailyLimitInput =
	| { ok: true; limit: number }
	| { ok: false; message: string };

export const parseDailyLimit = (value: string): DailyLimitInput => {
	const trimmed = value.trim();
	if (!/^\d+$/.test(trimmed)) return { ok: false, message: LIMIT_INVALID };
	const limit = Number(trimmed);
	if (limit < 1 || limit > INT32_MAX) {
		return { ok: false, message: LIMIT_INVALID };
	}
	return { ok: true, limit };
};

export const isCapped = (usage: RemitImapClassificationUsage): boolean =>
	usage.calls >= usage.dailyLimit;

export const usageCost = (
	usage: RemitImapClassificationUsage,
	preset: RemitImapClassificationPreset | undefined,
): string => {
	const { cost } = usage;
	if (cost.state === "Priced") {
		const format = new Intl.NumberFormat("en", {
			style: "currency",
			currency: cost.currency,
			maximumFractionDigits: 2,
		});
		if (cost.amount > 0 && cost.amount < 0.01) {
			return `under ${format.format(0.01)}`;
		}
		if (cost.amount === 0) return format.format(0);
		return `about ${format.format(cost.amount)}`;
	}
	return preset?.group === "Local" ? "no price, self-hosted" : "no price";
};
