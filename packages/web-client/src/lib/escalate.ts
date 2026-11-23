import { isUnauthenticated } from "./error-classifier";
import { getOfflineRuntime } from "./offline-runtime";
import { reportSignedOut } from "./signed-out";

/** Confirmed authentication refusals invalidate the session; other errors stay with their owner. */
export const escalate = (error: unknown): void => {
	if (!isUnauthenticated(error)) return;
	const runtime = getOfflineRuntime();
	if (runtime) {
		runtime.sessionUnverified();
		return;
	}
	reportSignedOut();
};
