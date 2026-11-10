import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapAccountResponse,
	RemitImapClassificationPreset,
	RemitImapClassificationSettings,
	RemitImapClassificationUsage,
} from "@remit/api-http-client/types.gen.ts";
import { Badge, Banner, Button, Switch } from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import {
	useClassificationSettings,
	useSaveClassification,
} from "../../../hooks/useClassificationSettings";
import { isCapped, resetTime, usageCost } from "../../../lib/classification";
import { DailyLimitCard } from "./DailyLimitCard";
import { FailureBanner } from "./FailureBanner";
import { ProviderCard } from "./ProviderCard";

const LOAD_FAILED = "Mail classification settings did not load";

const switchNote = (settings: RemitImapClassificationSettings): string => {
	if (settings.state === "NotConfigured") {
		return "Save a provider below first. Until then, built-in rules label your mail.";
	}
	if (settings.enabled) {
		return "New mail goes to the model. A failed call falls back to built-in rules.";
	}
	return "Provider saved. Built-in rules label your mail until you switch this on.";
};

type NameOf = (accountId: string) => string;

const namesOf =
	(accounts: readonly RemitImapAccountResponse[]): NameOf =>
	(accountId) => {
		const account = accounts.find((entry) => entry.accountId === accountId);
		return account?.displayName?.trim() || account?.email || accountId;
	};

function StatusBadge({ on, capped }: { on: boolean; capped: boolean }) {
	if (!on) {
		return <Badge dot>off</Badge>;
	}
	if (capped) {
		return (
			<Badge tone="warning" dot>
				cap reached
			</Badge>
		);
	}
	return (
		<Badge tone="positive" dot>
			on
		</Badge>
	);
}

function UsageRows({
	usage: rows,
	preset,
	nameOf,
}: {
	usage: RemitImapClassificationUsage[];
	preset: RemitImapClassificationPreset | undefined;
	nameOf: NameOf;
}) {
	return (
		<dl className="space-y-2">
			{rows.map((usage) => (
				<div
					key={usage.accountId}
					className="flex flex-wrap items-baseline justify-between gap-x-3"
				>
					<dt className="min-w-0 truncate text-sm text-fg">
						{nameOf(usage.accountId)}
					</dt>
					<dd className="text-right text-sm text-fg-muted">
						<span className="text-fg">
							{usage.calls} / {usage.dailyLimit} calls
						</span>{" "}
						<span className="text-xs">
							{usageCost(usage, preset)}
							{isCapped(usage) && (
								<span className="text-warning"> · limit reached</span>
							)}
						</span>
					</dd>
				</div>
			))}
		</dl>
	);
}

function CapBanner({
	first,
	capped,
	nameOf,
	onRaiseLimit,
}: {
	first: RemitImapClassificationUsage;
	capped: RemitImapClassificationUsage[];
	nameOf: NameOf;
	onRaiseLimit: () => void;
}) {
	const names = new Intl.ListFormat("en", { type: "conjunction" }).format(
		capped.map((usage) => nameOf(usage.accountId)),
	);
	return (
		<Banner tone="warning" variant="soft">
			<p className="font-medium">
				{names} reached the daily limit of {first.dailyLimit} calls
			</p>
			<p className="mt-0.5 text-fg-muted">
				{capped.length === 1 ? "Its" : "Their"} new mail uses built-in rules
				until {resetTime(first.resetsAt)}.
			</p>
			<Button
				variant="secondary"
				className="mt-2 min-h-11"
				onClick={onRaiseLimit}
			>
				Raise the limit
			</Button>
		</Banner>
	);
}

function StatusCard({
	settings,
	presets,
	nameOf,
	onRaiseLimit,
}: {
	settings: RemitImapClassificationSettings;
	presets: RemitImapClassificationPreset[];
	nameOf: NameOf;
	onRaiseLimit: () => void;
}) {
	const toggle = useSaveClassification();
	const [refusal, setRefusal] = useState<unknown>(null);
	const ids = useId();
	const configured = settings.state === "Configured";
	const on = configured && settings.enabled;
	const capped = on ? settings.usage.filter(isCapped) : [];
	const [firstCapped] = capped;

	const flip = () => {
		setRefusal(null);
		toggle.mutate(
			{ body: { classificationEnabled: !on } },
			{ onError: setRefusal },
		);
	};

	return (
		<section aria-labelledby={`${ids}-title`} className="space-y-3">
			<h2
				id={`${ids}-title`}
				className="text-xs font-semibold uppercase tracking-wider text-fg-subtle"
			>
				Status
			</h2>
			<div className="flex min-h-11 items-center gap-3">
				<span className="flex min-w-0 flex-1 flex-col">
					<span id={`${ids}-label`} className="text-sm text-fg">
						Use the model
					</span>
					<span id={`${ids}-note`} className="text-xs text-fg-subtle">
						{switchNote(settings)}
					</span>
				</span>
				<StatusBadge on={on} capped={firstCapped !== undefined} />
				<Switch
					checked={on}
					aria-labelledby={`${ids}-label`}
					aria-describedby={`${ids}-note`}
					aria-disabled={!configured || toggle.isPending}
					aria-busy={toggle.isPending}
					onToggle={flip}
				/>
			</div>
			{firstCapped && (
				<CapBanner
					first={firstCapped}
					capped={capped}
					nameOf={nameOf}
					onRaiseLimit={onRaiseLimit}
				/>
			)}
			{configured && (
				<UsageRows
					usage={settings.usage}
					preset={presets.find(
						(preset) => preset.presetId === settings.presetId,
					)}
					nameOf={nameOf}
				/>
			)}
			{refusal !== null && (
				<FailureBanner
					failure={{
						title: on
							? "Classification was not switched off"
							: "Classification was not switched on",
						error: refusal,
					}}
				/>
			)}
		</section>
	);
}

function LoadingSkeleton() {
	return (
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label on a loading skeleton is what assistive tech has to go on
		<div
			className="h-48 animate-pulse rounded-sm border border-line bg-surface"
			aria-busy="true"
			aria-label="Loading mail classification settings"
		/>
	);
}

export function ClassificationPanel() {
	const query = useClassificationSettings();
	const config = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: Infinity,
	});
	const [announcement, setAnnouncement] = useState("");
	const limitRef = useRef<HTMLInputElement>(null);

	const raiseLimit = () => {
		const input = limitRef.current;
		if (!input) return;
		input.focus();
		input.select();
		input.scrollIntoView({ block: "center" });
	};

	if (query.isPending) return <LoadingSkeleton />;

	if (query.signedOut) return null;

	if (query.isError) {
		return (
			<FailureBanner
				failure={{ title: LOAD_FAILED, error: query.error }}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	if (config.isPending) return <LoadingSkeleton />;

	if (config.isError) {
		return (
			<FailureBanner
				failure={{ title: LOAD_FAILED, error: config.error }}
				onRetry={() => void config.refetch()}
			/>
		);
	}

	const { classification, classificationPresets } = query.data;
	return (
		<div className="max-w-xl space-y-8">
			<StatusCard
				settings={classification}
				presets={classificationPresets}
				nameOf={namesOf(config.data.accounts)}
				onRaiseLimit={raiseLimit}
			/>
			<ProviderCard
				key={classification.state}
				presets={classificationPresets}
				settings={classification}
				onAnnounce={setAnnouncement}
			/>
			{classification.state === "Configured" && (
				<DailyLimitCard
					settings={classification}
					inputRef={limitRef}
					onAnnounce={setAnnouncement}
				/>
			)}
			<p aria-live="polite" className="text-sm text-fg-muted">
				{announcement}
			</p>
		</div>
	);
}
