import type {
	RemitImapClassificationField,
	RemitImapClassificationPreset,
	RemitImapClassificationSettings,
	RemitImapClassificationTestResponse,
} from "@remit/api-http-client/types.gen.ts";
import { ClassificationValueSource } from "@remit/domain-enums";
import {
	Banner,
	Button,
	ConfirmDialog,
	Input,
	PasswordInput,
	Select,
} from "@remit/ui";
import { useEffect, useId, useRef, useState } from "react";
import {
	useClearClassification,
	useSaveClassification,
	useTestClassification,
} from "../../../hooks/useClassificationSettings";
import {
	classificationReportHref,
	draftForPreset,
	draftFromSettings,
	effectiveValue,
	groupPresets,
	hasSavedProvider,
	isKeyRequiredRefusal,
	needsBaseUrl,
	PASTE_KEY,
	type ProviderDraft,
	presetNote,
	providerSave,
	settingsSources,
	sourcesFor,
	switchingFrom,
	testFailureHeadline,
	withSourceNote,
} from "../../../lib/classification";
import { ReportLink } from "../ReportLink";
import { type ClassificationFailure, FailureBanner } from "./FailureBanner";
import { describedBy, Field } from "./Field";

type FocusTarget = RemitImapClassificationField | "Replace";

interface FieldError {
	field: RemitImapClassificationField;
	message: string;
}

const FIELD_FIX_LABEL: Record<RemitImapClassificationField, string> = {
	ApiKey: "Replace key",
	Model: "Fix the model",
	BaseUrl: "Fix the base URL",
};

function TestOutcome({
	result,
	presetLabel,
	onFix,
	shown,
}: {
	result: RemitImapClassificationTestResponse;
	presetLabel: string;
	onFix: (field: RemitImapClassificationField) => void;
	shown: Record<RemitImapClassificationField, boolean>;
}) {
	if (result.state === "Passed") {
		return (
			<Banner tone="success" variant="soft">
				<p className="font-medium">Test passed in {result.latencyMs} ms</p>
				<p className="mt-0.5 text-fg-muted">
					Sample message labelled {result.label},{" "}
					{Math.round(result.confidence * 100)}% confident.
				</p>
			</Banner>
		);
	}
	const headline = testFailureHeadline(result);
	const field = result.field;
	return (
		<Banner tone="danger" variant="soft">
			<p className="font-medium">{headline}</p>
			<p className="mt-0.5 break-words text-fg-muted">
				{result.fix} Nothing changed: classification stays as it was.
			</p>
			<p className="flex flex-wrap items-center gap-x-4">
				{field !== undefined && shown[field] && (
					<button
						type="button"
						onClick={() => onFix(field)}
						className="inline-flex min-h-11 items-center font-medium text-accent hover:underline"
					>
						{FIELD_FIX_LABEL[field]}
					</button>
				)}
				<ReportLink
					href={classificationReportHref(
						`Test of ${presetLabel} failed`,
						`${headline}. ${result.kind}. ${result.fix}`,
					)}
				/>
			</p>
		</Banner>
	);
}

interface PresetFormProps {
	preset: RemitImapClassificationPreset;
	settings: RemitImapClassificationSettings;
	onAnnounce: (text: string) => void;
}

function PresetForm({ preset, settings, onAnnounce }: PresetFormProps) {
	const save = useSaveClassification();
	const test = useTestClassification();
	const [draft, setDraft] = useState<ProviderDraft>(() =>
		draftForPreset(preset, settings),
	);
	const [fieldError, setFieldError] = useState<FieldError | null>(null);
	const [testResult, setTestResult] =
		useState<RemitImapClassificationTestResponse | null>(null);
	const [replacing, setReplacing] = useState(false);
	const [failure, setFailure] = useState<ClassificationFailure | null>(null);
	const [focusTarget, setFocusTarget] = useState<{
		target: FocusTarget;
	} | null>(null);

	const modelRef = useRef<HTMLInputElement>(null);
	const baseUrlRef = useRef<HTMLInputElement>(null);
	const keyRef = useRef<HTMLInputElement>(null);
	const replaceRef = useRef<HTMLButtonElement>(null);
	const ids = useId();
	const modelId = `${ids}-model`;
	const baseUrlId = `${ids}-base-url`;
	const keyId = `${ids}-key`;

	useEffect(() => {
		if (!focusTarget) return;
		const refs = {
			Model: modelRef,
			BaseUrl: baseUrlRef,
			ApiKey: keyRef,
			Replace: replaceRef,
		};
		refs[focusTarget.target].current?.focus();
	}, [focusTarget]);

	const sources = sourcesFor(settings, preset.presetId);
	const keySource = sources?.apiKey ?? ClassificationValueSource.Default;
	const keyInUse =
		preset.needsKey && keySource !== ClassificationValueSource.Default;
	const keyInherited = keySource === ClassificationValueSource.Deployment;
	const showKeyInput = preset.needsKey && (!keyInUse || replacing);
	const shown: Record<RemitImapClassificationField, boolean> = {
		ApiKey: preset.needsKey,
		Model: true,
		BaseUrl: true,
	};
	const errorFor = (field: RemitImapClassificationField) =>
		fieldError?.field === field ? fieldError.message : undefined;
	const invalid = (field: RemitImapClassificationField) =>
		errorFor(field) !== undefined ||
		(testResult?.state === "Failed" && testResult.field === field);

	const focus = (target: FocusTarget) => setFocusTarget({ target });

	const edit = (
		field: RemitImapClassificationField,
		value: Partial<ProviderDraft>,
	) => {
		setDraft((current) => ({ ...current, ...value }));
		setTestResult((current) => (current?.state === "Passed" ? null : current));
		setFieldError((current) => (current?.field === field ? null : current));
		onAnnounce("");
	};

	const startReplace = () => {
		setReplacing(true);
		focus("ApiKey");
	};

	const cancelReplace = () => {
		setReplacing(false);
		setDraft((current) => ({ ...current, apiKey: "" }));
		setFieldError((current) => (current?.field === "ApiKey" ? null : current));
		focus("Replace");
	};

	const fixField = (field: RemitImapClassificationField) => {
		if (field === "ApiKey" && keyInUse) {
			startReplace();
			return;
		}
		focus(field);
	};

	const onSave = () => {
		const result = providerSave(draft, preset, settings);
		if (!result.ok) {
			setFieldError({ field: result.field, message: result.message });
			fixField(result.field);
			return;
		}
		setFailure(null);
		const wasReplacing = replacing;
		save.mutate(
			{ body: result.body },
			{
				onSuccess: () => {
					setDraft((current) => ({ ...current, apiKey: "" }));
					setReplacing(false);
					setFieldError(null);
					onAnnounce("Saved");
					if (wasReplacing) focus("Replace");
				},
				onError: (error) => {
					if (isKeyRequiredRefusal(error)) {
						setFieldError({ field: "ApiKey", message: PASTE_KEY });
						fixField("ApiKey");
						return;
					}
					setFailure({ title: `${preset.label} was not saved`, error });
				},
			},
		);
	};

	const onTest = () => {
		if (test.isPending) return;
		setTestResult(null);
		setFailure(null);
		onAnnounce("");
		test.mutate(
			{
				body: {
					presetId: preset.presetId,
					model: draft.model.trim(),
					baseUrl: draft.baseUrl.trim(),
					apiKey: draft.apiKey.trim(),
				},
			},
			{
				onSuccess: setTestResult,
				onError: (error) =>
					setFailure({
						title: `The test of ${preset.label} did not run`,
						error,
					}),
			},
		);
	};

	const modelPlaceholder =
		effectiveValue(settings, preset.presetId, "model") ?? preset.defaultModel;
	const baseUrlPlaceholder =
		effectiveValue(settings, preset.presetId, "baseUrl") ??
		preset.defaultBaseUrl ??
		"http://localhost:11434/v1";
	const keyError = errorFor("ApiKey");

	return (
		<>
			<Field
				id={modelId}
				label="Model"
				hint={withSourceNote(`Empty uses ${modelPlaceholder}.`, sources?.model)}
				error={errorFor("Model")}
			>
				<Input
					id={modelId}
					ref={modelRef}
					className="h-11"
					value={draft.model}
					placeholder={modelPlaceholder}
					autoComplete="off"
					spellCheck={false}
					aria-invalid={invalid("Model")}
					aria-describedby={describedBy(
						modelId,
						true,
						errorFor("Model") !== undefined,
					)}
					onChange={(event) => edit("Model", { model: event.target.value })}
				/>
			</Field>
			{
				<Field
					id={baseUrlId}
					label="Base URL"
					hint={withSourceNote(
						"Remit's server calls this URL.",
						sources?.baseUrl,
					)}
					error={errorFor("BaseUrl")}
				>
					<Input
						id={baseUrlId}
						ref={baseUrlRef}
						className="h-11"
						type="url"
						inputMode="url"
						value={draft.baseUrl}
						placeholder={baseUrlPlaceholder}
						autoComplete="off"
						spellCheck={false}
						required={needsBaseUrl(preset)}
						aria-invalid={invalid("BaseUrl")}
						aria-describedby={describedBy(
							baseUrlId,
							true,
							errorFor("BaseUrl") !== undefined,
						)}
						onChange={(event) =>
							edit("BaseUrl", { baseUrl: event.target.value })
						}
					/>
				</Field>
			}
			{keyInUse && !replacing && (
				<div>
					<p className="mb-1 text-xs font-medium text-fg-muted">API key</p>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						{keyInherited ? (
							<span
								className={
									invalid("ApiKey")
										? "text-sm text-danger"
										: "text-sm text-fg-muted"
								}
							>
								provided by the deployment
							</span>
						) : (
							<span
								className={
									invalid("ApiKey") ? "text-sm text-danger" : "text-sm text-fg"
								}
							>
								set
							</span>
						)}
						<span className="flex-1" />
						<Button
							ref={replaceRef}
							variant="secondary"
							className="min-h-11"
							aria-invalid={invalid("ApiKey")}
							onClick={startReplace}
						>
							{keyInherited ? "Use your own key" : "Replace"}
						</Button>
					</div>
				</div>
			)}
			{showKeyInput && (
				<Field
					id={keyId}
					label={replacing ? "New API key" : "API key"}
					hint={
						replacing ? "The key in use stays until you press Save." : undefined
					}
					error={keyError}
				>
					<div className="flex items-center gap-2">
						<PasswordInput
							id={keyId}
							ref={keyRef}
							className="h-11 flex-1"
							value={draft.apiKey}
							placeholder={replacing ? "Paste the new key" : "Paste the key"}
							autoComplete="off"
							spellCheck={false}
							aria-invalid={invalid("ApiKey")}
							aria-describedby={describedBy(
								keyId,
								replacing,
								keyError !== undefined,
							)}
							onChange={(event) =>
								edit("ApiKey", { apiKey: event.target.value })
							}
							onKeyDown={(event) => {
								if (event.key === "Escape" && replacing) {
									event.preventDefault();
									event.stopPropagation();
									cancelReplace();
								}
							}}
						/>
						{replacing && (
							<Button
								variant="ghost"
								className="min-h-11"
								onClick={cancelReplace}
							>
								Cancel
							</Button>
						)}
					</div>
				</Field>
			)}
			<div className="flex flex-wrap gap-2">
				<Button
					variant="primary"
					className="min-h-11"
					aria-disabled={save.isPending}
					onClick={() => {
						if (!save.isPending) onSave();
					}}
				>
					{save.isPending ? "Saving…" : "Save"}
				</Button>
				<Button
					variant="secondary"
					className="min-h-11"
					aria-disabled={test.isPending}
					aria-busy={test.isPending}
					onClick={onTest}
				>
					{test.isPending ? "Testing…" : "Test connection"}
				</Button>
			</div>
			<p aria-live="polite" className="text-sm text-fg-muted empty:hidden">
				{test.isPending ? `Sending one sample message to ${preset.label}` : ""}
			</p>
			{testResult && (
				<TestOutcome
					result={testResult}
					presetLabel={preset.label}
					onFix={fixField}
					shown={shown}
				/>
			)}
			{failure && <FailureBanner failure={failure} />}
		</>
	);
}

export interface ProviderCardProps {
	presets: RemitImapClassificationPreset[];
	settings: RemitImapClassificationSettings;
	onAnnounce: (text: string) => void;
}

export function ProviderCard({
	presets,
	settings,
	onAnnounce,
}: ProviderCardProps) {
	const [presetId, setPresetId] = useState(
		() => draftFromSettings(settings).presetId,
	);
	const clear = useClearClassification();
	const [confirmClear, setConfirmClear] = useState(false);
	const [cleared, setCleared] = useState(0);
	const [clearFailure, setClearFailure] =
		useState<ClassificationFailure | null>(null);
	const presetFieldId = useId();
	const preset = presets.find((entry) => entry.presetId === presetId);
	const from = switchingFrom(settings, presetId, presets);
	const enabled = settings.state === "Configured" && settings.enabled;

	const onClear = () => {
		setClearFailure(null);
		clear.mutate(
			{},
			{
				onSuccess: (response) => {
					setConfirmClear(false);
					setPresetId(draftFromSettings(response.classification).presetId);
					setCleared((count) => count + 1);
				},
				onError: (error) => {
					setConfirmClear(false);
					setClearFailure({
						title: "The provider settings were not cleared",
						error,
					});
				},
			},
		);
	};

	return (
		<section className="space-y-4">
			<div className="flex min-h-11 items-center gap-3">
				<h2 className="flex-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
					Provider
				</h2>
				{hasSavedProvider(settings) && (
					<Button
						variant="secondary"
						className="min-h-11"
						onClick={() => setConfirmClear(true)}
					>
						Clear
					</Button>
				)}
			</div>
			{clearFailure && <FailureBanner failure={clearFailure} />}
			<Field
				id={presetFieldId}
				label="Provider"
				hint={preset ? presetNote(preset) : undefined}
			>
				<Select
					id={presetFieldId}
					className="h-11"
					value={presetId ?? ""}
					onChange={(event) =>
						setPresetId(
							presets.find((entry) => entry.presetId === event.target.value)
								?.presetId,
						)
					}
					aria-describedby={describedBy(
						presetFieldId,
						preset !== undefined,
						false,
					)}
				>
					<option value="" disabled>
						Choose a provider
					</option>
					{groupPresets(presets).map((group) => (
						<optgroup key={group.group} label={group.label}>
							{group.presets.map((entry) => (
								<option key={entry.presetId} value={entry.presetId}>
									{entry.label}
								</option>
							))}
						</optgroup>
					))}
				</Select>
			</Field>
			{from && (
				<p className="text-sm text-warning">
					Saving switches from {from.label}
					{settingsSources(settings).sources?.apiKey ===
					ClassificationValueSource.Saved
						? " and deletes its saved key."
						: "."}
				</p>
			)}
			{preset && (
				<PresetForm
					key={`${preset.presetId}-${cleared}`}
					preset={preset}
					settings={settings}
					onAnnounce={onAnnounce}
				/>
			)}
			<ConfirmDialog
				isOpen={confirmClear}
				title="Clear the provider settings?"
				description={
					enabled
						? "Classification is on. Clearing the provider switches it off, and new mail goes back to built-in rules. Every field returns to the deployment default."
						: "Clearing the provider returns every field to the deployment default."
				}
				confirmLabel="Clear"
				destructive
				isBusy={clear.isPending}
				onConfirm={onClear}
				onCancel={() => setConfirmClear(false)}
			/>
		</section>
	);
}
