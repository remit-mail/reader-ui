import type { LabelChipData } from "./label-chip.js";
import type { SpamReason } from "./spam-contract.js";

/**
 * Shapes the spam UI needs that reader's API does not carry yet. Each names
 * the PRD 041 RFC gap, or the reader issue, that will supply it; the shape
 * moves to `spam-contract.ts` when the API publishes it.
 */

/** RFC gap 3: a reason naming a skipped model call and its cause. */
export type SpamModelSkip = "DailyLimit" | "NoModel";

/** RFC gap 3: the model's reason as text. */
export type SpamModelSaid = string;

/** RFC gap 6: "Warn only" per kind. */
export type LabelSpamMode = "WarnOnly" | "MoveToSpam";

/** RFC gap 7: the per-user thresholds. */
export interface SpamThresholds {
	warn: number;
	junk: number;
}

/** RFC gap 8: spam verdicts per day, by action, plus Not spam counts. */
export interface SpamDay {
	date: string;
	moved: number;
	warned: number;
	markedNotSpam: number;
}

/** RFC gap 8: the last 30 days, per kind. */
export interface SpamOverview {
	checkedAny: boolean;
	moved: number;
	warned: number;
	markedNotSpam: number;
	spam: SpamDay[];
	phishing: SpamDay[];
}

/** RFC gap 9: recent scores counted against a draft and the saved thresholds. */
export interface SpamPreviewCounts {
	warns: number;
	moves: number;
}

export type SpamThresholdPreview =
	| { status: "Idle" }
	| { status: "Ready"; draft: SpamPreviewCounts; saved: SpamPreviewCounts }
	| { status: "Failed" };

/** RFC gap 10: the latest flagged mail across the Spam and Phishing labels. */
export interface SpamFlaggedMessage {
	messageId: string;
	senderName: string;
	subject: string;
	reasons: SpamReason[];
	date: string;
	label: LabelChipData;
	action: "Warn" | "Junk";
	href: string;
}

export interface SpamLatestFlagged {
	messages: SpamFlaggedMessage[];
	reviewSpamHref: string;
	openPhishingHref: string;
}

/** reader#1645: why a Check again (rescan) gave no verdict for a message. */
export type CheckAgainFailureCause =
	| "RateLimited"
	| "DailyCap"
	| "NotFound"
	| "NotPermitted";
