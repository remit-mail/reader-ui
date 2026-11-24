import type { PersistedClient } from "@tanstack/react-query-persist-client";
/** Preserve the last successful descriptor even when a list page or error replaces it. */
export const mergePersistedQueries = (
	previous: PersistedClient | undefined,
	client: PersistedClient,
): PersistedClient => {
	const queries = new Map(
		previous?.clientState.queries.map((query) => [query.queryHash, query]),
	);
	for (const query of client.clientState.queries) {
		const existing = queries.get(query.queryHash);
		if (!existing || query.state.dataUpdatedAt >= existing.state.dataUpdatedAt)
			queries.set(query.queryHash, query);
	}
	return {
		...client,
		clientState: { mutations: [], queries: [...queries.values()] },
	};
};
