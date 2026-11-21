import {
	classificationStatsOperationsGetClassificationStatsOptions,
	configOperationsGetConfigOptions,
	userSettingsOperationsGetUserSettingsOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { unifiedThreadOperationsListAllThreads } from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapSpamLabelPlacement,
	RemitImapSpamSettings,
	RemitImapThreadMessageResponse,
} from "@remit/api-http-client/types.gen.ts";
import {
	buttonClassName,
	cn,
	FailureBanner,
	formatErrorMessage,
	formatSpamScore,
	LabelChip,
	SegmentedControl,
	SpamDailyChart,
	topSpamReasonSentence,
} from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { useSaveClassification } from "../../../hooks/useClassificationSettings";
import { useJunkMailboxIds } from "../../../hooks/useJunkMailboxIds";
import { useLabelList } from "../../../hooks/useLabels";
import {
	isUnauthenticated,
	softErrorStatuses,
} from "../../../lib/error-classifier";
import { formatEmailDate } from "../../../lib/format";
import {
	flaggedVerdict,
	remitSpamLabel,
	spamReportHref,
} from "../../../lib/spam";
import {
	buildSpamOverview,
	overviewDays,
	spamOverviewSince,
} from "../../../lib/spam-overview";
import { NavLink } from "../../../routing";

const SECTION_TITLE =
	"text-xs font-semibold uppercase tracking-wider text-fg-subtle";

const sectionMeta = softErrorStatuses(400, 403, 404);

const LATEST_COUNT = 10;

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

/**
 * A section's load failure. An expired session raises the signed-out notice
 * over the page, so the section stays a skeleton behind it rather than reading
 * as empty.
 */
function SectionFailure({
	title,
	error,
	onRetry,
	skeleton,
}: {
	title: string;
	error: unknown;
	onRetry: () => void;
	skeleton: ReactNode;
}) {
	if (isUnauthenticated(error)) return skeleton;
	const message = formatErrorMessage(error);
	return (
		<FailureBanner
			title={title}
			message={message}
			reportHref={spamReportHref(title, message)}
			onRetry={onRetry}
		/>
	);
}

function OverviewSection() {
	const [now] = useState(() => new Date());
	const stats = useQuery({
		...classificationStatsOperationsGetClassificationStatsOptions({
			query: { since: spamOverviewSince(now) },
		}),
		meta: sectionMeta,
	});
	const skeleton = (
		<>
			<Skeleton className="h-4 w-64" />
			<div className="grid gap-6 sm:grid-cols-2">
				<Skeleton className="h-32" />
				<Skeleton className="h-32" />
			</div>
		</>
	);

	if (stats.isPending)
		return <Section title="Last 30 days">{skeleton}</Section>;
	if (stats.isError) {
		return (
			<Section title="Last 30 days">
				<SectionFailure
					title="Couldn't count the last 30 days"
					error={stats.error}
					onRetry={() => void stats.refetch()}
					skeleton={skeleton}
				/>
			</Section>
		);
	}

	const overview = buildSpamOverview(stats.data, overviewDays(now));
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
				{`Reached Spam ${overview.moved} · Warned ${overview.warned}`}
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
					Reached the Move to Spam threshold
				</li>
				<li className="flex items-center gap-1.5">
					<span
						className="size-2 rounded-sm bg-fg-muted/35"
						aria-hidden="true"
					/>
					Warned
				</li>
			</ul>
		</Section>
	);
}

const latestOf = async (
	labelId: string,
): Promise<RemitImapThreadMessageResponse[]> => {
	const { data } = await unifiedThreadOperationsListAllThreads({
		query: { labelId, order: "desc", limit: LATEST_COUNT },
		throwOnError: true,
	});
	return data.items ?? [];
};

function LatestSection() {
	const junkMailboxIds = useJunkMailboxIds();
	const config = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: Infinity,
	});
	const labelList = useLabelList(config.data?.accounts[0]?.accountId);
	const spamLabel = labelList.labels.find((label) => label.name === "Spam");
	const phishingLabel = labelList.labels.find(
		(label) => label.name === "Phishing",
	);
	const labelIds = [spamLabel, phishingLabel].flatMap((label) =>
		label ? [label.labelId] : [],
	);
	const latest = useQuery({
		queryKey: ["spam-settings", "latest-flagged", ...labelIds],
		queryFn: async () =>
			(await Promise.all(labelIds.map(latestOf)))
				.flat()
				.filter(
					(row) => !row.spamCleared && remitSpamLabel(row.labels) !== undefined,
				)
				.sort((a, b) => b.sentDate - a.sentDate)
				.slice(0, LATEST_COUNT),
		enabled: labelList.isSuccess,
		meta: sectionMeta,
	});
	const skeleton = (
		<div className="space-y-2">
			{["a", "b", "c", "d"].map((key) => (
				<Skeleton key={key} className="h-10" />
			))}
		</div>
	);

	const failure = config.isError
		? { error: config.error, retry: () => void config.refetch() }
		: labelList.isError
			? { error: labelList.error, retry: () => void labelList.refetch() }
			: latest.isError
				? { error: latest.error, retry: () => void latest.refetch() }
				: undefined;
	if (failure) {
		return (
			<Section title="Latest flagged">
				<SectionFailure
					title="Couldn't load the latest flagged mail"
					error={failure.error}
					onRetry={failure.retry}
					skeleton={skeleton}
				/>
			</Section>
		);
	}
	if (!latest.isSuccess) {
		return <Section title="Latest flagged">{skeleton}</Section>;
	}
	if (latest.data.length === 0) {
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
					{spamLabel && (
						<NavLink
							to="/mail/label/$labelId"
							params={{ labelId: spamLabel.labelId }}
							variant="inline"
						>
							Review all in Spam
						</NavLink>
					)}
					{phishingLabel && (
						<NavLink
							to="/mail/label/$labelId"
							params={{ labelId: phishingLabel.labelId }}
							variant="inline"
						>
							Open Phishing
						</NavLink>
					)}
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
						{latest.data.map((row) => {
							const label = remitSpamLabel(row.labels);
							if (!label) return null;
							const verdict = flaggedVerdict(row.spamVerdict);
							return (
								<tr key={row.messageId} className="hover:bg-surface-sunken">
									<td className="px-3 py-2 align-top text-fg">
										{row.fromName ?? row.fromEmail ?? "Unknown"}
									</td>
									<td className="px-3 py-2 align-top">
										<NavLink
											to="/mail/label/$labelId/$threadId/$messageId"
											params={{
												labelId: label.labelId,
												threadId: row.threadId,
												messageId: row.messageId,
											}}
											variant="inline"
											className="text-fg"
										>
											{row.subject ?? "(No subject)"}
										</NavLink>
										{verdict && (
											<p className="text-xs text-fg-muted">
												{topSpamReasonSentence(verdict.reasons)}
											</p>
										)}
									</td>
									<td className="whitespace-nowrap px-3 py-2 align-top text-fg-muted tabular-nums">
										{formatEmailDate(row.sentDate)}
									</td>
									<td className="px-3 py-2 align-top">
										<LabelChip label={label} />
									</td>
									<td className="px-3 py-2 align-top text-fg-muted">
										{junkMailboxIds.has(row.mailboxId) ? "Moved" : "Warned"}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

function ThresholdsSection({ spam }: { spam: RemitImapSpamSettings }) {
	const { thresholds } = spam;
	return (
		<Section title="Thresholds">
			{thresholds.state === "Set" ? (
				<dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
					<div>
						<dt className="text-fg-muted">Warn from</dt>
						<dd className="font-medium text-fg tabular-nums">
							{formatSpamScore(thresholds.cleanBelow)}
						</dd>
					</div>
					<div>
						<dt className="text-fg-muted">Move to Spam from</dt>
						<dd className="font-medium text-fg tabular-nums">
							{formatSpamScore(thresholds.spamAt)}
						</dd>
					</div>
				</dl>
			) : (
				<p className="text-sm text-fg">
					The spam service applies its own thresholds.
				</p>
			)}
			<p className="text-xs text-fg-muted">
				Scores run from 0 to 1. The deployment sets these values, and they apply
				to mail arriving from now on. Check again in any list updates older
				mail.
			</p>
		</Section>
	);
}

const PLACEMENT_OPTIONS: {
	value: RemitImapSpamLabelPlacement;
	label: string;
}[] = [
	{ value: "WarnOnly", label: "Warn only" },
	{ value: "MoveToSpam", label: "Move to Spam" },
];

function PlacementSection({ spam }: { spam: RemitImapSpamSettings }) {
	const save = useSaveClassification();
	const [announcement, setAnnouncement] = useState("");
	const ids = useId();
	const rows = [
		{
			field: "spamPlacementSpam",
			label: "Spam",
			value: spam.spamPlacement,
		},
		{
			field: "spamPlacementPhishing",
			label: "Phishing",
			value: spam.phishingPlacement,
		},
	] as const;

	return (
		<Section title="Per label">
			<div className="space-y-2">
				{rows.map((row) => (
					<div key={row.field} className="flex items-center gap-4">
						<span className="w-20 text-sm text-fg">{row.label}</span>
						<SegmentedControl<RemitImapSpamLabelPlacement>
							name={`${ids}-${row.field}`}
							aria-label={`${row.label} label`}
							size="sm"
							options={PLACEMENT_OPTIONS}
							value={row.value}
							onChange={(placement) => {
								setAnnouncement("");
								save.mutate(
									{ body: { [row.field]: placement } },
									{ onSuccess: () => setAnnouncement("Saved") },
								);
							}}
						/>
					</div>
				))}
			</div>
			<p className="text-xs text-fg-muted">
				Warn only keeps the message where it arrived, under the warning banner.
			</p>
			{save.isError && (
				<FailureBanner
					title="The label setting was not saved"
					message={formatErrorMessage(save.error)}
					reportHref={spamReportHref(
						"The label setting was not saved",
						formatErrorMessage(save.error),
					)}
					onRetry={() => save.variables && save.mutate(save.variables)}
				/>
			)}
			<p aria-live="polite" className="text-xs text-positive">
				{announcement}
			</p>
		</Section>
	);
}

function SettingsSections() {
	const settings = useQuery({
		...userSettingsOperationsGetUserSettingsOptions(),
		meta: sectionMeta,
	});
	const skeleton = (
		<>
			<Section title="Thresholds">
				<Skeleton className="h-11 w-64" />
			</Section>
			<Section title="Per label">
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-9 w-48" />
			</Section>
		</>
	);
	if (settings.isPending) return skeleton;
	if (settings.isError) {
		return (
			<Section title="Thresholds">
				<SectionFailure
					title="Couldn't load the spam settings"
					error={settings.error}
					onRetry={() => void settings.refetch()}
					skeleton={skeleton}
				/>
			</Section>
		);
	}
	return (
		<>
			<ThresholdsSection spam={settings.data.spam} />
			<PlacementSection spam={settings.data.spam} />
		</>
	);
}

function SendersSection() {
	const groups = [
		{
			title: "Never in Spam",
			hint: "Their mail skips the spam check.",
			group: "neverSpam",
		},
		{
			title: "Reported",
			hint: "Their mail goes straight to Spam.",
			group: "blocked",
		},
	] as const;
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
						<NavLink
							to="/settings/senders"
							search={{ group: group.group }}
							variant="inline"
							className={cn(
								buttonClassName({ variant: "secondary" }),
								"min-h-11 hover:no-underline",
							)}
							aria-label={`Manage ${group.title}`}
						>
							Manage
						</NavLink>
					</li>
				))}
			</ul>
		</Section>
	);
}

/**
 * The Spam & phishing settings at `/settings/spam`: what Remit flagged in the
 * last 30 days, the thresholds in effect, the per-label action and the sender
 * groups. Every section loads and fails on its own.
 */
export function SpamSettingsPanel() {
	return (
		<div className="max-w-3xl space-y-8">
			<OverviewSection />
			<LatestSection />
			<SettingsSections />
			<SendersSection />
		</div>
	);
}
