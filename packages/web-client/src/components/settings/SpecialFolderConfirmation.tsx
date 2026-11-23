import {
	configOperationsGetConfigOptions,
	configOperationsGetConfigQueryKey,
	mailboxOperationsListMailboxesOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { folderRoleOperationsAppointFolderRole } from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapAccountResponse,
	RemitImapMailboxResponse,
} from "@remit/api-http-client/types.gen.ts";
import {
	Banner,
	Button,
	ErrorState,
	type RoleAppointment,
	RoleAppointmentList,
} from "@remit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { softErrorStatuses } from "../../lib/error-classifier";
import { NAV_ROLE_TO_CANONICAL } from "../../lib/folder-roles";
import {
	SPECIAL_FOLDER_ROLES,
	specialFolderAppointments,
} from "../../lib/special-folders";
import { isMailboxNotSettledRefusal } from "../ui/folder-role-refusal";

interface Props {
	accountId: string;
	onComplete: () => void;
	onCancel: () => void;
	cancelLabel?: string;
}

export function SpecialFolderConfirmation({
	accountId,
	onComplete,
	onCancel,
	cancelLabel = "Cancel",
}: Props) {
	// Always read again on entry: the create response and cached config can
	// predate mailbox discovery. Never seed choices from that earlier snapshot.
	const config = useQuery({
		...configOperationsGetConfigOptions(),
		refetchOnMount: "always",
	});
	const mailboxes = useQuery({
		...mailboxOperationsListMailboxesOptions({ path: { accountId } }),
		refetchOnMount: "always",
	});
	const account = config.data?.accounts.find(
		(one) => one.accountId === accountId,
	);
	if (config.isError || mailboxes.isError) {
		return (
			<div className="space-y-3">
				<ErrorState
					variant="inline"
					title="Couldn't load special folders"
					error={config.error ?? mailboxes.error}
					onRetry={() => {
						void config.refetch();
						void mailboxes.refetch();
					}}
				/>
				<Button onClick={onCancel}>{cancelLabel}</Button>
			</div>
		);
	}
	if (!config.isFetchedAfterMount || !mailboxes.isFetchedAfterMount)
		return <p role="status">Loading special folders…</p>;
	if (!account)
		return (
			<div className="space-y-3">
				<p role="alert">The account is no longer available.</p>
				<Button onClick={onCancel}>{cancelLabel}</Button>
			</div>
		);
	return (
		<SpecialFolderChoices
			account={account}
			mailboxes={mailboxes.data?.items ?? []}
			onComplete={onComplete}
			onCancel={onCancel}
			cancelLabel={cancelLabel}
		/>
	);
}

function SpecialFolderChoices({
	account,
	mailboxes,
	onComplete,
	onCancel,
	cancelLabel,
}: Omit<Props, "accountId"> & {
	account: RemitImapAccountResponse;
	mailboxes: RemitImapMailboxResponse[];
}) {
	const queryClient = useQueryClient();
	const [appointments, setAppointments] = useState<
		Record<string, RoleAppointment>
	>(() => specialFolderAppointments(account.folderAppointments));
	const save = useMutation({
		mutationFn: async () => {
			for (const role of SPECIAL_FOLDER_ROLES) {
				const mailboxId = appointments[role]?.mailboxId;
				if (!mailboxId) continue;
				await folderRoleOperationsAppointFolderRole({
					throwOnError: true,
					path: {
						accountId: account.accountId,
						role: NAV_ROLE_TO_CANONICAL[role],
					},
					body: { mailboxId },
				});
			}
			await queryClient.invalidateQueries({
				queryKey: configOperationsGetConfigQueryKey(),
			});
		},
		onSuccess: onComplete,
		meta: softErrorStatuses(409),
	});
	const hasChoice = SPECIAL_FOLDER_ROLES.some((role) =>
		mailboxes.some(
			(mailbox) => mailbox.mailboxId === appointments[role]?.mailboxId,
		),
	);
	return (
		<div className="space-y-4">
			<p className="text-sm text-fg-muted">
				Confirm where this account keeps deleted mail, sent mail, drafts and
				archived mail. Choose using the provider paths and message counts.
			</p>
			<fieldset disabled={save.isPending} className="min-w-0">
				<RoleAppointmentList
					accountEmail={account.email}
					roles={SPECIAL_FOLDER_ROLES}
					showOtherFolders={false}
					folders={mailboxes.map((mailbox) => ({
						mailboxId: mailbox.mailboxId,
						providerPath: mailbox.fullPath,
						hierarchyDelimiter: mailbox.hierarchyDelimiter,
						messageCount: mailbox.messageCount,
					}))}
					appointments={appointments}
					onAppoint={(role, mailboxId) =>
						setAppointments((previous) => ({
							...previous,
							[role]: { mailboxId, source: "Appointed" },
						}))
					}
				/>
			</fieldset>
			{SPECIAL_FOLDER_ROLES.some((role) => !appointments[role]?.mailboxId) && (
				<p className="text-sm text-fg-muted">
					Roles without a selected folder stay unset. You can choose them later
					in Settings › Folder roles.
				</p>
			)}
			{save.isError && (
				<Banner tone="danger" variant="soft">
					{isMailboxNotSettledRefusal(save.error)
						? "That folder is still being created on the mail server. Wait for it to finish, then try again."
						: "Couldn't save special folders. Please try again."}
				</Banner>
			)}
			<div className="flex justify-end gap-2">
				<Button onClick={onCancel} disabled={save.isPending}>
					{cancelLabel}
				</Button>
				<Button
					variant="primary"
					disabled={!hasChoice || save.isPending}
					onClick={() => save.mutate()}
				>
					{save.isPending ? "Saving…" : "Confirm folders"}
				</Button>
			</div>
		</div>
	);
}
