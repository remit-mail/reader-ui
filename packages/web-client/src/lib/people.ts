import type {
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import { PeopleErrorCode } from "@remit/domain-enums";
import { formatErrorDetail } from "../components/ui/error-banners";
import { codedApiErrorBody } from "./api";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";
import { getErrorStatus } from "./error-classifier";
import { formatDatePreset } from "./format";

const SIGNED_OUT_CODES = new Set<string>([
	PeopleErrorCode.SignInDisabled,
	PeopleErrorCode.CallerDisabled,
]);

/**
 * A People refusal that means the caller's session no longer counts: the kill
 * switch is on, or the caller's own account was disabled.
 */
export const isPeopleSignedOut = (error: unknown): boolean => {
	if (getErrorStatus(error) !== 403) return false;
	const code = codedApiErrorBody(error)?.code;
	return code !== undefined && SIGNED_OUT_CODES.has(code);
};

export type PeopleFailure =
	| { kind: "signedOut" }
	| { kind: "wrongPassword" }
	| { kind: "locked" }
	| { kind: "failed"; reason: string };

export const peopleFailureReason = (error: unknown): string =>
	formatErrorDetail(error) ??
	"The People request failed without an error message.";

export const classifyPeopleFailure = (error: unknown): PeopleFailure => {
	if (getErrorStatus(error) === 401 || isPeopleSignedOut(error)) {
		return { kind: "signedOut" };
	}
	const code = codedApiErrorBody(error)?.code;
	if (code === PeopleErrorCode.WrongPassword) return { kind: "wrongPassword" };
	if (code === PeopleErrorCode.StepUpLocked) return { kind: "locked" };
	return { kind: "failed", reason: peopleFailureReason(error) };
};

export interface PersonActionCopy {
	title: string;
	body: string;
	confirmLabel: string;
	failedTitle: string;
	destructive: boolean;
}

export const personActionCopy = (
	action: RemitImapStepUpAction,
	email: string,
): PersonActionCopy => {
	if (action === "Disable") {
		return {
			title: `Disable ${email}?`,
			body: "They are signed out everywhere within 15 minutes and cannot sign in until you enable them again. Their calendar feed links stop working. Their mail stays.",
			confirmLabel: "Disable",
			failedTitle: `Couldn't disable ${email}`,
			destructive: true,
		};
	}
	if (action === "Enable") {
		return {
			title: `Enable ${email}?`,
			body: "They can sign in again with their password. Calendar feed links they shared before stay off; they make new ones in Settings.",
			confirmLabel: "Enable",
			failedTitle: `Couldn't enable ${email}`,
			destructive: false,
		};
	}
	if (action === "SignOut") {
		return {
			title: `Sign ${email} out everywhere?`,
			body: "Every session and connected app of theirs ends within 15 minutes. They can sign in again with their password.",
			confirmLabel: "Sign out everywhere",
			failedTitle: `Couldn't sign ${email} out`,
			destructive: true,
		};
	}
	return {
		title: `Reset the password of ${email}?`,
		body: "Their password stops working at once and they are signed out everywhere. You get a link to give them, which works once, for 24 hours.",
		confirmLabel: "Make a reset link",
		failedTitle: `Couldn't make a reset link for ${email}`,
		destructive: true,
	};
};

/**
 * A prefilled issue for a People action the server failed. It names the action
 * and the server's answer, never the password or a token.
 */
export const peopleReportHref = (title: string, error: unknown): string => {
	const status = getErrorStatus(error);
	const code = codedApiErrorBody(error)?.code;
	const message = error instanceof Error ? error.message : String(error);
	const answer = [status ?? "no response", code, message]
		.filter((part) => part !== undefined && part !== "")
		.join(" ");
	return buildGitHubIssueUrl(
		buildBugReportContext({
			title: `People: ${title}`,
			errorMessage: `${title}. The server answered: ${answer}`,
		}),
	);
};

const sameDay = (a: Date, b: Date): boolean =>
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate();

export const formatPersonDate = (epochMs: number, now: Date): string =>
	sameDay(new Date(epochMs), now)
		? "Today"
		: formatDatePreset(epochMs, "medium");

export const replacePerson = (
	people: readonly RemitImapPerson[],
	person: RemitImapPerson,
): RemitImapPerson[] =>
	people.map((candidate) =>
		candidate.userId === person.userId ? person : candidate,
	);
