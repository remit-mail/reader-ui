import {
	Button,
	ButtonLink,
	cn,
	FailureBanner,
	FieldLabel,
	formatSpamScore,
	Input,
	LabelChip,
	type LabelSpamMode,
	SCORE_RANGE_ERROR,
	SegmentedControl,
	type SettingsNavItem,
	SettingsShell,
	SpamDailyChart,
	type SpamLatestFlagged,
	type SpamOverview,
	type SpamThresholdPreview,
	type SpamThresholds,
	type ThresholdDraft,
	topSpamReasonSentence,
	validateThresholds,
} from "@remit/ui";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

export interface SpamSectionError {
	title: string;
	message: string;
	reportHref: string;
	onRetry: () => void;
}

export type SpamSectionState<T> =
	| { status: "Loading" }
	| { status: "SignedOut" }
	| ({ status: "Error" } & SpamSectionError)
	| { status: "Ready"; data: T };

export interface SpamThresholdSettings {
	saved: SpamThresholds;
	defaults: SpamThresholds;
}

export interface SpamLabelModes {
	spam: LabelSpamMode;
	phishing: LabelSpamMode;
}

export interface SpamSettingsPageProps {
	navItems: SettingsNavItem[];
	overview: SpamSectionState<SpamOverview>;
	latest: SpamSectionState<SpamLatestFlagged>;
	thresholds: SpamSectionState<SpamThresholdSettings>;
	labelModes: SpamSectionState<SpamLabelModes>;
	preview: SpamThresholdPreview;
	saveFailure?: { message: string; reportHref: string; onRetry: () => void };
	neverInSpamHref: string;
	reportedHref: string;
	onDraftChange: (draft: SpamThresholds) => void;
	onSaveThresholds: (thresholds: SpamThresholds) => void;
	onLabelModeChange: (label: keyof SpamLabelModes, mode: LabelSpamMode) => void;
	onBackToMail: () => void;
}

const SECTION_TITLE =
	"text-xs font-semibold uppercase tracking-wider text-fg-subtle";

function Section({
	title,
	children,
	aside,
}: {
	title: string;
	children: ReactNode;
	aside?: ReactNode;
}) {
	const id = useId();
	return (
		<section aria-labelledby={id} className="space-y-3">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 id={id} className={SECTION_TITLE}>
					{title}
				</h2>
				{aside}
			</div>
			{children}
		</section>
	);
}

function Skeleton({ className }: { className: string }) {
	return (
		<div
			aria-hidden="true"
			className={cn("animate-pulse rounded-md bg-surface-sunken", className)}
		/>
	);
}

function SectionError({ failure }: { failure: SpamSectionError }) {
	return (
		<FailureBanner
			title={failure.title}
			message={failure.message}
			reportHref={failure.reportHref}
			onRetry={failure.onRetry}
		/>
	);
}

function OverviewSection({ state }: { state: SpamSectionState<SpamOverview> }) {
	if (state.status === "Loading" || state.status === "SignedOut") {
		return (
			<Section title="Last 30 days">
				<Skeleton className="h-4 w-64" />
				<div className="grid gap-6 sm:grid-cols-2">
					<Skeleton className="h-32" />
					<Skeleton className="h-32" />
				</div>
			</Section>
		);
	}
	if (state.status === "Error") {
		return (
			<Section title="Last 30 days">
				<SectionError failure={state} />
			</Section>
		);
	}
	const overview = state.data;
	if (!overview.checkedAny) {
		return (
			<Section title="Last 30 days">
				<div className="rounded-md border border-line px-4 py-6 text-center">
					<p className="font-medium text-fg">
						Remit has not checked any mail yet
					</p>
					<p className="mt-1 text-sm text-fg-muted">
						Counts appear here once new mail arrives.
					</p>
				</div>
			</Section>
		);
	}
	return (
		<Section title="Last 30 days">
			<p className="text-sm text-fg tabular-nums">
				{`Moved ${overview.moved} · Warned ${overview.warned} · You marked Not spam ${overview.markedNotSpam}`}
			</p>
			<div className="grid gap-6 sm:grid-cols-2">
				<SpamDailyChart title="Spam" tone="warning" days={overview.spam} />
				<SpamDailyChart
					title="Phishing"
					tone="danger"
					days={overview.phishing}
				/>
			</div>
			<ul className="flex list-none flex-wrap gap-x-4 gap-y-1 text-2xs text-fg-muted">
				<li className="flex items-center gap-1.5">
					<span className="size-2 rounded-sm bg-fg-muted" aria-hidden="true" />
					Moved to Spam
				</li>
				<li className="flex items-center gap-1.5">
					<span
						className="size-2 rounded-sm bg-fg-muted/35"
						aria-hidden="true"
					/>
					Warned
				</li>
				<li className="flex items-center gap-1.5">
					<span
						className="size-1 rounded-full bg-fg-muted"
						aria-hidden="true"
					/>
					You marked Not spam (either label)
				</li>
			</ul>
		</Section>
	);
}

function LatestSection({
	state,
}: {
	state: SpamSectionState<SpamLatestFlagged>;
}) {
	if (state.status === "Loading" || state.status === "SignedOut") {
		return (
			<Section title="Latest flagged">
				<div className="space-y-2">
					{["a", "b", "c", "d"].map((key) => (
						<Skeleton key={key} className="h-10" />
					))}
				</div>
			</Section>
		);
	}
	if (state.status === "Error") {
		return (
			<Section title="Latest flagged">
				<SectionError failure={state} />
			</Section>
		);
	}
	const latest = state.data;
	if (latest.messages.length === 0) {
		return (
			<Section title="Latest flagged">
				<p className="text-sm text-fg-muted">Nothing flagged yet.</p>
			</Section>
		);
	}
	return (
		<Section
			title="Latest flagged"
			aside={
				<span className="flex gap-4 text-sm">
					<a
						href={latest.reviewSpamHref}
						className="text-accent-2 hover:underline"
					>
						Review all in Spam
					</a>
					<a
						href={latest.openPhishingHref}
						className="text-accent-2 hover:underline"
					>
						Open Phishing
					</a>
				</span>
			}
		>
			<div className="overflow-x-auto rounded-md border border-line">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-line text-2xs uppercase tracking-wide text-fg-subtle">
						<tr>
							<th className="px-3 py-2 font-medium">Sender</th>
							<th className="px-3 py-2 font-medium">Subject and top reason</th>
							<th className="px-3 py-2 font-medium">Date</th>
							<th className="px-3 py-2 font-medium">Label</th>
							<th className="px-3 py-2 font-medium">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-line">
						{latest.messages.map((message) => (
							<tr key={message.messageId} className="hover:bg-surface-sunken">
								<td className="px-3 py-2 align-top text-fg">
									{message.senderName}
								</td>
								<td className="px-3 py-2 align-top">
									<a href={message.href} className="text-fg hover:underline">
										{message.subject}
									</a>
									<p className="text-xs text-fg-muted">
										{topSpamReasonSentence(message.reasons)}
									</p>
								</td>
								<td className="whitespace-nowrap px-3 py-2 align-top text-fg-muted tabular-nums">
									{message.date}
								</td>
								<td className="px-3 py-2 align-top">
									<LabelChip label={message.label} />
								</td>
								<td className="px-3 py-2 align-top text-fg-muted">
									{message.action === "Junk" ? "Moved" : "Warned"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

type ThresholdField = keyof ThresholdDraft;

const asDraft = (t: SpamThresholds): ThresholdDraft => ({
	warn: formatSpamScore(t.warn),
	junk: formatSpamScore(t.junk),
});

function ThresholdsSection({
	state,
	preview,
	saveFailure,
	onDraftChange,
	onSave,
}: {
	state: SpamSectionState<SpamThresholdSettings>;
	preview: SpamThresholdPreview;
	saveFailure?: { message: string; reportHref: string; onRetry: () => void };
	onDraftChange: (draft: SpamThresholds) => void;
	onSave: (thresholds: SpamThresholds) => void;
}) {
	const ids = useId();
	const ready = state.status === "Ready" ? state.data : undefined;
	const [draft, setDraft] = useState<ThresholdDraft>(() =>
		ready ? asDraft(ready.saved) : { warn: "", junk: "" },
	);
	const [errors, setErrors] = useState<Partial<Record<ThresholdField, string>>>(
		{},
	);
	const warnRef = useRef<HTMLInputElement>(null);
	const junkRef = useRef<HTMLInputElement>(null);
	const retryRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (saveFailure) retryRef.current?.focus();
	}, [saveFailure]);

	if (state.status === "Error") {
		return (
			<Section title="Thresholds">
				<SectionError failure={state} />
			</Section>
		);
	}

	const disabled = !ready;
	const defaults = ready?.defaults;

	const save = () => {
		const result = validateThresholds(draft);
		if (!result.ok) {
			setErrors(result.errors);
			(result.errors.warn ? warnRef : junkRef).current?.focus();
			return;
		}
		setErrors({});
		onSave(result.thresholds);
	};

	const edit = (field: ThresholdField, value: string) => {
		const next = { ...draft, [field]: value };
		setDraft(next);
		setErrors((current) => ({ ...current, [field]: undefined }));
		const result = validateThresholds(next);
		if (result.ok) onDraftChange(result.thresholds);
	};

	const field = (name: ThresholdField, label: string) => {
		const inputId = `${ids}-${name}`;
		const errorId = `${inputId}-error`;
		const error = errors[name];
		return (
			<div>
				<FieldLabel htmlFor={inputId}>{label}</FieldLabel>
				<Input
					id={inputId}
					ref={name === "warn" ? warnRef : junkRef}
					className={cn("h-11 w-28", error && "border-danger")}
					inputMode="decimal"
					autoComplete="off"
					disabled={disabled}
					value={draft[name]}
					aria-invalid={error !== undefined}
					aria-describedby={cn(`${ids}-hint`, error && errorId)}
					onChange={(event) => edit(name, event.target.value)}
				/>
				{error && (
					<p id={errorId} className="mt-1 text-xs text-danger">
						{error}
					</p>
				)}
			</div>
		);
	};

	return (
		<Section title="Thresholds">
			<form
				className="space-y-3"
				onSubmit={(event) => {
					event.preventDefault();
					save();
				}}
			>
				<div className="flex flex-wrap gap-4">
					{field("warn", "Warn from")}
					{field("junk", "Move to Spam from")}
				</div>
				<p id={`${ids}-hint`} className="text-xs text-fg-muted">
					{defaults
						? `${SCORE_RANGE_ERROR} The deployment default is ${formatSpamScore(defaults.warn)} and ${formatSpamScore(defaults.junk)}.`
						: SCORE_RANGE_ERROR}
				</p>
				{preview.status === "Ready" && (
					<div className="text-sm">
						<p className="text-fg">
							{`With these values, Remit warns about ${preview.draft.warns} and moves ${preview.draft.moves} of the mail it checked in the last 30 days.`}
						</p>
						<p className="text-fg-muted">
							{`Saved values: warns about ${preview.saved.warns}, moves ${preview.saved.moves}.`}
						</p>
					</div>
				)}
				{preview.status === "Failed" && (
					<p className="text-sm text-fg-muted">
						Couldn't count the last 30 days
					</p>
				)}
				{saveFailure && (
					<FailureBanner
						title="The thresholds were not saved"
						message={saveFailure.message}
						reportHref={saveFailure.reportHref}
						onRetry={saveFailure.onRetry}
						retryLabel="Try again"
						retryRef={retryRef}
					/>
				)}
				<div className="flex flex-wrap gap-2">
					<Button
						type="submit"
						variant="primary"
						className="min-h-11"
						disabled={disabled}
					>
						Save thresholds
					</Button>
					<Button
						variant="secondary"
						className="min-h-11"
						disabled={disabled}
						onClick={() => {
							if (!defaults) return;
							setDraft(asDraft(defaults));
							setErrors({});
							onSave(defaults);
						}}
					>
						Reset to default
					</Button>
				</div>
				<p className="text-xs text-fg-muted">
					These values apply to mail arriving from now on. Check again in any
					list updates older mail.
				</p>
			</form>
		</Section>
	);
}

const MODE_OPTIONS: { value: LabelSpamMode; label: string }[] = [
	{ value: "WarnOnly", label: "Warn only" },
	{ value: "MoveToSpam", label: "Move to Spam" },
];

function LabelModesSection({
	state,
	onChange,
}: {
	state: SpamSectionState<SpamLabelModes>;
	onChange: (label: keyof SpamLabelModes, mode: LabelSpamMode) => void;
}) {
	const [announcement, setAnnouncement] = useState("");
	const ids = useId();

	if (state.status === "Error") {
		return (
			<Section title="Per label">
				<SectionError failure={state} />
			</Section>
		);
	}

	const rows: { key: keyof SpamLabelModes; label: string }[] = [
		{ key: "spam", label: "Spam" },
		{ key: "phishing", label: "Phishing" },
	];

	return (
		<Section title="Per label">
			<div className="space-y-2">
				{rows.map((row) => (
					<div key={row.key} className="flex items-center gap-4">
						<span className="w-20 text-sm text-fg">{row.label}</span>
						{state.status === "Ready" ? (
							<SegmentedControl<LabelSpamMode>
								name={`${ids}-${row.key}`}
								aria-label={`${row.label} label`}
								size="sm"
								options={MODE_OPTIONS}
								value={state.data[row.key]}
								onChange={(mode) => {
									onChange(row.key, mode);
									setAnnouncement("Saved");
								}}
							/>
						) : (
							<Skeleton className="h-9 w-48" />
						)}
					</div>
				))}
			</div>
			<p className="text-xs text-fg-muted">
				Warn only keeps the message where it arrived, under the warning banner.
			</p>
			<p aria-live="polite" className="text-xs text-positive">
				{announcement}
			</p>
		</Section>
	);
}

function SendersSection({
	neverInSpamHref,
	reportedHref,
}: {
	neverInSpamHref: string;
	reportedHref: string;
}) {
	const groups = [
		{
			title: "Never in Spam",
			hint: "Their mail skips the spam check.",
			href: neverInSpamHref,
		},
		{
			title: "Reported",
			hint: "Their mail goes straight to Spam.",
			href: reportedHref,
		},
	];
	return (
		<Section title="Senders">
			<ul className="list-none divide-y divide-line rounded-md border border-line">
				{groups.map((group) => (
					<li
						key={group.title}
						className="flex items-center justify-between gap-3 px-3 py-2"
					>
						<div>
							<p className="text-sm font-medium text-fg">{group.title}</p>
							<p className="text-xs text-fg-muted">{group.hint}</p>
						</div>
						<ButtonLink
							variant="secondary"
							className="min-h-11"
							href={group.href}
							aria-label={`Manage ${group.title}`}
						>
							Manage
						</ButtonLink>
					</li>
				))}
			</ul>
		</Section>
	);
}

/**
 * The Spam & phishing settings page at `/settings/spam`: what Remit flagged in
 * the last 30 days, the thresholds, the per-label action and the sender
 * groups. Every section loads and fails on its own.
 */
export function SpamSettingsPage({
	navItems,
	overview,
	latest,
	thresholds,
	labelModes,
	preview,
	saveFailure,
	neverInSpamHref,
	reportedHref,
	onDraftChange,
	onSaveThresholds,
	onLabelModeChange,
	onBackToMail,
}: SpamSettingsPageProps) {
	return (
		<SettingsShell
			items={navItems}
			activeId="spam"
			title="Spam & phishing"
			description="What Remit flagged, and when it acts."
			onBackToMail={onBackToMail}
		>
			<div className="max-w-3xl space-y-8">
				<OverviewSection state={overview} />
				<LatestSection state={latest} />
				<ThresholdsSection
					key={thresholds.status}
					state={thresholds}
					preview={preview}
					saveFailure={saveFailure}
					onDraftChange={onDraftChange}
					onSave={onSaveThresholds}
				/>
				<LabelModesSection state={labelModes} onChange={onLabelModeChange} />
				<SendersSection
					neverInSpamHref={neverInSpamHref}
					reportedHref={reportedHref}
				/>
			</div>
		</SettingsShell>
	);
}
