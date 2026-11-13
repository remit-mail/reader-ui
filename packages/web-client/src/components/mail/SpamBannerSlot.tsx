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
 * states the spam verdict of the row the reader opened, or the verdict a Check
 * again just returned for it, and goes when that verdict goes.
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

	const verdict = checkAgain?.verdicts.get(row.messageId) ?? row.spamVerdict;
	const inSpamFolder =
		junkMailboxId !== undefined && row.mailboxId === junkMailboxId;
	if (!raisesSpamWarning(verdict, inSpamFolder)) return null;
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
					[{ ...checkAgainRequestOfThread(row), accountId }],
					{ panel: false },
				)
			}
		/>
	);
}
