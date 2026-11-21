import {
	FromPlacement,
	PlacementAction,
	PlacementConfidence,
	PlacementReason,
} from "@remit/domain-enums";
import { Badge } from "./badge.js";

type PlacementReasonCode =
	(typeof PlacementReason)[keyof typeof PlacementReason];

export interface PlacementIntel {
	action: (typeof PlacementAction)[keyof typeof PlacementAction];
	confidence: (typeof PlacementConfidence)[keyof typeof PlacementConfidence];
	/** The folder the message sat in when Remit judged it. */
	fromPlacement: (typeof FromPlacement)[keyof typeof FromPlacement];
	reasons: PlacementReasonCode[];
	dryRun: boolean;
}

const reasonCopy: Record<PlacementReasonCode, string> = {
	[PlacementReason.SenderBlocked]: "You blocked this sender.",
	[PlacementReason.SenderUntrusted]: "You have no history with this sender.",
	[PlacementReason.SenderNeverSpam]: "You marked this sender as never spam.",
	[PlacementReason.SenderVip]: "This sender is a VIP.",
	[PlacementReason.SenderWellknown]: "You know this sender well.",
	[PlacementReason.ClassifierSpam]: "The classifier judged it spam.",
	[PlacementReason.SpamClean]: "The spam check judged it clean.",
	[PlacementReason.ProviderSpam]: "Your mail provider filed it as spam.",
	[PlacementReason.DkimMismatch]:
		"It was signed by a different domain than its sender.",
	[PlacementReason.DmarcFail]: "It failed the sender domain's DMARC check.",
	[PlacementReason.DmarcPass]: "It passed the sender domain's DMARC check.",
	[PlacementReason.DeferredToLlm]:
		"The signals were left for the classifier to judge.",
	[PlacementReason.MissingSignals]: "It lacked the signals a verdict needs.",
	[PlacementReason.NoConfidentSignal]: "Nothing marked it as junk.",
	[PlacementReason.PlacedInJunk]: "It was already reported or moved to Junk.",
	[PlacementReason.AlreadyMovedByRemit]: "Remit had already moved it.",
	[PlacementReason.BodyUnreadable]: "Its body could not be read.",
	[PlacementReason.JunkNotRescued]:
		"Nothing gave a reason to bring it out of Junk.",
};

/** A server newer than this build can send a reason it has no label for yet. */
const reasonLabel = (code: PlacementReasonCode): string =>
	reasonCopy[code] ?? code;

function placementHeadline(placement: PlacementIntel): string {
	const fromJunk = placement.fromPlacement === FromPlacement.Junk;
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
						<li key={code}>{reasonLabel(code)}</li>
					))}
				</ul>
			)}
		</div>
	);
}
