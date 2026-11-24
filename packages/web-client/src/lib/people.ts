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
	if (getErrorStatus(error) === 401) return true;
	if (getErrorStatus(error) !== 403) return false;
	const code = codedApiErrorBody(error)?.code;
	return code !== undefined && SIGNED_OUT_CODES.has(code);
};

export const peopleFailureReason = (error: unknown): string =>
	formatErrorDetail(error) ??
	"The People request failed without an error message.";

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
