import { ApiError } from "./api";
import { NetworkError } from "./network-error";
import { OfflineUnavailableError } from "./offline-error";

/**
 * Extract an HTTP status code from a thrown error, regardless of which client
 * raised it.
 *
 * Two client shapes coexist in the web client:
 *  - the hand-written `api` wrapper throws `ApiError` (carries `.status`);
 *  - the generated `@remit/api-http-client` (hey-api) throws the parsed JSON error
 *    body. A response interceptor (see `lib/client.ts`) re-wraps those as
 *    `ApiError` too, so in practice both paths carry `.status`. As a belt-and-
 *    braces fallback we also read a numeric `status`/`statusCode` off a plain
 *    object.
 */
export const getErrorStatus = (error: unknown): number | undefined => {
	if (error instanceof ApiError) return error.status;
	if (error && typeof error === "object") {
		const candidate = error as { status?: unknown; statusCode?: unknown };
		if (typeof candidate.status === "number") return candidate.status;
		if (typeof candidate.statusCode === "number") return candidate.statusCode;
	}
	return undefined;
};

/** The error carries a real HTTP status — our API answered. */
export const hasHttpStatus = (error: unknown): boolean =>
	getErrorStatus(error) !== undefined;

/** A genuine first-party server failure: an HTTP 5xx. */
export const isServerError = (error: unknown): boolean => {
	const status = getErrorStatus(error);
	return status !== undefined && status >= 500 && status <= 599;
};

/**
 * A deliberately cancelled request (route change, React Query cancellation).
 * Never a failure.
 */
export const isAbortError = (error: unknown): boolean => {
	if (
		typeof DOMException !== "undefined" &&
		error instanceof DOMException &&
		error.name === "AbortError"
	) {
		return true;
	}
	if (
		error &&
		typeof error === "object" &&
		"name" in error &&
		(error as { name?: unknown }).name === "AbortError"
	) {
		return true;
	}
	return false;
};

const isOffline = (): boolean =>
	typeof navigator !== "undefined" && navigator.onLine === false;

/**
 * A transport failure from a wifi drop, tab wake, captive portal, or a timeout:
 * the request never reached a server, so it is environmental, not a proven
 * first-party failure.
 *
 * This is decided at the fetch boundary, not inferred here. Every app-owned
 * request goes through `taggedFetch`, which knows a `fetch()` rejection is
 * transport-level because `fetch` rejects for no other reason, and tags it a
 * `NetworkError`. Reading that tag is exact; matching browser failure strings
 * was not — the list is open-ended (WebKit alone has four, undici another) and
 * anything missed would put a full-screen fatal page in front of someone who
 * had merely walked out of wifi range.
 *
 * `navigator.onLine === false` is kept as a second signal for an error that
 * reached us from outside that boundary while the browser reports no
 * connectivity at all.
 */
export const isNetworkError = (error: unknown): boolean => {
	if (isAbortError(error)) return false;
	if (hasHttpStatus(error)) return false;
	if (error instanceof NetworkError) return true;
	return isOffline();
};

/**
 * An exception raised by our own client code rather than by a request: it
 * carries no HTTP status, is not an abort, and was not tagged as transport.
 * That leaves a programming error — the one class the user can do nothing
 * about and must never be asked to shrug off.
 */
export const isClientBug = (error: unknown): boolean =>
	!hasHttpStatus(error) &&
	!isAbortError(error) &&
	!isNetworkError(error) &&
	!(error instanceof OfflineUnavailableError);

/**
 * The bearer token could not be minted because the server refused the session
 * itself: the self-host kill switch is on, or the account was disabled. Read by
 * name, as `isAbortError` does, so this module never loads the auth client.
 */
const isRefusedTokenMint = (error: unknown): boolean =>
	error instanceof Error &&
	error.name === "AuthTokenError" &&
	getErrorStatus(error) === 403;

/**
 * The session is gone. Not any 403: a handler answers 403 for a resource
 * belonging to another account config, which is a refusal a call site can state
 * where it stands. A 401 is the user signed out from under whatever they were
 * doing, and so is a token mint the server refused.
 */
export const isUnauthenticated = (error: unknown): boolean =>
	getErrorStatus(error) === 401 || isRefusedTokenMint(error);

/** Requests never replace the app with a fatal screen. Their owners render failures inline. */
export const shouldEscalate = (
	_error: unknown,
	_meta?: Record<string, unknown>,
): boolean => false;

/** Metadata retained for request owners that state their own errors. */
export const softErrorMeta: { softError: true } = { softError: true };

/** Metadata naming the statuses a request owner handles. */
export const softErrorStatuses = (
	...statuses: number[]
): { softErrorStatuses: number[] } => ({ softErrorStatuses: statuses });

/** Marks polling across a restart the caller requested. */
export const restartExpectedMeta: { restartExpected: true } = {
	restartExpected: true,
};

/** Marks an action that shows its server failure inline. */
export const ownsServerErrorsMeta: { ownsServerErrors: true } = {
	ownsServerErrors: true,
};

/** The record is not there. */
export const isNotFound = (error: unknown): boolean =>
	getErrorStatus(error) === 404;
