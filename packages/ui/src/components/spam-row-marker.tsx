import { LabelChip, type LabelChipData } from "./label-chip.js";
import type { SpamAction } from "./spam-contract.js";

export interface SpamRowMarkerProps {
	label: LabelChipData;
	action: Exclude<SpamAction, "None">;
}

/**
 * A thread row's one spam mark: the Remit label chip, then an outlined
 * Suspected marker when Remit only warned. A row Remit moved to Spam shows the
 * chip alone, because the folder already says it moved.
 */
export function SpamRowMarker({ label, action }: SpamRowMarkerProps) {
	const suspected = action === "Warn";
	return (
		<span className="inline-flex shrink-0 items-center gap-1">
			<span className="sr-only">
				{suspected ? `${label.name}, suspected` : label.name}
			</span>
			<span aria-hidden="true" className="inline-flex items-center gap-1">
				<LabelChip label={label} className="max-w-20" />
				{suspected && (
					<span className="rounded-full border border-warning/60 px-1.5 text-2xs font-medium leading-4 text-warning">
						Suspected
					</span>
				)}
			</span>
		</span>
	);
}
