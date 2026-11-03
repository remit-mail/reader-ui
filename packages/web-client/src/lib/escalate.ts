import { isUnauthenticated, shouldEscalate } from "./error-classifier";
import { reportFatalError } from "./fatal-error";
import { reportSignedOut } from "./signed-out";

/**
 * Where a failed request goes when its call site does not answer it: a 401 to
 * the signed-out notice, whatever the call site declared, and anything else
 * the fail-fast contract escalates to the fatal page.
 */
export const escalate = (
	error: unknown,
	meta?: Record<string, unknown>,
): void => {
	if (isUnauthenticated(error)) {
		reportSignedOut();
		return;
	}
	if (shouldEscalate(error, meta)) reportFatalError(error);
};
