import { LabelChip, type LabelChipData } from "./label-chip.js";

export interface SpamRowMarkerProps {
	label: LabelChipData;
	/** The message still sits where it arrived, under the warning. */
	suspected: boolean;
}

/**
 * A thread row's one spam mark: the Remit label chip, then an outlined
 * Suspected marker while the message sits outside Spam. A row in Spam shows
 * the chip alone, because the folder already says it moved.
 */
export function SpamRowMarker({ label, suspected }: SpamRowMarkerProps) {
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
