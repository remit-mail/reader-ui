import type {
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import { codedApiErrorBody } from "./api";
import { buildBugReportContext, buildGitHubIssueUrl } from "./bug-report";
import {
	getErrorStatus,
	isNetworkError,
	ownsServerErrorsMeta,
	softErrorStatuses,
} from "./error-classifier";
import { formatDatePreset } from "./format";

/**
 * The list read owns its refusals: a 404 means this server has no People page
 * (self sign-up is open, or it is not a self-host), and a 403 means the caller
 * may no longer act, which the page turns into the signed-out notice.
 */
export const peopleQueryMeta = softErrorStatuses(403, 404);

/**
 * The action dialogs own every refusal the People operations answer, and a
 * server failure too: it shows as the banner over the list.
 */
export const peopleActionMeta = {
	...softErrorStatuses(403, 404, 409, 429),
	...ownsServerErrorsMeta,
};

const SIGNED_OUT_CODES = new Set(["sign_in_disabled", "caller_disabled"]);

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

const failureReason = (error: unknown): string => {
	if (isNetworkError(error)) {
		return "The server could not be reached. Nothing changed. Try again.";
	}
	const code = codedApiErrorBody(error)?.code;
	if (code === "cannot_disable_self") {
		return "You cannot disable your own account, so one account always stays on.";
	}
	if (code === "step_up_required") {
		return "The password check did not carry over to the action. Nothing changed. Try again.";
	}
	if (code === "foreign_origin") {
		return "The server refused a request from this address. Nothing changed. Open this page from the server's own address.";
	}
	if (getErrorStatus(error) === 404) {
		return "That account is gone, or this server no longer has a People page. Reload the page.";
	}
	return "Something went wrong on the server. Nothing changed. Try again.";
};

export const peopleListFailureReason = (error: unknown): string =>
	isNetworkError(error)
		? "The server could not be reached. Check your connection and try again."
		: "The server did not answer as expected. Try again.";

export const classifyPeopleFailure = (error: unknown): PeopleFailure => {
	if (getErrorStatus(error) === 401 || isPeopleSignedOut(error)) {
		return { kind: "signedOut" };
	}
	const code = codedApiErrorBody(error)?.code;
	if (code === "wrong_password") return { kind: "wrongPassword" };
	if (code === "step_up_locked") return { kind: "locked" };
	return { kind: "failed", reason: failureReason(error) };
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
			failedTitle: `${email} was not disabled`,
			destructive: true,
		};
	}
	if (action === "Enable") {
		return {
			title: `Enable ${email}?`,
			body: "They can sign in again with their password. Calendar feed links they shared before stay off; they make new ones in Settings.",
			confirmLabel: "Enable",
			failedTitle: `${email} was not enabled`,
			destructive: false,
		};
	}
	if (action === "SignOut") {
		return {
			title: `Sign ${email} out everywhere?`,
			body: "Every session and connected app of theirs ends within 15 minutes. They can sign in again with their password.",
			confirmLabel: "Sign out everywhere",
			failedTitle: `${email} was not signed out`,
			destructive: true,
		};
	}
	return {
		title: `Reset the password of ${email}?`,
		body: "Their password stops working at once and they are signed out everywhere. You get a link to give them, which works once, for 24 hours.",
		confirmLabel: "Make a reset link",
		failedTitle: `No reset link was made for ${email}`,
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
