import type {
	RemitImapClassificationField,
	RemitImapClassificationPreset,
	RemitImapClassificationPresetGroup,
	RemitImapClassificationPresetId,
	RemitImapClassificationSettings,
	RemitImapClassificationSources,
	RemitImapClassificationTestFailed,
	RemitImapClassificationUsage,
	RemitImapClassificationValueSource,
	RemitImapUpdateUserSettingsInput,
} from "@remit/api-http-client/types.gen.ts";
import { ClassificationValueSource } from "@remit/domain-enums";
import { codedApiErrorBody } from "./api";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";
import {
	getErrorStatus,
	ownsServerErrorsMeta,
	softErrorStatuses,
} from "./error-classifier";
import { formatDate } from "./format";

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

export interface SettingsSources {
	presetId: RemitImapClassificationPresetId | undefined;
	sources: RemitImapClassificationSources | undefined;
}

export const settingsSources = (
	settings: RemitImapClassificationSettings,
): SettingsSources => {
	if (settings.state === "NotConfigured") {
		return { presetId: undefined, sources: undefined };
	}
	if (settings.state === "Unrunnable") {
		return { presetId: settings.presetId, sources: undefined };
	}
	return { presetId: settings.presetId, sources: settings.sources };
};

export const sourcesFor = (
	settings: RemitImapClassificationSettings,
	presetId: RemitImapClassificationPresetId,
): RemitImapClassificationSources | undefined => {
	const current = settingsSources(settings);
	return current.presetId === presetId ? current.sources : undefined;
};

type ProviderValueField = "model" | "baseUrl";

const savedValue = (
	settings: RemitImapClassificationSettings,
	field: ProviderValueField,
): string =>
	settings.state === "Configured" &&
	settings.sources[field] === ClassificationValueSource.Saved
		? settings[field]
		: "";

export const effectiveValue = (
	settings: RemitImapClassificationSettings,
	presetId: RemitImapClassificationPresetId,
	field: ProviderValueField,
): string | undefined =>
	settings.state === "Configured" &&
	settings.presetId === presetId &&
	settings[field] !== ""
		? settings[field]
		: undefined;

export const draftFromSettings = (
	settings: RemitImapClassificationSettings,
): ProviderDraft => ({
	presetId: settingsSources(settings).presetId,
	model: savedValue(settings, "model"),
	baseUrl: savedValue(settings, "baseUrl"),
	apiKey: "",
});

export const draftForPreset = (
	preset: RemitImapClassificationPreset,
	settings: RemitImapClassificationSettings,
): ProviderDraft =>
	settingsSources(settings).presetId === preset.presetId
		? draftFromSettings(settings)
		: { presetId: preset.presetId, model: "", baseUrl: "", apiKey: "" };

export const hasSavedProvider = (
	settings: RemitImapClassificationSettings,
): boolean => {
	if (settings.state === "Unrunnable") return true;
	if (settings.state === "NotConfigured") return false;
	return Object.values(settings.sources).includes(
		ClassificationValueSource.Saved,
	);
};

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

export const withSourceNote = (
	text: string,
	source: RemitImapClassificationValueSource | undefined,
): string => {
	if (source === ClassificationValueSource.Saved) {
		return `${text} Saved by you.`;
	}
	if (source === ClassificationValueSource.Deployment) {
		return `${text} Provided by the deployment.`;
	}
	return text;
};

export type ProviderSave =
	| { ok: true; body: RemitImapUpdateUserSettingsInput }
	| { ok: false; field: RemitImapClassificationField; message: string };

export const PASTE_KEY = "Paste an API key";

export const isKeyRequiredRefusal = (error: unknown): boolean =>
	codedApiErrorBody(error)?.code === "ClassificationApiKeyRequired";

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
	const sources = sourcesFor(settings, preset.presetId);
	if (baseUrl !== "" && !isHttpUrl(baseUrl)) {
		return { ok: false, field: "BaseUrl", message: BAD_URL };
	}
	if (
		baseUrl === "" &&
		needsBaseUrl(preset) &&
		effectiveValue(settings, preset.presetId, "baseUrl") === undefined
	) {
		return { ok: false, field: "BaseUrl", message: BAD_URL };
	}
	const keySource = sources?.apiKey ?? ClassificationValueSource.Default;
	if (
		preset.needsKey &&
		apiKey === "" &&
		keySource === ClassificationValueSource.Default
	) {
		return { ok: false, field: "ApiKey", message: PASTE_KEY };
	}
	const switching = settingsSources(settings).presetId !== preset.presetId;
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
	const current = settingsSources(settings).presetId;
	if (current === undefined || presetId === undefined) return undefined;
	if (current === presetId) return undefined;
	return presets.find((preset) => preset.presetId === current);
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

export const resetTime = (resetsAt: string): string =>
	formatDate(resetsAt, {
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "shortOffset",
	});
