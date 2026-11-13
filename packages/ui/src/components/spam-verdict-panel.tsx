import type { ReactNode } from "react";
import { cn } from "../lib/cn.js";
import { Button } from "./button.js";
import { IntelligenceSection } from "./intelligence-section.js";
import type { LabelChipData } from "./label-chip.js";
import type {
	SpamChecked,
	SpamFailed,
	SpamReason,
	SpamVerdictScreenedOut,
} from "./spam-contract.js";
import {
	BASIC_CHECKS_ONLY,
	CHECK_FAILED_HEADLINE,
	filterScreenSentence,
	formatSpamScore,
	SPAM_FAILURE_SENTENCES,
	SPAM_SCREEN_SENTENCES,
	SPAM_WARN_HEADLINES,
	spamReasonSentence,
	spamScoreSentence,
	UNKNOWN_REASON_SENTENCE,
} from "./spam-copy.js";
import type {
	LabelSpamMode,
	SpamModelSaid,
	SpamThresholds,
} from "./spam-proposed.js";
import { SpamRowMarker } from "./spam-row-marker.js";

export const SPAM_CHECK_HEADING_ID = "spam-check-heading";

export interface SpamVerdictPanelLinks {
	spamSettingsHref: string;
	sendersHref: string;
	filterHref: (filterId: string) => string;
	reportIssueHref: (symbol: string) => string;
}

export interface SpamVerdictPanelProps {
	verdict: SpamChecked | SpamFailed | SpamVerdictScreenedOut;
	label: LabelChipData;
	thresholds: SpamThresholds;
	labelMode: LabelSpamMode;
	modelSaid?: SpamModelSaid;
	filterName?: string;
	links: SpamVerdictPanelLinks;
	onNotSpam: () => void;
}

const LINK = "text-accent-2 hover:underline";

function Section({ children }: { children: ReactNode }) {
	return (
		<IntelligenceSection label="Spam check" headingId={SPAM_CHECK_HEADING_ID}>
			<div className="space-y-2 text-sm">{children}</div>
		</IntelligenceSection>
	);
}

function Headline({ children }: { children: string }) {
	return <p className="font-semibold text-fg">{children}</p>;
}

function ScoreBar({
	score,
	thresholds,
}: {
	score: number;
	thresholds: SpamThresholds;
}) {
	const at = (value: number) => `${Math.min(100, Math.max(0, value * 100))}%`;
	return (
		<div aria-hidden="true" className="pt-4 pb-1">
			<div className="relative h-1.5 rounded-full bg-surface-sunken">
				<div
					className="absolute inset-y-0 rounded-r-full bg-warning/30"
					style={{ left: at(thresholds.warn), right: 0 }}
				/>
				<div
					className="absolute inset-y-0 rounded-r-full bg-danger/30"
					style={{ left: at(thresholds.junk), right: 0 }}
				/>
				{[
					{ key: "warn", value: thresholds.warn, text: "Warn" },
					{ key: "junk", value: thresholds.junk, text: "Spam" },
				].map((mark) => (
					<span
						key={mark.key}
						className="absolute -top-4 -translate-x-1/2 text-2xs text-fg-subtle tabular-nums"
						style={{ left: at(mark.value) }}
					>
						{`${mark.text} ${formatSpamScore(mark.value)}`}
					</span>
				))}
				<span
					className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-fg"
					style={{ left: at(score) }}
				/>
			</div>
			<div className="mt-1 flex justify-between text-2xs text-fg-subtle tabular-nums">
				<span>0</span>
				<span>1</span>
			</div>
		</div>
	);
}

function Finding({ text }: { text: string }) {
	return (
		<code className="mt-0.5 inline-block max-w-full break-all rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-2xs text-fg-muted">
			{text}
		</code>
	);
}

function ReasonItem({
	reason,
	reportIssueHref,
}: {
	reason: SpamReason;
	reportIssueHref: (symbol: string) => string;
}) {
	const sentence = spamReasonSentence(reason.name);
	if (!sentence) {
		return (
			<li>
				<p className="text-fg">{UNKNOWN_REASON_SENTENCE}</p>
				<Finding text={reason.symbol} />
				<a
					href={reportIssueHref(reason.symbol)}
					target="_blank"
					rel="noopener noreferrer"
					className={cn("ml-2 text-xs", LINK)}
				>
					Report an issue
				</a>
			</li>
		);
	}
	return (
		<li>
			<p className="text-fg">{sentence}</p>
			{reason.options.length > 0 && (
				<Finding text={reason.options.join(", ")} />
			)}
		</li>
	);
}

function CheckedVerdict({
	verdict,
	label,
	thresholds,
	labelMode,
	modelSaid,
	links,
}: Omit<SpamVerdictPanelProps, "verdict" | "onNotSpam" | "filterName"> & {
	verdict: SpamChecked;
}) {
	const headline =
		verdict.action === "Junk"
			? "Remit moved this to Spam"
			: verdict.action === "Warn"
				? SPAM_WARN_HEADLINES[verdict.kind]
				: "Remit found too little to act on";
	const keptByWarnOnly =
		verdict.action === "Warn" &&
		labelMode === "WarnOnly" &&
		verdict.score >= thresholds.junk;

	return (
		<Section>
			<Headline>{headline}</Headline>
			{verdict.action !== "None" && (
				<SpamRowMarker label={label} action={verdict.action} />
			)}
			<p className="text-fg-muted">
				{spamScoreSentence(verdict.score, thresholds)}
			</p>
			<ScoreBar score={verdict.score} thresholds={thresholds} />
			<div>
				<h4 className="text-xs font-semibold text-fg">Why</h4>
				<ul className="mt-1 list-disc space-y-1.5 pl-4 marker:text-fg-subtle">
					{verdict.reasons.map((reason) => (
						<ReasonItem
							key={reason.symbol}
							reason={reason}
							reportIssueHref={links.reportIssueHref}
						/>
					))}
				</ul>
			</div>
			{verdict.modelCalled ? (
				modelSaid !== undefined && (
					<div className="text-fg-muted">
						<p>Remit asked the model. It said:</p>
						<blockquote className="mt-0.5 border-l-2 border-line pl-2 italic">
							{modelSaid}
						</blockquote>
					</div>
				)
			) : (
				<p className="text-fg-muted">{`${BASIC_CHECKS_ONLY}.`}</p>
			)}
			{keptByWarnOnly && (
				<p className="text-fg-muted">
					The score reached your Spam threshold. Spam is set to Warn only, so it
					stays here.{" "}
					<a href={links.spamSettingsHref} className={LINK}>
						Change in Spam &amp; phishing settings
					</a>
				</p>
			)}
		</Section>
	);
}

function ScreenedOutVerdict({
	verdict,
	label,
	filterName,
	links,
	onNotSpam,
}: Pick<
	SpamVerdictPanelProps,
	"label" | "filterName" | "links" | "onNotSpam"
> & { verdict: SpamVerdictScreenedOut }) {
	const { screen } = verdict;

	if (screen.rule === "ReportedSender") {
		return (
			<Section>
				<Headline>You reported this sender</Headline>
				<SpamRowMarker label={label} action="Junk" />
				<p className="text-fg-muted">
					Remit sent their mail to Spam without checking it.
				</p>
				<Button variant="secondary" size="md" onClick={onNotSpam}>
					Not spam
				</Button>
			</Section>
		);
	}

	if (screen.rule === "Filter") {
		return (
			<Section>
				<Headline>Remit skipped the spam check</Headline>
				<p className="text-fg-muted">
					{filterName
						? filterScreenSentence(filterName)
						: "One of your filters matched it."}
				</p>
				<a href={links.filterHref(screen.filterId)} className={LINK}>
					Open the filter in Settings
				</a>
			</Section>
		);
	}

	return (
		<Section>
			<Headline>Remit skipped the spam check</Headline>
			<p className="text-fg-muted">{SPAM_SCREEN_SENTENCES[screen.rule]}</p>
			{screen.rule === "NeverSpam" && (
				<a href={links.sendersHref} className={LINK}>
					Manage in Senders &amp; Rules
				</a>
			)}
		</Section>
	);
}

/**
 * The intelligence rail's Spam check section: what the check concluded, the
 * score against the thresholds, and one sentence per reason. Why on the
 * banner focuses its heading by {@link SPAM_CHECK_HEADING_ID}.
 */
export function SpamVerdictPanel(props: SpamVerdictPanelProps) {
	const { verdict } = props;
	if (verdict.state === "ScreenedOut") {
		return <ScreenedOutVerdict {...props} verdict={verdict} />;
	}
	if (verdict.state === "Failed") {
		return (
			<Section>
				<Headline>{CHECK_FAILED_HEADLINE}</Headline>
				<p className="text-fg-muted">
					{`The spam check failed: ${SPAM_FAILURE_SENTENCES[verdict.kind]}.`}
				</p>
			</Section>
		);
	}
	return <CheckedVerdict {...props} verdict={verdict} />;
}
