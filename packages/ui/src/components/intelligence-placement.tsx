import { PlacementAction, PlacementConfidence } from "@remit/domain-enums";
import { Badge } from "./badge.js";

export interface PlacementIntel {
	action: (typeof PlacementAction)[keyof typeof PlacementAction];
	confidence: (typeof PlacementConfidence)[keyof typeof PlacementConfidence];
	/** The folder the message sat in when Remit judged it: inbox, junk or other. */
	fromPlacement: string;
	/** Reason codes as the server wrote them. */
	reasons: string[];
	dryRun: boolean;
}

const reasonCopy = new Map<string, string>(
	Object.entries({
		"sender=blocked": "You blocked this sender.",
		"sender=untrusted": "You have no history with this sender.",
		"classifier=spam": "The classifier judged it spam.",
		"dkim-mismatch": "It was signed by a different domain than its sender.",
		"dmarc=fail": "It failed the sender domain's DMARC check.",
		"dmarc=pass": "It passed the sender domain's DMARC check.",
		"deferred-to-llm": "The signals were left for the classifier to judge.",
		"no-confident-signal": "Nothing marked it as junk.",
		"placed-in-junk": "It was already reported or moved to Junk.",
		"already-moved-by-remit": "Remit had already moved it.",
		"body-unreadable": "Its body could not be read.",
	}),
);

function placementReasonCopy(code: string): string {
	return reasonCopy.get(code) ?? code;
}

function placementHeadline(placement: PlacementIntel): string {
	const fromJunk = placement.fromPlacement === "junk";
	if (placement.action === PlacementAction.MoveToJunk && fromJunk) {
		return "Remit kept this in Junk";
	}
	const verb = placement.dryRun ? "would move" : "moved";
	if (placement.action === PlacementAction.MoveToInbox) {
		return fromJunk
			? `Remit ${verb} this out of Junk`
			: `Remit ${verb} this to the Inbox`;
	}
	return `Remit ${verb} this to Junk`;
}

const confidenceLabel: Record<
	PlacementIntel["confidence"],
	{ label: string; tone: "positive" | "warning" }
> = {
	[PlacementConfidence.Confident]: { label: "Confident", tone: "positive" },
	[PlacementConfidence.Unsure]: { label: "Unsure", tone: "warning" },
};

export function Placement({ placement }: { placement: PlacementIntel }) {
	const confidence = confidenceLabel[placement.confidence];
	return (
		<div>
			<div className="flex items-center gap-2">
				<span className="text-xs text-fg">{placementHeadline(placement)}</span>
				<Badge tone={confidence.tone} dot className="ml-auto">
					{confidence.label}
				</Badge>
			</div>
			{placement.reasons.length > 0 && (
				<ul className="mt-2 list-disc space-y-0.5 pl-4 text-2xs text-fg-muted">
					{placement.reasons.map((code) => (
						<li key={code}>{placementReasonCopy(code)}</li>
					))}
				</ul>
			)}
		</div>
	);
}
