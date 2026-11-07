import { peopleOperationsListPeopleOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { isNotFound } from "../lib/error-classifier";
import { isPeopleSignedOut, peopleQueryMeta } from "../lib/people";
import { reportSignedOut } from "../lib/signed-out";

const peopleQueryOptions = () => ({
	...peopleOperationsListPeopleOptions(),
	meta: peopleQueryMeta,
	retry: false,
});

/**
 * The People list. A 404 means this server has no People page, which hides it;
 * a 403 for a disabled caller or the kill switch raises the signed-out notice,
 * so neither ever reads as an empty list.
 */
export const usePeople = () => {
	const query = useQuery(peopleQueryOptions());
	const signedOut = query.isError && isPeopleSignedOut(query.error);

	useEffect(() => {
		if (signedOut) reportSignedOut();
	}, [signedOut]);

	return {
		...query,
		unavailable: query.isError && isNotFound(query.error),
	};
};
