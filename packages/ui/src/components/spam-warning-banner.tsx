import type { ReactNode } from "react";
import { CircleQuestionMark, ShieldAlert, TriangleAlert } from "../icons.js";
import { cn } from "../lib/cn.js";
import { Banner, type BannerTone } from "./banner.js";
import { Button } from "./button.js";
import type { CheckAgainFailureCause } from "./check-again-panel.js";
import type { SpamChecked, SpamFailed } from "./spam-contract.js";
import {
	formatSpamScore,
	SPAM_FAILURE_SENTENCES,
	SPAM_WARN_HEADLINES,
	topSpamReasonSentence,
} from "./spam-copy.js";

export type SpamModelSkip = "DailyLimit" | "NoModel";

export type SpamWarningPending = "NotSpam" | "Report" | "Move";

interface SpamWarnState {
	state: "Warn";
	verdict: SpamChecked;
	modelSkip?: SpamModelSkip;
	pending?: Exclude<SpamWarningPending, "Move">;
	onNotSpam: () => void;
	onReport: () => void;
	onWhy: () => void;
}

interface SpamNowJunkState {
	state: "NowJunk";
	verdict: SpamChecked;
	junkFrom: number;
	pending?: Exclude<SpamWarningPending, "Report">;
	onMove: () => void;
	onNotSpam: () => void;
	onWhy: () => void;
}

interface SpamCheckFailedState {
	state: "Failed";
	verdict: SpamFailed;
	checking?: boolean;
	recheckFailure?: CheckAgainFailureCause;
	onCheckAgain: () => void;
}

export type SpamWarningBannerProps =
	| SpamWarnState
	| SpamNowJunkState
	| SpamCheckFailedState;

const MODEL_SKIP_SENTENCES: Record<SpamModelSkip, string> = {
	DailyLimit:
		"Only the basic checks ran: this account reached its daily model limit.",
	NoModel: "Only the basic checks ran: this account has no model set up.",
};

const RECHECK_FAILURE_SENTENCES: Record<CheckAgainFailureCause, string> = {
	RateLimited: "Check again was turned away. Try again in a minute.",
	DailyCap: "Check again reached the daily model limit. Try again tomorrow.",
	NotFound: "Check again failed: the message is gone from the server.",
	NotPermitted:
		"Check again failed: the server refused access to this message.",
};

const PENDING_LABELS: Record<SpamWarningPending, string> = {
	NotSpam: "Removing label...",
	Report: "Reporting...",
	Move: "Moving...",
};

const ACTION_BUTTON = "h-10 flex-1 sm:flex-none";

function BannerAction({
	label,
	pending,
	busy,
	onClick,
	variant = "secondary",
}: {
	label: string;
	pending: SpamWarningPending | undefined;
	busy: SpamWarningPending | null;
	onClick: () => void;
	variant?: "primary" | "secondary" | "ghost";
}) {
	const pressed = pending !== undefined && pending === busy;
	const blocked = pending !== undefined;
	return (
		<Button
			variant={variant}
			size="md"
			className={cn(ACTION_BUTTON, blocked && "pointer-events-none opacity-60")}
			aria-disabled={blocked || undefined}
			aria-busy={pressed || undefined}
			onClick={blocked ? undefined : onClick}
		>
			{pressed && pending ? PENDING_LABELS[pending] : label}
		</Button>
	);
}

function BannerBody({
	tone,
	icon,
	headline,
	lines,
	actions,
	role,
}: {
	tone: BannerTone;
	icon: ReactNode;
	headline: string;
	lines: string[];
	actions: ReactNode;
	role: "alert" | "status";
}) {
	return (
		<Banner
			tone={tone}
			variant="soft"
			role={role}
			className="rounded-none border-b border-line px-5 py-3"
		>
			<div className="flex items-start gap-2">
				<span className="mt-0.5 shrink-0" aria-hidden="true">
					{icon}
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-fg">{headline}</p>
					{lines.map((line) => (
						<p key={line} className="mt-0.5 text-fg-muted">
							{line}
						</p>
					))}
					<div className="mt-2 flex gap-2">{actions}</div>
				</div>
			</div>
		</Banner>
	);
}

/**
 * The message view's one banner slot, between the header and the body: what
 * the spam check concluded, its top reason, and what the reader can do about
 * it. It has no close control; it goes when its verdict goes.
 */
export function SpamWarningBanner(props: SpamWarningBannerProps) {
	if (props.state === "Failed") {
		const failure = props.recheckFailure;
		return (
			<BannerBody
				tone="info"
				role="status"
				icon={<CircleQuestionMark className="size-4 text-accent-2" />}
				headline="Remit couldn't check this message"
				lines={[
					`The spam check failed: ${SPAM_FAILURE_SENTENCES[props.verdict.kind]}. No label was added.`,
					...(failure ? [RECHECK_FAILURE_SENTENCES[failure]] : []),
				]}
				actions={
					<Button
						variant="secondary"
						size="md"
						className={ACTION_BUTTON}
						disabled={failure === "DailyCap"}
						aria-busy={props.checking || undefined}
						onClick={props.checking ? undefined : props.onCheckAgain}
					>
						{props.checking ? "Checking..." : "Check again"}
					</Button>
				}
			/>
		);
	}

	const { verdict } = props;
	const phishing = verdict.kind === "Phishing";
	const tone: BannerTone = phishing ? "danger" : "warning";
	const role = phishing ? "alert" : "status";
	const icon = phishing ? (
		<ShieldAlert className="size-4 text-danger" />
	) : (
		<TriangleAlert className="size-4 text-warning" />
	);

	if (props.state === "NowJunk") {
		return (
			<BannerBody
				tone={tone}
				role={role}
				icon={icon}
				headline={
					phishing
						? "Remit now judges this phishing"
						: "Remit now judges this spam"
				}
				lines={[
					`Check again scored it ${formatSpamScore(verdict.score)}, above Move to Spam from ${formatSpamScore(props.junkFrom)}. It stays here until you move it.`,
				]}
				actions={
					<>
						<BannerAction
							label="Move to Spam"
							variant="primary"
							pending={props.pending}
							busy="Move"
							onClick={props.onMove}
						/>
						<BannerAction
							label="Not spam"
							pending={props.pending}
							busy="NotSpam"
							onClick={props.onNotSpam}
						/>
						<Button
							variant="ghost"
							size="md"
							className={ACTION_BUTTON}
							onClick={props.onWhy}
						>
							Why
						</Button>
					</>
				}
			/>
		);
	}

	return (
		<BannerBody
			tone={tone}
			role={role}
			icon={icon}
			headline={SPAM_WARN_HEADLINES[verdict.kind]}
			lines={[
				topSpamReasonSentence(verdict.reasons),
				...(props.modelSkip ? [MODEL_SKIP_SENTENCES[props.modelSkip]] : []),
			]}
			actions={
				<>
					<BannerAction
						label="Not spam"
						pending={props.pending}
						busy="NotSpam"
						onClick={props.onNotSpam}
					/>
					<BannerAction
						label="Report spam"
						pending={props.pending}
						busy="Report"
						onClick={props.onReport}
					/>
					<Button
						variant="ghost"
						size="md"
						className={ACTION_BUTTON}
						onClick={props.onWhy}
					>
						Why
					</Button>
				</>
			}
		/>
	);
}
