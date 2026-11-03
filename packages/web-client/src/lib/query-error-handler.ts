import type { Mutation, Query } from "@tanstack/react-query";
import { escalate } from "./escalate";

/**
 * Global React Query error sink. Every query and mutation error flows through
 * here (wired on the `QueryCache`/`MutationCache` in main.tsx). The fail-fast
 * contract (#1059) lives in `shouldEscalate`: a non-2xx escalates to the
 * full-screen red overlay by default; a 5xx ALWAYS escalates; only aborts,
 * statusless network blips, and non-5xx errors a call site opted out of via
 * `meta.softError` stay soft.
 *
 * A 401 from either cache raises the signed-out notice instead, whatever the
 * call site declared (`lib/escalate.ts`).
 *
 * This is the v5 equivalent of `defaultOptions.queries.onError` /
 * `.mutations.onError` — v5 moved the global error hook onto the caches.
 */
export const handleQueryCacheError = (
	error: Error,
	query: Query<unknown, unknown, unknown>,
): void => {
	escalate(error, query.meta);
};

export const handleMutationCacheError = (
	error: unknown,
	_variables: unknown,
	_onMutateResult: unknown,
	mutation: Mutation<unknown, unknown, unknown>,
): void => {
	escalate(error, mutation.meta);
};
