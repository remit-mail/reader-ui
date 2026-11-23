import type { RemitImapAccountResponse } from "@remit/api-http-client/types.gen.ts";
import { Banner, Button } from "@remit/ui";
import { useState } from "react";
import { hasUnresolvedSpecialFolders } from "../../lib/special-folders";
import { SpecialFolderConfirmation } from "./SpecialFolderConfirmation";

/** Account-scoped preference in the same local settings storage as appearance. */
const dismissalKey = (account: RemitImapAccountResponse) =>
	`remit.specialFoldersDismissed.${account.accountConfigId}.${account.accountId}`;

export function SpecialFolderPrompt({
	account,
}: {
	account: RemitImapAccountResponse;
}) {
	const [dismissed, setDismissed] = useState(
		() =>
			typeof localStorage !== "undefined" &&
			localStorage.getItem(dismissalKey(account)) === "true",
	);
	const [choosing, setChoosing] = useState(false);
	if (
		dismissed ||
		!account.syncedServices.includes("Mail") ||
		!hasUnresolvedSpecialFolders(account.folderAppointments)
	)
		return null;
	const dismiss = () => {
		localStorage.setItem(dismissalKey(account), "true");
		setDismissed(true);
	};
	return (
		<div className="space-y-3">
			{choosing ? (
				<SpecialFolderConfirmation
					accountId={account.accountId}
					onComplete={dismiss}
					onCancel={() => setChoosing(false)}
				/>
			) : (
				<Banner tone="warning" variant="soft" onDismiss={dismiss}>
					<div className="flex flex-wrap items-center gap-2">
						<span>
							Confirm special folders for {account.email} so Remit uses the
							right folders for your mail.
						</span>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => setChoosing(true)}
						>
							Review folders
						</Button>
					</div>
				</Banner>
			)}
		</div>
	);
}
