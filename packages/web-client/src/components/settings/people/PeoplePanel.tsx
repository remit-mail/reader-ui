import type {
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
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePeople } from "../../../hooks/usePeople";
import type { PersonActionResult } from "../../../hooks/usePersonAction";
import {
	classifyPeopleFailure,
	formatPersonDate,
	peopleListFailureReason,
	peopleReportHref,
	personActionCopy,
} from "../../../lib/people";
import { PersonActionDialog } from "./PersonActionDialog";
import { ResetLinkDialog } from "./ResetLinkDialog";

interface PendingAction {
	action: RemitImapStepUpAction;
	person: RemitImapPerson;
}

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

function ReportLink({ href }: { href: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="font-medium text-accent hover:underline"
		>
			Report an issue
		</a>
	);
}

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
}: {
	person: RemitImapPerson;
	onPick: (action: RemitImapStepUpAction) => void;
}) {
	const disabled = person.status === "Disabled";
	return (
		<DropdownMenu
			trigger={
				<>
					<MoreHorizontal className="size-4" aria-hidden="true" />
					<span className="sr-only">Actions for {person.email}</span>
				</>
			}
		>
			<DropdownMenuItem onClick={() => onPick("SignOut")}>
				Sign out everywhere
			</DropdownMenuItem>
			<DropdownMenuItem onClick={() => onPick("ResetPassword")}>
				Reset password
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			{disabled ? (
				<DropdownMenuItem onClick={() => onPick("Enable")}>
					Enable
				</DropdownMenuItem>
			) : (
				<DropdownMenuItem
					onClick={() => onPick("Disable")}
					disabled={person.isCaller}
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
}: {
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
	const [pending, setPending] = useState<PendingAction | null>(null);
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
		return (
			<Banner tone="info">
				This server has no People page. It shows on a self-hosted server once
				self sign-up is turned off.
			</Banner>
		);
	}

	if (people.isError) {
		if (classifyPeopleFailure(people.error).kind === "signedOut") return null;
		return (
			<Banner tone="danger">
				<p className="font-medium">{LIST_FAILED}.</p>
				<p className="mt-1 text-fg-muted">
					{peopleListFailureReason(people.error)}
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
		setFailure(null);
		setPending({ action, person });
	};

	const done = (result: PersonActionResult) => {
		if (result.resetUrl && pending) {
			setResetLink({ email: pending.person.email, resetUrl: result.resetUrl });
		}
		setPending(null);
	};

	const failed = (error: unknown) => {
		if (!pending) return;
		const classified = classifyPeopleFailure(error);
		setFailure({
			title: personActionCopy(pending.action, pending.person.email).failedTitle,
			reason:
				classified.kind === "failed"
					? classified.reason
					: "Something went wrong. Nothing changed. Try again.",
			error,
		});
		setPending(null);
	};

	return (
		<div className="space-y-4">
			{failure && <ActionFailedBanner failure={failure} />}
			<PeopleTable people={people.data.people} onPick={pick} />
			{pending && (
				<PersonActionDialog
					action={pending.action}
					person={pending.person}
					onCancel={() => setPending(null)}
					onDone={done}
					onFailed={failed}
				/>
			)}
			{resetLink && (
				<ResetLinkDialog
					email={resetLink.email}
					resetUrl={resetLink.resetUrl}
					onDone={() => setResetLink(null)}
				/>
			)}
		</div>
	);
}
