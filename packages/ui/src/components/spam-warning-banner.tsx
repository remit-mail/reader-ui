import type {
	RemitImapRescanFailureCode,
	RemitImapSpamChecked,
	RemitImapSpamFailed,
} from "@remit/api-http-client/types.gen.ts";
import type { ReactNode } from "react";
import { CircleQuestionMark, ShieldAlert, TriangleAlert } from "../icons.js";
import { cn } from "../lib/cn.js";
import { Banner, type BannerTone } from "./banner.js";
import { Button } from "./button.js";
import {
	BASIC_CHECKS_ONLY,
	CHECK_AGAIN_FAILURE_SENTENCES,
	CHECK_FAILED_HEADLINE,
	formatSpamScore,
	modelSkipCause,
	SPAM_FAILURE_SENTENCES,
	SPAM_WARN_HEADLINES,
	topSpamReasonSentence,
} from "./spam-copy.js";

export type SpamWarningPending = "NotSpam" | "Report" | "Move" | "CheckAgain";

export interface SpamWarningBannerProps {
	verdict: RemitImapSpamChecked | RemitImapSpamFailed;
	inSpamFolder: boolean;
	pending?: SpamWarningPending;
	checkAgainFailure?: RemitImapRescanFailureCode;
	onNotSpam: () => void;
	onReport: () => void;
	onMove: () => void;
	onWhy: () => void;
	onCheckAgain: () => void;
}

const PENDING_LABELS: Record<SpamWarningPending, string> = {
	NotSpam: "Removing label...",
	Report: "Reporting...",
	Move: "Moving...",
	CheckAgain: "Checking...",
};

const ACTION_BUTTON = "h-10";

function BannerAction({
	label,
	pending,
	busy,
	onClick,
	variant = "secondary",
	disabled = false,
}: {
	label: string;
	pending: SpamWarningPending | undefined;
	busy: SpamWarningPending;
	onClick: () => void;
	variant?: "primary" | "secondary";
	disabled?: boolean;
}) {
	const pressed = pending === busy;
	const blocked = pending !== undefined || disabled;
	return (
		<Button
			variant={variant}
			size="md"
			className={cn(ACTION_BUTTON, blocked && "pointer-events-none opacity-60")}
			aria-disabled={blocked || undefined}
			aria-busy={pressed || undefined}
			onClick={blocked ? undefined : onClick}
		>
			{pressed ? PENDING_LABELS[busy] : label}
		</Button>
	);
}

function WhyButton({ onWhy }: { onWhy: () => void }) {
	return (
		<Button variant="ghost" size="md" className={ACTION_BUTTON} onClick={onWhy}>
			Why
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
					<div className="mt-2 flex flex-wrap gap-2">{actions}</div>
				</div>
			</div>
		</Banner>
	);
}

/**
 * The message view's one banner slot, between the header and the body. The
 * verdict decides what it says: a failed check, a Check again that now reaches
 * Spam for a message outside it, or a warning. It has no close control; it
 * goes when its verdict goes.
 */
export function SpamWarningBanner({
	verdict,
	inSpamFolder,
	pending,
	checkAgainFailure,
	onNotSpam,
	onReport,
	onMove,
	onWhy,
	onCheckAgain,
}: SpamWarningBannerProps) {
	if (verdict.state === "Failed") {
		return (
			<BannerBody
				tone="info"
				role="status"
				icon={<CircleQuestionMark className="size-4 text-accent-2" />}
				headline={CHECK_FAILED_HEADLINE}
				lines={[
					`The spam check failed: ${SPAM_FAILURE_SENTENCES[verdict.kind]}. No label was added.`,
					...(checkAgainFailure
						? [
								`Check again didn't finish: ${CHECK_AGAIN_FAILURE_SENTENCES[checkAgainFailure]}`,
							]
						: []),
				]}
				actions={
					<BannerAction
						label="Check again"
						pending={pending}
						busy="CheckAgain"
						disabled={checkAgainFailure === "DailyCap"}
						onClick={onCheckAgain}
					/>
				}
			/>
		);
	}

	if (verdict.action === "None") return null;
	if (verdict.action === "Junk" && inSpamFolder) return null;

	const phishing = verdict.kind === "Phishing";
	const skipped = modelSkipCause(verdict);
	const tone: BannerTone = phishing ? "danger" : "warning";
	const role = phishing ? "alert" : "status";
	const icon = phishing ? (
		<ShieldAlert className="size-4 text-danger" />
	) : (
		<TriangleAlert className="size-4 text-warning" />
	);

	if (verdict.action === "Junk") {
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
					`Check again scored it ${formatSpamScore(verdict.score)}, past your Move to Spam threshold. It stays here until you move it.`,
				]}
				actions={
					<>
						<BannerAction
							label="Move to Spam"
							variant="primary"
							pending={pending}
							busy="Move"
							onClick={onMove}
						/>
						<BannerAction
							label="Not spam"
							pending={pending}
							busy="NotSpam"
							onClick={onNotSpam}
						/>
						<WhyButton onWhy={onWhy} />
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
				...(skipped ? [`${BASIC_CHECKS_ONLY}: ${skipped}`] : []),
			]}
			actions={
				<>
					<BannerAction
						label="Not spam"
						pending={pending}
						busy="NotSpam"
						onClick={onNotSpam}
					/>
					<BannerAction
						label="Report spam"
						pending={pending}
						busy="Report"
						onClick={onReport}
					/>
					<WhyButton onWhy={onWhy} />
				</>
			}
		/>
	);
}
