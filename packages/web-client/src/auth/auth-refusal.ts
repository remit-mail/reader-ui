import { getErrorStatus } from "../lib/error-classifier";

/**
 * The two self-host refusals the sign-in screen states in its own words. The
 * server answers each with a 403 and a code on every auth path, the session
 * lookup included, so the screen shows them before anyone types.
 *
 *  - "signInOff": the operator turned sign-in off for the whole server.
 *  - "accountDisabled": this account was disabled on the People page.
 */
export type AuthRefusal = "signInOff" | "accountDisabled";

const REFUSALS: Record<string, AuthRefusal> = {
	SIGN_IN_DISABLED: "signInOff",
	ACCOUNT_DISABLED: "accountDisabled",
};

export const authRefusal = (error: unknown): AuthRefusal | undefined => {
	if (getErrorStatus(error) !== 403) return undefined;
	if (!error || typeof error !== "object" || !("code" in error)) {
		return undefined;
	}
	const { code } = error;
	return typeof code === "string" ? REFUSALS[code] : undefined;
};
