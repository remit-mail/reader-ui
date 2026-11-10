import type { RemitImapClassificationConfigured } from "@remit/api-http-client/types.gen.ts";
import { Button, Input } from "@remit/ui";
import { type Ref, useId, useState } from "react";
import { useSaveClassification } from "../../../hooks/useClassificationSettings";
import { parseDailyLimit } from "../../../lib/classification";
import { type ClassificationFailure, FailureBanner } from "./FailureBanner";
import { describedBy, Field } from "./ProviderCard";

export interface DailyLimitCardProps {
	settings: RemitImapClassificationConfigured;
	inputRef: Ref<HTMLInputElement>;
	onAnnounce: (text: string) => void;
}

export function DailyLimitCard({
	settings,
	inputRef,
	onAnnounce,
}: DailyLimitCardProps) {
	const save = useSaveClassification();
	const [value, setValue] = useState(() => `${settings.dailyLimit}`);
	const [error, setError] = useState<string | undefined>(undefined);
	const [failure, setFailure] = useState<ClassificationFailure | null>(null);
	const ids = useId();
	const inputId = `${ids}-limit`;

	const onSave = () => {
		if (save.isPending) return;
		const parsed = parseDailyLimit(value);
		if (!parsed.ok) {
			setError(parsed.message);
			return;
		}
		setFailure(null);
		save.mutate(
			{ body: { classificationDailyLimit: parsed.limit } },
			{
				onSuccess: () => onAnnounce("Saved"),
				onError: (cause) =>
					setFailure({ title: "The daily limit was not saved", error: cause }),
			},
		);
	};

	return (
		<section aria-labelledby={`${ids}-title`} className="space-y-4">
			<h2
				id={`${ids}-title`}
				className="text-xs font-semibold uppercase tracking-wider text-fg-subtle"
			>
				Daily limit
			</h2>
			<Field
				id={inputId}
				label="Calls per account per day"
				hint="Counts reset at 00:00 UTC. Past the limit, that account's new mail uses built-in rules."
				error={error}
			>
				<Input
					id={inputId}
					ref={inputRef}
					className="h-11"
					inputMode="numeric"
					value={value}
					autoComplete="off"
					aria-invalid={error !== undefined}
					aria-describedby={describedBy(inputId, true, error !== undefined)}
					onChange={(event) => {
						setValue(event.target.value);
						setError(undefined);
						onAnnounce("");
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") onSave();
					}}
				/>
			</Field>
			<Button
				variant="primary"
				className="min-h-11"
				aria-disabled={save.isPending}
				aria-busy={save.isPending}
				onClick={onSave}
			>
				{save.isPending ? "Saving…" : "Save limit"}
			</Button>
			{failure && <FailureBanner failure={failure} />}
		</section>
	);
}
