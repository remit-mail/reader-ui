import type { Mutation, Query } from "@tanstack/react-query";
import { escalate } from "./escalate";

/** Requests keep their local error state; confirmed authentication refusals raise the session notice. */
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
