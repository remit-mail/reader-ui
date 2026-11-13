import type { RemitImapRescanFailureCode } from "@remit/api-http-client/types.gen.ts";
import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { Button, ButtonLink } from "./button.js";
import { ProgressBar } from "./progress-bar.js";
import { CHECK_AGAIN_FAILURE_SENTENCES, formatSpamScore } from "./spam-copy.js";

export interface CheckAgainFailure {
	messageId: string;
	subject: string;
	code: RemitImapRescanFailureCode;
	retryable: boolean;
}

export interface CheckAgainSummary {
	nowSpam: number;
	nowSuspected: number;
	noLongerSuspected: number;
}

export type CheckAgainPanelProps =
	| { state: "Running"; checked: number; total: number; onStop: () => void }
	| {
			state: "Done";
			total: number;
			summary: CheckAgainSummary;
			onDone: () => void;
	  }
	| {
			state: "PartialFailure";
			checked: number;
			total: number;
			failures: CheckAgainFailure[];
			reportIssueHref: string;
			onRetry: () => void;
			onClose: () => void;
	  };

export function checkAgainSummarySentence(summary: CheckAgainSummary): string {
	const parts = [
		summary.nowSpam > 0 && `${summary.nowSpam} now reach Spam`,
		summary.nowSuspected > 0 &&
			`${summary.nowSuspected} ${summary.nowSuspected === 1 ? "is" : "are"} now suspected`,
		summary.noLongerSuspected > 0 &&
			`${summary.noLongerSuspected} ${summary.noLongerSuspected === 1 ? "is" : "are"} no longer suspected`,
	].filter((part): part is string => typeof part === "string");
	const changed =
		summary.nowSpam + summary.nowSuspected + summary.noLongerSuspected;
	const moved =
		summary.nowSpam > 0
			? "Nothing moved. Open a message to move it to Spam."
			: "Nothing moved.";
	if (changed === 0) return `Nothing changed. ${moved}`;
	return `${changed} changed: ${parts.join(", ")}. ${moved}`;
}

const onEscape =
	(action: () => void) => (event: KeyboardEvent<HTMLElement>) => {
		if (event.key !== "Escape") return;
		event.stopPropagation();
		action();
	};

function PanelFrame({
	children,
	onKeyDown,
}: {
	children: ReactNode;
	onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
	return (
		<section
			aria-label="Check again"
			onKeyDown={onKeyDown}
			className="w-full max-w-md space-y-3 rounded-lg border border-line bg-surface p-4 text-sm shadow-lg"
		>
			{children}
		</section>
	);
}

/**
 * Progress and outcome of Check again over a selection or one message. Remit
 * sends ten at a time; the run lives in memory and ends with the page.
 */
export function CheckAgainPanel(props: CheckAgainPanelProps) {
	const focusRef = useRef<HTMLButtonElement>(null);
	const { state } = props;

	// biome-ignore lint/correctness/useExhaustiveDependencies: focus moves once per state the panel enters
	useEffect(() => {
		focusRef.current?.focus();
	}, [state]);

	if (props.state === "Running") {
		return (
			<PanelFrame onKeyDown={onEscape(props.onStop)}>
				<p aria-live="polite" className="font-semibold text-fg tabular-nums">
					{`Checked ${props.checked} of ${props.total}`}
				</p>
				<ProgressBar value={props.checked} max={props.total} />
				<p className="text-fg-muted">
					Remit sends ten at a time and waits for each answer. Keep this page
					open until it finishes.
				</p>
				<Button
					ref={focusRef}
					variant="secondary"
					size="md"
					onClick={props.onStop}
				>
					Stop
				</Button>
			</PanelFrame>
		);
	}

	if (props.state === "Done") {
		return (
			<PanelFrame onKeyDown={onEscape(props.onDone)}>
				<p aria-live="polite" className="font-semibold text-fg tabular-nums">
					{`Checked ${props.total} of ${props.total}`}
				</p>
				<ProgressBar value={props.total} max={props.total} tone="success" />
				<p className="text-fg-muted">
					{checkAgainSummarySentence(props.summary)}
				</p>
				<Button
					ref={focusRef}
					variant="primary"
					size="md"
					onClick={props.onDone}
				>
					Done
				</Button>
			</PanelFrame>
		);
	}

	const retryable = props.failures.filter(
		(failure) => failure.retryable,
	).length;

	return (
		<PanelFrame onKeyDown={onEscape(props.onClose)}>
			<p aria-live="polite" className="font-semibold text-fg tabular-nums">
				{`Checked ${props.checked} of ${props.total}. ${props.failures.length} couldn't be checked.`}
			</p>
			<ProgressBar value={props.checked} max={props.total} tone="warning" />
			<ul className="list-disc space-y-1 pl-4 text-fg-muted marker:text-fg-subtle">
				{props.failures.map((failure) => (
					<li key={failure.messageId}>
						<span className="text-fg">{failure.subject}</span>:{" "}
						{CHECK_AGAIN_FAILURE_SENTENCES[failure.code]}
					</li>
				))}
			</ul>
			<div className="flex flex-wrap items-center gap-2">
				{retryable > 0 && (
					<Button
						ref={focusRef}
						variant="primary"
						size="md"
						onClick={props.onRetry}
					>
						{`Try again for ${retryable}`}
					</Button>
				)}
				<ButtonLink
					variant="ghost"
					size="md"
					href={props.reportIssueHref}
					external
				>
					Report an issue
				</ButtonLink>
				<Button
					ref={retryable > 0 ? undefined : focusRef}
					variant="secondary"
					size="md"
					onClick={props.onClose}
				>
					Close
				</Button>
			</div>
		</PanelFrame>
	);
}

export type CheckAgainOutcome =
	| "NowSpam"
	| "NowSuspected"
	| "NowClean"
	| "Unchanged";

const OUTCOME_LABELS: Record<CheckAgainOutcome, string> = {
	NowSpam: "Now: Spam",
	NowSuspected: "Now: suspected",
	NowClean: "Now: clean",
	Unchanged: "Unchanged",
};

/** The dashed tag a row carries once its Check again batch lands. */
export function CheckAgainResultTag({
	outcome,
	score,
}: {
	outcome: CheckAgainOutcome;
	score: number;
}) {
	return (
		<span className="inline-flex shrink-0 items-center rounded border border-dashed border-line-strong px-1.5 text-2xs font-medium leading-4 text-fg-muted tabular-nums">
			{`${OUTCOME_LABELS[outcome]} ${formatSpamScore(score)}`}
		</span>
	);
}
