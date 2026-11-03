/**
 * The one place a 401 goes: the session is no longer one the server accepts,
 * so every screen shows the same signed-out notice instead of rendering empty
 * data or the fatal page. A 403 is a refusal of one resource and stays with
 * the call site that asked for it.
 */

type SignedOutListener = (signedOut: boolean) => void;

const listeners = new Set<SignedOutListener>();
let signedOut = false;

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

/** Forgets a reported sign-out, once the reader is signing back in. */
export const resetSignedOut = (): void => {
	signedOut = false;
	for (const listener of listeners) listener(false);
};
