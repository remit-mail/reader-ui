import type { RemitImapThreadMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { SpamWarningBanner, type SpamWarningPending } from "@remit/ui";
import { useJunkMailbox } from "../../hooks/useArchiveMailbox";
import { useMailboxAccount } from "../../hooks/useMailboxAccount";
import { useMoveMessages } from "../../hooks/useMoveMessages";
import { useReportSpam } from "../../hooks/useReportSpam";
import { raisesSpamWarning } from "../../lib/spam";
import { useErrorBanners } from "../ui/error-banner-context";
import { checkAgainRequestOfThread, useCheckAgain } from "./CheckAgainProvider";

/**
 * The message view's one banner slot, between the header and the body. It
 * warns while the message carries a Remit Spam or Phishing label outside Spam,
 * or when the check failed, and goes when the label goes.
 */
export function SpamBannerSlot({
	row,
	onOpenIntelligence,
}: {
	row: RemitImapThreadMessageResponse;
	onOpenIntelligence?: () => void;
}) {
	const resolved = useMailboxAccount(row.accountId ? undefined : row.mailboxId);
	const accountId = row.accountId ?? resolved.accountId;
	const { junkMailboxId } = useJunkMailbox(accountId);
	const checkAgain = useCheckAgain();
	const { pushError } = useErrorBanners();
	const { reportSpam, notSpam, isReporting, isRestoring } = useReportSpam({
		mailboxId: row.mailboxId,
		threadId: row.threadId,
		accountId,
	});
	const { moveMessages, isPending: isMoving } = useMoveMessages({
		mailboxId: row.mailboxId,
		threadId: row.threadId,
		accountId,
	});

	const verdict = row.spamVerdict;
	const inSpamFolder =
		junkMailboxId !== undefined && row.mailboxId === junkMailboxId;
	if (!raisesSpamWarning(row, inSpamFolder)) return null;
	if (verdict.state !== "Checked" && verdict.state !== "Failed") return null;

	const pending: SpamWarningPending | undefined = checkAgain?.pendingIds.has(
		row.messageId,
	)
		? "CheckAgain"
		: isReporting
			? "Report"
			: isRestoring
				? "NotSpam"
				: isMoving
					? "Move"
					: undefined;

	return (
		<SpamWarningBanner
			verdict={verdict}
			inSpamFolder={inSpamFolder}
			pending={pending}
			checkAgainFailure={checkAgain?.failures.get(row.messageId)}
			onNotSpam={() => notSpam([row.messageId])}
			onReport={() => reportSpam([row.messageId])}
			onMove={() => {
				if (junkMailboxId) {
					moveMessages([row.messageId], junkMailboxId);
					return;
				}
				pushError({
					title: "Couldn't move this message to Spam",
					detail:
						"This account has no Spam folder yet. Choose one in Settings, Folder roles.",
				});
			}}
			onWhy={() => onOpenIntelligence?.()}
			onCheckAgain={() =>
				checkAgain?.checkAgain(
					[
						{
							...checkAgainRequestOfThread(
								row,
								junkMailboxId ? new Set([junkMailboxId]) : new Set(),
							),
							accountId,
						},
					],
					{ panel: false },
				)
			}
		/>
	);
}
