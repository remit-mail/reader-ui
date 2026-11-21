/**
 * Transport failures are identified where they happen, not guessed at later.
 *
 * `fetch()` rejects for exactly two reasons: the request never completed at the
 * transport level (DNS, TLS, connection lost, captive portal, timeout), or it
 * was aborted. It never rejects for an HTTP status. So the one place that knows
 * for certain that an error is a network error is the call site that wrapped
 * `fetch` — everywhere downstream is guessing.
 *
 * Guessing is what the classifier used to do, first by treating every error
 * without an HTTP status as a network blip (which swallowed our own exceptions),
 * then by matching browser failure strings (which is unbounded: WebKit alone
 * says "Failed to fetch", "Load failed", "The network connection was lost." and
 * "The request timed out.", and undici says "fetch failed"). Tagging at the
 * boundary makes the question decidable and the browser's wording irrelevant.
 */

import { recordRequest } from "./request-breadcrumbs";

/** A request that never reached a server. Always soft — never escalated. */
export class NetworkError extends Error {
	constructor(cause: unknown) {
		super(
			cause instanceof Error && cause.message
				? cause.message
				: "The request could not be completed.",
			{ cause },
		);
		this.name = "NetworkError";
	}
}

/**
 * A deliberate cancellation — a route change, a React Query cancellation, a
 * caller's own `AbortController`. Its own category: not a failure at all, so it
 * passes through untagged.
 *
 * `AbortSignal.timeout()` rejects with a `TimeoutError` rather than an
 * `AbortError`, and a timeout IS a transport failure, so it is deliberately not
 * matched here and gets tagged like any other.
 */
const isDeliberateAbort = (error: unknown): boolean =>
	typeof error === "object" &&
	error !== null &&
	"name" in error &&
	(error as { name?: unknown }).name === "AbortError";

/**
 * `fetch`, with transport failures tagged. Every app-owned request goes through
 * this — the generated client is configured with it, and the hand-written
 * wrapper calls it — so a `NetworkError` downstream is a fact, not an inference.
 *
 * It is also the one place every request is seen, so it records a metadata-only
 * breadcrumb (method, path, status, duration, correlation id) for bug reports.
 * A deliberate abort is not a request outcome worth reporting, so it is
 * re-thrown before any breadcrumb is written.
 *
 * Redirects are never followed. Behind Cloudflare Access an expired session
 * answers with a 302 to the login page on another origin, which sends no CORS
 * headers, so a followed redirect rejects as "Failed to fetch" and would read
 * as an offline blip. No API route redirects a fetch, so an opaque redirect
 * means the session is gone and becomes a 401, the signed-out path. The
 * `redirect` in `init` overrides the one on a `Request` input, which is what
 * the generated client passes.
 */
export const taggedFetch: typeof fetch = async (input, init) => {
	const startedAt = performance.now();
	try {
		const received = await fetch(input, { ...init, redirect: "manual" });
		const response =
			received.type === "opaqueredirect"
				? new Response(null, { status: 401 })
				: received;
		recordRequest({
			input,
			init,
			response,
			durationMs: performance.now() - startedAt,
		});
		return response;
	} catch (error) {
		if (isDeliberateAbort(error)) throw error;
		recordRequest({ input, init, durationMs: performance.now() - startedAt });
		throw new NetworkError(error);
	}
};
