import type {
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import { Button, Dialog, PasswordInput } from "@remit/ui";
import { X } from "@remit/ui/icons";
import { type FormEvent, useState } from "react";
import {
	type PersonActionResult,
	usePersonAction,
} from "../../../hooks/usePersonAction";
import { classifyPeopleFailure, personActionCopy } from "../../../lib/people";
import { reportSignedOut } from "../../../lib/signed-out";

interface PersonActionDialogProps {
	action: RemitImapStepUpAction;
	person: RemitImapPerson;
	onCancel: () => void;
	onDone: (result: PersonActionResult) => void;
	onFailed: (error: unknown) => void;
}

const WRONG_PASSWORD = "That is not your password. Try again.";
const LOCKED =
	"Five wrong passwords in 15 minutes. Wait 15 minutes, then try again.";

export function PersonActionDialog({
	action,
	person,
	onCancel,
	onDone,
	onFailed,
}: PersonActionDialogProps) {
	const copy = personActionCopy(action, person.email);
	const [password, setPassword] = useState("");
	const [problem, setProblem] = useState<string | null>(null);
	const mutation = usePersonAction(password);

	const cancel = () => {
		if (mutation.isPending) return;
		onCancel();
	};

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (mutation.isPending || password === "") return;
		setProblem(null);
		mutation.mutate(
			{ action, person },
			{
				onSuccess: onDone,
				onError: (error) => {
					const failure = classifyPeopleFailure(error);
					if (failure.kind === "wrongPassword") {
						setPassword("");
						setProblem(WRONG_PASSWORD);
						return;
					}
					if (failure.kind === "locked") {
						setPassword("");
						setProblem(LOCKED);
						return;
					}
					if (failure.kind === "signedOut") {
						onCancel();
						reportSignedOut();
						return;
					}
					onFailed(error);
				},
			},
		);
	};

	return (
		<Dialog open onClose={cancel} title={copy.title}>
			<form onSubmit={submit}>
				<header className="flex items-center gap-2 border-b border-line px-5 py-3">
					<span className="flex-1 text-sm font-semibold text-fg">
						{copy.title}
					</span>
					<Button
						variant="ghost"
						size="sm"
						icon={<X className="size-3.5" />}
						onClick={cancel}
						aria-label="Close"
					/>
				</header>
				<div className="space-y-4 px-5 py-4 text-sm text-fg-muted">
					<p>{copy.body}</p>
					<div className="flex flex-col gap-1">
						<label
							htmlFor="people-step-up-password"
							className="text-xs font-medium text-fg"
						>
							Your password
						</label>
						<PasswordInput
							id="people-step-up-password"
							autoComplete="current-password"
							value={password}
							onChange={(event) => {
								setPassword(event.target.value);
								setProblem(null);
							}}
							aria-invalid={problem !== null}
							aria-describedby="people-step-up-hint"
							required
						/>
						<p id="people-step-up-hint" className="text-xs">
							{problem ? (
								<span className="text-danger" role="alert">
									{problem}
								</span>
							) : (
								"Confirm with your own password. It counts for this one action."
							)}
						</p>
					</div>
				</div>
				<footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
					<Button variant="secondary" size="sm" onClick={cancel}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant={copy.destructive ? "danger" : "primary"}
						size="sm"
						disabled={password === ""}
						aria-busy={mutation.isPending}
					>
						{copy.confirmLabel}
					</Button>
				</footer>
			</form>
		</Dialog>
	);
}
