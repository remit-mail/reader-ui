import { syncOperationsGetSyncStatusOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { Banner, Button, WizardShell } from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { SpecialFolderConfirmation } from "../settings/SpecialFolderConfirmation";

export function SpecialFoldersStep({
	accountId,
	steps,
	onComplete,
}: {
	accountId: string;
	steps: string[];
	onComplete: () => void;
}) {
	const status = useQuery({
		...syncOperationsGetSyncStatusOptions({ path: { accountId } }),
		refetchOnMount: "always",
		refetchInterval: (query) => {
			const phase = query.state.data?.syncPhase;
			return phase === "idle" || phase === "discovering_mailboxes" || !phase
				? 2000
				: false;
		},
	});
	const phase = status.data?.syncPhase;
	const discovered =
		status.isFetchedAfterMount &&
		(phase === "syncing_inbox" ||
			phase === "syncing_others" ||
			phase === "complete");
	return (
		<WizardShell
			steps={steps}
			activeStep={steps.length - 1}
			title="Confirm special folders"
			subtitle="Check the folders Remit will use for this account."
			footer={<span />}
		>
			{discovered ? (
				<SpecialFolderConfirmation
					accountId={accountId}
					onComplete={onComplete}
					onCancel={onComplete}
					cancelLabel="Set up later"
				/>
			) : (
				<div className="space-y-4">
					{status.isError || phase === "error" ? (
						<Banner tone="danger">
							Mailbox discovery couldn't finish. You can confirm special folders
							later in Settings › Folder roles.
						</Banner>
					) : (
						<p role="status">Waiting for mailbox discovery…</p>
					)}
					<Button onClick={onComplete}>Set up later</Button>
					{(status.isError || phase === "error") && (
						<Button onClick={() => void status.refetch()}>Retry</Button>
					)}
				</div>
			)}
		</WizardShell>
	);
}
