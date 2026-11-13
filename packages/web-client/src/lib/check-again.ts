import type {
	RemitImapMessageSpamVerdict,
	RemitImapRescanFailureCode,
	RemitImapRescanResult,
} from "@remit/api-http-client/types.gen.ts";
import type {
	CheckAgainFailure,
	CheckAgainSummary,
	ThreadRowSpam,
} from "@remit/ui";

/** The most message ids one rescan call accepts. */
export const RESCAN_BATCH_SIZE = 10;

export interface CheckAgainTarget {
	messageId: string;
	accountId: string;
	mailboxId: string;
	threadId: string | undefined;
	subject: string;
	/** The row's spam mark before the check, to say what changed. */
	before: ThreadRowSpam | undefined;
}

export interface RescanBatch {
	accountId: string;
	targets: CheckAgainTarget[];
}

/**
 * The calls a run makes: rescan is per account and takes ten ids, so the
 * selection splits by account first, then into tens, keeping its order.
 */
export const rescanBatches = (
	targets: readonly CheckAgainTarget[],
): RescanBatch[] => {
	const byAccount = new Map<string, CheckAgainTarget[]>();
	for (const target of targets) {
		const group = byAccount.get(target.accountId) ?? [];
		group.push(target);
		byAccount.set(target.accountId, group);
	}
	const batches: RescanBatch[] = [];
	for (const [accountId, group] of byAccount) {
		for (let start = 0; start < group.length; start += RESCAN_BATCH_SIZE) {
			batches.push({
				accountId,
				targets: group.slice(start, start + RESCAN_BATCH_SIZE),
			});
		}
	}
	return batches;
};

export const EMPTY_SUMMARY: CheckAgainSummary = {
	nowSpam: 0,
	nowSuspected: 0,
	noLongerSuspected: 0,
};

const flaggedAction = (
	verdict: RemitImapMessageSpamVerdict,
): "Warn" | "Junk" | undefined =>
	verdict.state === "Checked" && verdict.action !== "None"
		? verdict.action
		: undefined;

/** Adds one checked message to the run's summary of what changed. */
export const tallyOutcome = (
	summary: CheckAgainSummary,
	before: ThreadRowSpam | undefined,
	after: RemitImapMessageSpamVerdict,
): CheckAgainSummary => {
	const now = flaggedAction(after);
	if (now === before?.action) return summary;
	if (now === "Junk") return { ...summary, nowSpam: summary.nowSpam + 1 };
	if (now === "Warn")
		return { ...summary, nowSuspected: summary.nowSuspected + 1 };
	return { ...summary, noLongerSuspected: summary.noLongerSuspected + 1 };
};

export interface BatchOutcome {
	summary: CheckAgainSummary;
	failures: CheckAgainFailure[];
	verdicts: Map<string, RemitImapMessageSpamVerdict>;
}

/** Folds one rescan answer into the run: what changed, and what failed why. */
export const applyRescanResult = (
	outcome: BatchOutcome,
	batch: RescanBatch,
	result: RemitImapRescanResult,
): BatchOutcome => {
	const byId = new Map(batch.targets.map((t) => [t.messageId, t]));
	let summary = outcome.summary;
	const verdicts = new Map(outcome.verdicts);
	for (const success of result.successful) {
		summary = tallyOutcome(
			summary,
			byId.get(success.messageId)?.before,
			success.verdict,
		);
		verdicts.set(success.messageId, success.verdict);
	}
	const failures = [
		...outcome.failures,
		...result.failed.map((failure) => ({
			messageId: failure.messageId,
			subject: byId.get(failure.messageId)?.subject ?? "(No subject)",
			code: failure.code,
			retryable: failure.retryable,
		})),
	];
	return { summary, failures, verdicts };
};

/** A refusal of the whole call, read as the same refusal for every id in it. */
export const refusedBatch = (
	batch: RescanBatch,
	code: Extract<RemitImapRescanFailureCode, "NotFound" | "NotPermitted">,
): RemitImapRescanResult => ({
	successful: [],
	failed: batch.targets.map((target) => ({
		messageId: target.messageId,
		code,
		retryable: false,
	})),
});
