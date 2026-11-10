import type {
	RemitImapClassificationField,
	RemitImapClassificationPreset,
	RemitImapClassificationSettings,
	RemitImapClassificationTestResponse,
} from "@remit/api-http-client/types.gen.ts";
import {
	Banner,
	Button,
	ConfirmDialog,
	FieldLabel,
	formatErrorMessage,
	Input,
	PasswordInput,
	Select,
} from "@remit/ui";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useClassificationActions } from "../../../hooks/useClassificationSettings";
import {
	classificationReportHref,
	draftForPreset,
	draftFromSettings,
	FAILURE_FIELD_LINE,
	groupPresets,
	hasSavedKey,
	needsBaseUrl,
	type ProviderDraft,
	providerSave,
	switchingFrom,
	testFailureHeadline,
} from "../../../lib/classification";
import { formatDatePreset } from "../../../lib/format";

type FocusTarget = RemitImapClassificationField | "Replace";

interface FieldError {
	field: RemitImapClassificationField;
	message: string;
}

interface Failure {
	title: string;
	error: unknown;
}

const FIELD_FIX_LABEL: Record<RemitImapClassificationField, string> = {
	ApiKey: "Replace key",
	Model: "Fix the model",
	BaseUrl: "Fix the base URL",
};

function ReportLink({ href }: { href: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="inline-flex min-h-11 items-center font-medium text-accent hover:underline"
		>
			Report an issue
		</a>
	);
}

export function FailureBanner({ failure }: { failure: Failure }) {
	const message = formatErrorMessage(failure.error);
	return (
		<Banner tone="danger" variant="soft">
			<p className="font-medium">{failure.title}</p>
			<p className="mt-0.5 break-words text-fg-muted">{message}</p>
			<ReportLink href={classificationReportHref(failure.title, message)} />
		</Banner>
	);
}

function presetNote(preset: RemitImapClassificationPreset): string {
	const key = preset.needsKey ? "Needs an API key." : "No key needed.";
	if (preset.price.state === "Priced") {
		return `${key} $${preset.price.perMillionInputTokens} per million input tokens.`;
	}
	return key;
}

function TestOutcome({
	result,
	presetLabel,
	onFix,
	fixable,
}: {
	result: RemitImapClassificationTestResponse;
	presetLabel: string;
	onFix: (field: RemitImapClassificationField) => void;
	fixable: (field: RemitImapClassificationField) => boolean;
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
				{field !== undefined && fixable(field) && (
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

function Field({
	id,
	label,
	hint,
	error,
	children,
}: {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			{children}
			{error && (
				<p id={`${id}-error`} className="mt-1 text-xs text-danger">
					{error}
				</p>
			)}
			{hint && (
				<p id={`${id}-hint`} className="mt-1 text-xs text-fg-subtle">
					{hint}
				</p>
			)}
		</div>
	);
}

const describedBy = (id: string, hint: boolean, error: boolean) =>
	[error ? `${id}-error` : "", hint ? `${id}-hint` : ""]
		.filter(Boolean)
		.join(" ") || undefined;

export interface ProviderCardProps {
	presets: RemitImapClassificationPreset[];
	settings: RemitImapClassificationSettings;
}

export function ProviderCard({ presets, settings }: ProviderCardProps) {
	const { save, clear, test } = useClassificationActions();
	const [draft, setDraft] = useState<ProviderDraft>(() =>
		draftFromSettings(settings),
	);
	const [fieldError, setFieldError] = useState<FieldError | null>(null);
	const [testResult, setTestResult] =
		useState<RemitImapClassificationTestResponse | null>(null);
	const [replacing, setReplacing] = useState(false);
	const [confirmClear, setConfirmClear] = useState(false);
	const [failure, setFailure] = useState<Failure | null>(null);
	const [announcement, setAnnouncement] = useState("");
	const [focusTarget, setFocusTarget] = useState<{
		target: FocusTarget;
	} | null>(null);

	const modelRef = useRef<HTMLInputElement>(null);
	const baseUrlRef = useRef<HTMLInputElement>(null);
	const keyRef = useRef<HTMLInputElement>(null);
	const replaceRef = useRef<HTMLButtonElement>(null);
	const ids = useId();
	const presetFieldId = `${ids}-preset`;
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

	const preset = presets.find((entry) => entry.presetId === draft.presetId);
	const groups = groupPresets(presets);
	const savedKey = hasSavedKey(settings, draft.presetId);
	const showKeyRow = preset?.needsKey === true && savedKey && !replacing;
	const showKeyInput = preset?.needsKey === true && !showKeyRow;
	const showBaseUrl = preset !== undefined && needsBaseUrl(preset);
	const from = switchingFrom(settings, draft.presetId, presets);
	const errorFor = (field: RemitImapClassificationField) =>
		fieldError?.field === field ? fieldError.message : undefined;

	const focus = (target: FocusTarget) => setFocusTarget({ target });

	const edit = (
		field: RemitImapClassificationField,
		value: Partial<ProviderDraft>,
	) => {
		setDraft((current) => ({ ...current, ...value }));
		setTestResult((current) => (current?.state === "Passed" ? null : current));
		setFieldError((current) => (current?.field === field ? null : current));
		setAnnouncement("");
	};

	const pickPreset = (presetId: string) => {
		const picked = presets.find((entry) => entry.presetId === presetId);
		if (!picked) return;
		setDraft(draftForPreset(picked.presetId, settings));
		setTestResult(null);
		setFieldError(null);
		setFailure(null);
		setReplacing(false);
		setAnnouncement("");
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
		if (field === "ApiKey" && savedKey) {
			startReplace();
			return;
		}
		focus(field);
	};

	const fixable = (field: RemitImapClassificationField) =>
		field === "ApiKey"
			? preset?.needsKey === true
			: field === "BaseUrl"
				? showBaseUrl
				: true;

	const onSave = () => {
		if (!preset) return;
		const result = providerSave(draft, preset, settings);
		if (!result.ok) {
			setFieldError({ field: result.field, message: result.message });
			focus(result.field);
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
					setAnnouncement("Saved");
					if (wasReplacing) focus("Replace");
				},
				onError: (error) =>
					setFailure({ title: `${preset.label} was not saved`, error }),
			},
		);
	};

	const onTest = () => {
		if (!preset || test.isPending) return;
		setTestResult(null);
		setFailure(null);
		setAnnouncement("");
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
				onSuccess: (result) => {
					setTestResult(result);
					if (result.state === "Failed" && result.field !== undefined) {
						setFieldError({
							field: result.field,
							message: FAILURE_FIELD_LINE[result.kind],
						});
					}
				},
				onError: (error) =>
					setFailure({
						title: `The test of ${preset.label} did not run`,
						error,
					}),
			},
		);
	};

	const onClear = () => {
		if (!preset) return;
		clear.mutate(
			{},
			{
				onSuccess: () => {
					setConfirmClear(false);
					setReplacing(false);
					setTestResult(null);
					setFieldError(null);
					setDraft((current) => ({ ...current, apiKey: "" }));
				},
				onError: (error) => {
					setConfirmClear(false);
					setFailure({
						title: `The ${preset.label} key was not cleared`,
						error,
					});
				},
			},
		);
	};

	const enabled = settings.state === "Configured" && settings.enabled;
	const keyError = errorFor("ApiKey");

	return (
		<section className="space-y-4">
			<h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
				Provider
			</h2>
			<Field
				id={presetFieldId}
				label="Provider"
				hint={preset ? presetNote(preset) : undefined}
			>
				<Select
					id={presetFieldId}
					className="h-11"
					value={draft.presetId ?? ""}
					onChange={(event) => pickPreset(event.target.value)}
					aria-describedby={describedBy(
						presetFieldId,
						preset !== undefined,
						false,
					)}
				>
					<option value="" disabled>
						Choose a provider
					</option>
					{groups.map((group) => (
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
					{settings.state === "Configured" && settings.apiKeySaved
						? " and deletes its saved key."
						: "."}
				</p>
			)}
			{preset && (
				<>
					<Field
						id={modelId}
						label="Model"
						hint={`Empty uses ${preset.defaultModel}.`}
						error={errorFor("Model")}
					>
						<Input
							id={modelId}
							ref={modelRef}
							className="h-11"
							value={draft.model}
							placeholder={preset.defaultModel}
							autoComplete="off"
							spellCheck={false}
							aria-invalid={errorFor("Model") !== undefined}
							aria-describedby={describedBy(
								modelId,
								true,
								errorFor("Model") !== undefined,
							)}
							onChange={(event) => edit("Model", { model: event.target.value })}
						/>
					</Field>
					{showBaseUrl && (
						<Field
							id={baseUrlId}
							label="Base URL"
							hint="Remit's server calls this URL."
							error={errorFor("BaseUrl")}
						>
							<Input
								id={baseUrlId}
								ref={baseUrlRef}
								className="h-11"
								type="url"
								inputMode="url"
								value={draft.baseUrl}
								placeholder="http://localhost:11434/v1"
								autoComplete="off"
								spellCheck={false}
								required
								aria-invalid={errorFor("BaseUrl") !== undefined}
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
					)}
					{showKeyRow && settings.state === "Configured" && (
						<div>
							<p className="mb-1 text-xs font-medium text-fg-muted">API key</p>
							<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
								<span
									className={
										keyError ? "text-sm text-danger" : "text-sm text-fg"
									}
								>
									set
								</span>
								<span className="text-sm text-fg-muted">
									saved {formatDatePreset(settings.savedAt, "short")}
								</span>
								<span className="flex-1" />
								<Button
									ref={replaceRef}
									variant="secondary"
									className="min-h-11"
									onClick={startReplace}
								>
									Replace
								</Button>
								<Button
									variant="secondary"
									className="min-h-11"
									onClick={() => setConfirmClear(true)}
								>
									Clear
								</Button>
							</div>
							{keyError && (
								<p className="mt-1 text-xs text-danger">{keyError}</p>
							)}
						</div>
					)}
					{showKeyInput && (
						<Field
							id={keyId}
							label={replacing ? "New API key" : "API key"}
							hint={
								replacing
									? "The saved key stays in use until you press Save."
									: undefined
							}
							error={keyError}
						>
							<div className="flex items-center gap-2">
								<PasswordInput
									id={keyId}
									ref={keyRef}
									className="h-11 flex-1"
									value={draft.apiKey}
									placeholder={
										replacing ? "Paste the new key" : "Paste the key"
									}
									autoComplete="off"
									spellCheck={false}
									aria-invalid={keyError !== undefined}
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
						{test.isPending
							? `Sending one sample message to ${preset.label}`
							: announcement}
					</p>
					{testResult && (
						<TestOutcome
							result={testResult}
							presetLabel={preset.label}
							onFix={fixField}
							fixable={fixable}
						/>
					)}
					{failure && <FailureBanner failure={failure} />}
					<ConfirmDialog
						isOpen={confirmClear}
						title={`Clear the ${preset.label} key?`}
						description={
							enabled
								? `Classification is on. Clearing the key switches it off, and new mail goes back to built-in rules. To use ${preset.label} again you paste the key again.`
								: `To use ${preset.label} again you paste the key again.`
						}
						confirmLabel="Clear key"
						destructive
						isBusy={clear.isPending}
						onConfirm={onClear}
						onCancel={() => setConfirmClear(false)}
					/>
				</>
			)}
		</section>
	);
}
