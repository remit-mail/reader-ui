/**
 * The one place an API call's 401 or 403 goes: the session is no longer one the
 * server accepts, so every screen shows the same signed-out notice instead of
 * rendering empty data or the fatal page.
 */
import { getErrorStatus } from "./error-classifier";

type SignedOutListener = (signedOut: boolean) => void;

const listeners = new Set<SignedOutListener>();
let signedOut = false;

/** Whether an error says the session is gone: a 401, or a 403 refusing it. */
export const isSignedOutError = (error: unknown): boolean => {
	const status = getErrorStatus(error);
	return status === 401 || status === 403;
};

export const reportSignedOut = (): void => {
	if (signedOut) return;
	signedOut = true;
	for (const listener of listeners) listener(true);
};

export const isSignedOut = (): boolean => signedOut;

export const subscribeSignedOut = (
	listener: SignedOutListener,
): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

/** For tests: forget a reported sign-out. */
export const resetSignedOut = (): void => {
	signedOut = false;
	for (const listener of listeners) listener(false);
};
