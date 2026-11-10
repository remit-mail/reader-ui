import type { RemitImapClassificationSettings } from "@remit/api-http-client/types.gen.ts";
import { Button, cn } from "@remit/ui";
import { useId, useState } from "react";
import {
	useClassificationActions,
	useClassificationSettings,
} from "../../../hooks/useClassificationSettings";
import { classificationReportHref } from "../../../lib/classification";
import { FailureBanner, ProviderCard } from "./ProviderCard";

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

function StatusCard({
	settings,
}: {
	settings: RemitImapClassificationSettings;
}) {
	const { toggle } = useClassificationActions();
	const [refusal, setRefusal] = useState<unknown>(null);
	const ids = useId();
	const configured = settings.state === "Configured";
	const on = configured && settings.enabled;
	const inert = !configured || toggle.isPending;

	const flip = () => {
		if (inert) return;
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
				<button
					type="button"
					role="switch"
					aria-checked={on}
					aria-labelledby={`${ids}-label`}
					aria-describedby={`${ids}-note`}
					aria-disabled={inert}
					aria-busy={toggle.isPending}
					onClick={flip}
					className={cn(
						"inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
						inert ? "cursor-not-allowed" : "cursor-pointer",
					)}
				>
					<span
						aria-hidden
						className={cn(
							"relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
							on
								? "border-positive bg-positive"
								: "border-line-strong bg-surface-sunken",
							!configured && "opacity-60",
						)}
					>
						<span
							className={cn(
								"size-4 rounded-full bg-canvas transition-transform",
								on ? "translate-x-6" : "translate-x-1",
							)}
						/>
					</span>
				</button>
			</div>
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

export function ClassificationPanel() {
	const query = useClassificationSettings();

	if (query.isPending) {
		return (
			// biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label on a loading skeleton is what assistive tech has to go on
			<div
				className="h-48 animate-pulse rounded-sm border border-line bg-surface"
				aria-busy="true"
				aria-label="Loading mail classification settings"
			/>
		);
	}

	if (query.signedOut) return null;

	if (query.isError) {
		const message =
			query.error instanceof Error ? query.error.message : String(query.error);
		return (
			<div
				role="alert"
				className="space-y-2 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm"
			>
				<p className="font-medium text-danger">{LOAD_FAILED}</p>
				<p className="break-words text-fg-muted">{message}</p>
				<p className="flex items-center gap-4">
					<Button
						variant="secondary"
						className="min-h-11"
						onClick={() => void query.refetch()}
					>
						Retry
					</Button>
					<a
						href={classificationReportHref(LOAD_FAILED, message)}
						target="_blank"
						rel="noreferrer"
						className="inline-flex min-h-11 items-center font-medium text-accent hover:underline"
					>
						Report an issue
					</a>
				</p>
			</div>
		);
	}

	const { classification, classificationPresets } = query.data;
	return (
		<div className="max-w-xl space-y-8">
			<StatusCard settings={classification} />
			<ProviderCard presets={classificationPresets} settings={classification} />
		</div>
	);
}
