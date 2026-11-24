import { peopleOperationsListPeopleQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	peopleOperationsCreatePasswordReset,
	peopleOperationsSignOutPerson,
	peopleOperationsUpdatePerson,
} from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapPeopleListResponse,
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import {
	Banner,
	Button,
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@remit/ui";
import { Ellipsis } from "@remit/ui/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { usePeople } from "../../../hooks/usePeople";
import {
	formatPersonDate,
	isPeopleSignedOut,
	peopleFailureReason,
	peopleReportHref,
	personActionFailedTitle,
} from "../../../lib/people";
import { reportSignedOut } from "../../../lib/signed-out";
import { ReportLink } from "../ReportLink";
import { ResetLinkDialog } from "./ResetLinkDialog";

interface ActionFailure {
	title: string;
	reason: string;
	error: unknown;
}

interface ResetLink {
	email: string;
	resetUrl: string;
}

const LIST_FAILED = "The list of people did not load";

function ActionFailedBanner({ failure }: { failure: ActionFailure }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<div ref={ref} tabIndex={-1} className="outline-none">
			<Banner tone="danger">
				<p className="font-medium">{failure.title}</p>
				<p className="mt-1 text-fg-muted">{failure.reason}</p>
				<p className="mt-1">
					<ReportLink href={peopleReportHref(failure.title, failure.error)} />
				</p>
			</Banner>
		</div>
	);
}

function PersonMenu({
	person,
	onPick,
	busy,
}: {
	busy: boolean;
	person: RemitImapPerson;
	onPick: (action: RemitImapStepUpAction) => void;
}) {
	const disabled = person.status === "Disabled";
	return (
		<DropdownMenu
			trigger={
				<>
					<Ellipsis className="size-4" aria-hidden="true" />
					<span className="sr-only">Actions for {person.email}</span>
				</>
			}
		>
			<DropdownMenuItem disabled={busy} onClick={() => onPick("SignOut")}>
				Sign out everywhere
			</DropdownMenuItem>
			<DropdownMenuItem disabled={busy} onClick={() => onPick("ResetPassword")}>
				Reset password
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			{disabled ? (
				<DropdownMenuItem disabled={busy} onClick={() => onPick("Enable")}>
					Enable
				</DropdownMenuItem>
			) : (
				<DropdownMenuItem
					onClick={() => onPick("Disable")}
					disabled={busy || person.isCaller}
					destructive={!person.isCaller}
				>
					<span className="flex flex-col">
						<span>Disable</span>
						{person.isCaller && (
							<span className="text-xs text-fg-subtle">
								Not your own account
							</span>
						)}
					</span>
				</DropdownMenuItem>
			)}
		</DropdownMenu>
	);
}

function PeopleTable({
	people,
	onPick,
	busy,
}: {
	busy: boolean;
	people: readonly RemitImapPerson[];
	onPick: (action: RemitImapStepUpAction, person: RemitImapPerson) => void;
}) {
	const now = new Date();
	return (
		<div className="overflow-x-auto rounded-sm border border-line bg-surface">
			<table className="w-full text-left text-sm">
				<thead className="border-b border-line text-xs text-fg-muted">
					<tr>
						<th scope="col" className="px-3 py-2 font-medium">
							Email
						</th>
						<th scope="col" className="px-3 py-2 font-medium">
							Created
						</th>
						<th scope="col" className="px-3 py-2 font-medium">
							Last sign-in
						</th>
						<th scope="col" className="px-3 py-2 font-medium">
							Sessions
						</th>
						<th scope="col" className="px-3 py-2 font-medium">
							Status
						</th>
						<th scope="col" className="w-12 px-1 py-2">
							<span className="sr-only">Actions</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{people.map((person) => (
						<tr
							key={person.userId}
							className="border-b border-line last:border-b-0"
						>
							<td className="px-3 py-1 text-fg">
								{person.email}
								{person.isCaller && (
									<span className="text-fg-muted"> (you)</span>
								)}
							</td>
							<td className="px-3 py-1 text-fg-muted">
								{formatPersonDate(person.createdAt, now)}
							</td>
							<td className="px-3 py-1 text-fg-muted">
								{formatPersonDate(person.lastSignInAt, now)}
							</td>
							<td className="px-3 py-1 tabular-nums text-fg-muted">
								{person.sessionCount}
							</td>
							<td
								className={
									person.status === "Disabled"
										? "px-3 py-1 text-danger"
										: "px-3 py-1 text-fg-muted"
								}
							>
								{person.status}
							</td>
							<td className="px-1 py-1">
								<PersonMenu
									person={person}
									busy={busy}
									onPick={(action) => onPick(action, person)}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function PeoplePanel() {
	const people = usePeople();
	const queryClient = useQueryClient();
	const mutation = useMutation({
		gcTime: 0,
		mutationFn: async ({
			action,
			person,
		}: {
			action: RemitImapStepUpAction;
			person: RemitImapPerson;
		}) => {
			const path = { userId: person.userId };
			if (action === "SignOut") {
				const { data } = await peopleOperationsSignOutPerson({
					path,
					throwOnError: true,
				});
				return { person: data, resetUrl: undefined };
			}
			if (action === "ResetPassword") {
				const { data } = await peopleOperationsCreatePasswordReset({
					path,
					throwOnError: true,
				});
				return { person: data.person, resetUrl: data.resetUrl };
			}
			const { data } = await peopleOperationsUpdatePerson({
				path,
				body: {
					status: action === "Disable" ? "Disabled" : "Active",
				},
				throwOnError: true,
			});
			return { person: data, resetUrl: undefined };
		},
		onSuccess: ({ person }) => {
			queryClient.setQueryData<RemitImapPeopleListResponse>(
				peopleOperationsListPeopleQueryKey(),
				(list) =>
					list
						? {
								people: list.people.map((candidate) =>
									candidate.userId === person.userId ? person : candidate,
								),
							}
						: list,
			);
		},
	});
	const [failure, setFailure] = useState<ActionFailure | null>(null);
	const [resetLink, setResetLink] = useState<ResetLink | null>(null);

	if (people.isPending) {
		return (
			// biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label on a loading skeleton is what assistive tech has to go on
			<div
				className="h-24 animate-pulse rounded-sm border border-line bg-surface"
				aria-busy="true"
				aria-label="Loading people"
			/>
		);
	}

	if (people.unavailable) {
		return <Banner tone="info">{peopleFailureReason(people.error)}</Banner>;
	}

	if (people.isError) {
		if (isPeopleSignedOut(people.error)) return null;
		return (
			<Banner tone="danger">
				<p className="font-medium">{LIST_FAILED}.</p>
				<p className="mt-1 text-fg-muted">
					{peopleFailureReason(people.error)}
				</p>
				<p className="mt-2 flex items-center gap-3">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => void people.refetch()}
					>
						Try again
					</Button>
					<ReportLink href={peopleReportHref(LIST_FAILED, people.error)} />
				</p>
			</Banner>
		);
	}

	const pick = (action: RemitImapStepUpAction, person: RemitImapPerson) => {
		if (mutation.isPending) return;
		setFailure(null);
		mutation.mutate(
			{ action, person },
			{
				onSuccess: (result) => {
					if (result.resetUrl)
						setResetLink({ email: person.email, resetUrl: result.resetUrl });
				},
				onError: (error) => {
					if (isPeopleSignedOut(error)) {
						reportSignedOut();
						return;
					}
					setFailure({
						title: personActionFailedTitle(action, person.email),
						reason: peopleFailureReason(error),
						error,
					});
				},
			},
		);
	};

	return (
		<div className="space-y-4">
			{failure && <ActionFailedBanner failure={failure} />}
			<PeopleTable
				people={people.data.people}
				onPick={pick}
				busy={mutation.isPending}
			/>
			{resetLink && (
				<ResetLinkDialog
					email={resetLink.email}
					resetUrl={resetLink.resetUrl}
					onDone={() => {
						setResetLink(null);
						mutation.reset();
					}}
				/>
			)}
		</div>
	);
}
