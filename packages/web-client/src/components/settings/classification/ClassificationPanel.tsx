import type { RemitImapClassificationSettings } from "@remit/api-http-client/types.gen.ts";
import { Switch } from "@remit/ui";
import { useId, useState } from "react";
import {
	useClassificationSettings,
	useSaveClassification,
} from "../../../hooks/useClassificationSettings";
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

function StatusCard({
	settings,
}: {
	settings: RemitImapClassificationSettings;
}) {
	const toggle = useSaveClassification();
	const [refusal, setRefusal] = useState<unknown>(null);
	const ids = useId();
	const configured = settings.state === "Configured";
	const on = configured && settings.enabled;

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
				<Switch
					checked={on}
					aria-labelledby={`${ids}-label`}
					aria-describedby={`${ids}-note`}
					aria-disabled={!configured || toggle.isPending}
					aria-busy={toggle.isPending}
					onToggle={flip}
				/>
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
	const [announcement, setAnnouncement] = useState("");

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
		return (
			<FailureBanner
				failure={{ title: LOAD_FAILED, error: query.error }}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const { classification, classificationPresets } = query.data;
	return (
		<div className="max-w-xl space-y-8">
			<StatusCard settings={classification} />
			<ProviderCard
				key={classification.state}
				presets={classificationPresets}
				settings={classification}
				onAnnounce={setAnnouncement}
			/>
			<p aria-live="polite" className="text-sm text-fg-muted">
				{announcement}
			</p>
		</div>
	);
}
