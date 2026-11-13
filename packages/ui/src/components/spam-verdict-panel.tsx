import type {
	RemitImapSpamChecked,
	RemitImapSpamFailed,
	RemitImapSpamLabelPlacement,
	RemitImapSpamReason,
	RemitImapSpamThresholds,
	RemitImapSpamThresholdsSet,
	RemitImapSpamVerdictScreenedOut,
} from "@remit/api-http-client/types.gen.ts";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn.js";
import { Button } from "./button.js";
import { IntelligenceSection } from "./intelligence-section.js";
import type { LabelChipData } from "./label-chip.js";
import {
	BASIC_CHECKS_ONLY,
	CHECK_FAILED_HEADLINE,
	filterScreenSentence,
	formatSpamScore,
	isModelReason,
	modelSaid,
	modelSkipCause,
	SPAM_FAILURE_SENTENCES,
	SPAM_SCREEN_SENTENCES,
	SPAM_WARN_HEADLINES,
	spamReasonSentence,
	spamScoreSentence,
	UNKNOWN_REASON_SENTENCE,
} from "./spam-copy.js";
import { SpamRowMarker } from "./spam-row-marker.js";

export const SPAM_CHECK_HEADING_ID = "spam-check-heading";

/** Where a link in the Spam check section goes; the host maps it to a route. */
export type SpamVerdictLinkTarget =
	| { kind: "SpamSettings" }
	| { kind: "NeverInSpamSenders" }
	| { kind: "Filter"; filterId: string };

export interface SpamVerdictLinkProps {
	target: SpamVerdictLinkTarget;
	className: string;
	children: ReactNode;
}

/** Renders an in-app link, so following it is a navigation, not a reload. */
export type SpamVerdictLinkComponent = (
	props: SpamVerdictLinkProps,
) => ReactElement;

export interface SpamVerdictPanelProps {
	verdict:
		| RemitImapSpamChecked
		| RemitImapSpamFailed
		| RemitImapSpamVerdictScreenedOut;
	/** The Remit label the message carries, when it carries one. */
	label?: LabelChipData;
	thresholds: RemitImapSpamThresholds;
	placement: RemitImapSpamLabelPlacement;
	filterName?: string;
	linkComponent: SpamVerdictLinkComponent;
	reportIssueHref: (symbol: string) => string;
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
	thresholds: RemitImapSpamThresholdsSet;
}) {
	const at = (value: number) => `${Math.min(100, Math.max(0, value * 100))}%`;
	return (
		<div aria-hidden="true" className="pt-4 pb-1">
			<div className="relative h-1.5 rounded-full bg-surface-sunken">
				<div
					className="absolute inset-y-0 rounded-r-full bg-warning/30"
					style={{ left: at(thresholds.cleanBelow), right: 0 }}
				/>
				<div
					className="absolute inset-y-0 rounded-r-full bg-danger/30"
					style={{ left: at(thresholds.spamAt), right: 0 }}
				/>
				{[
					{ key: "warn", value: thresholds.cleanBelow, text: "Warn" },
					{ key: "junk", value: thresholds.spamAt, text: "Spam" },
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
	reason: RemitImapSpamReason;
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
	placement,
	linkComponent: Link,
	reportIssueHref,
}: Omit<SpamVerdictPanelProps, "verdict" | "onNotSpam" | "filterName"> & {
	verdict: RemitImapSpamChecked;
}) {
	const said = modelSaid(verdict);
	const skipped = modelSkipCause(verdict);
	const headline =
		verdict.action === "Junk"
			? "Remit moved this to Spam"
			: verdict.action === "Warn"
				? SPAM_WARN_HEADLINES[verdict.kind]
				: "Remit found too little to act on";
	const keptByWarnOnly =
		verdict.action !== "None" &&
		placement === "WarnOnly" &&
		thresholds.state === "Set" &&
		verdict.score >= thresholds.spamAt;

	return (
		<Section>
			<Headline>{headline}</Headline>
			{label && verdict.action !== "None" && (
				<SpamRowMarker label={label} suspected={verdict.action === "Warn"} />
			)}
			<p className="text-fg-muted">
				{spamScoreSentence(verdict.score, thresholds)}
			</p>
			{thresholds.state === "Set" && (
				<ScoreBar score={verdict.score} thresholds={thresholds} />
			)}
			<div>
				<h4 className="text-xs font-semibold text-fg">Why</h4>
				<ul className="mt-1 list-disc space-y-1.5 pl-4 marker:text-fg-subtle">
					{verdict.reasons
						.filter((reason) => !isModelReason(reason))
						.map((reason) => (
							<ReasonItem
								key={reason.symbol}
								reason={reason}
								reportIssueHref={reportIssueHref}
							/>
						))}
				</ul>
			</div>
			{said !== undefined && (
				<div className="text-fg-muted">
					<p>Remit asked the model. It said:</p>
					<blockquote className="mt-0.5 border-l-2 border-line pl-2 italic">
						{said}
					</blockquote>
				</div>
			)}
			{skipped !== undefined && (
				<p className="text-fg-muted">{`${BASIC_CHECKS_ONLY}: ${skipped}`}</p>
			)}
			{keptByWarnOnly && (
				<p className="text-fg-muted">
					The score reached your Spam threshold. Spam is set to Warn only, so it
					stays here.{" "}
					<Link target={{ kind: "SpamSettings" }} className={LINK}>
						Change in Spam &amp; phishing settings
					</Link>
				</p>
			)}
		</Section>
	);
}

function ScreenedOutVerdict({
	verdict,
	label,
	filterName,
	linkComponent: Link,
	onNotSpam,
}: Pick<
	SpamVerdictPanelProps,
	"label" | "filterName" | "linkComponent" | "onNotSpam"
> & { verdict: RemitImapSpamVerdictScreenedOut }) {
	const { screen } = verdict;

	if (screen.rule === "ReportedSender") {
		return (
			<Section>
				<Headline>You reported this sender</Headline>
				{label && <SpamRowMarker label={label} suspected={false} />}
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
				<Link
					target={{ kind: "Filter", filterId: screen.filterId }}
					className={LINK}
				>
					Open the filter in Settings
				</Link>
			</Section>
		);
	}

	return (
		<Section>
			<Headline>Remit skipped the spam check</Headline>
			<p className="text-fg-muted">{SPAM_SCREEN_SENTENCES[screen.rule]}</p>
			{screen.rule === "NeverSpam" && (
				<Link target={{ kind: "NeverInSpamSenders" }} className={LINK}>
					Manage in Senders &amp; Rules
				</Link>
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
