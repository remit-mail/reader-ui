import type {
	RemitImapClassificationFailureKind,
	RemitImapClassificationField,
	RemitImapClassificationPreset,
	RemitImapClassificationPresetGroup,
	RemitImapClassificationPresetId,
	RemitImapClassificationSettings,
	RemitImapClassificationTestFailed,
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

export const isClassificationSignedOut = (error: unknown): boolean => {
	const status = getErrorStatus(error);
	return status === 401 || status === 403;
};

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
): boolean =>
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

export const FAILURE_FIELD_LINE: Record<
	RemitImapClassificationFailureKind,
	string
> = {
	Unauthorized: "The provider rejected this key.",
	ModelNotFound: "The provider does not know this model.",
	RateLimited: "The provider is rate limiting this key.",
	Rejected: "The provider refused the request.",
	ProviderError: "The provider is failing.",
	Unreachable: "Remit's server could not reach this URL.",
	TimedOut: "No answer from this URL within 10 seconds.",
	Unparseable: "The answer from this model could not be read.",
};
