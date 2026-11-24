import { peopleOperationsListPeopleQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	peopleOperationsCreatePasswordReset,
	peopleOperationsSignOutPerson,
	peopleOperationsUpdatePerson,
} from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapPeopleListResponse,
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replacePerson } from "../lib/people";

export interface PersonActionInput {
	action: RemitImapStepUpAction;
	person: RemitImapPerson;
}

export interface PersonActionResult {
	person: RemitImapPerson;
	resetUrl: string | undefined;
}

const runAction = async ({
	action,
	person,
}: PersonActionInput): Promise<PersonActionResult> => {
	const path = { userId: person.userId };
	if (action === "SignOut") {
		const { data } = await peopleOperationsSignOutPerson({
			path,
			throwOnError: true,
		});
		return { person: data, resetUrl: undefined };
	}
	if (action === "ResetPassword") {
		const { data } = await peopleOperationsCreatePasswordReset({
			path,
			throwOnError: true,
		});
		return { person: data.person, resetUrl: data.resetUrl };
	}
	const { data } = await peopleOperationsUpdatePerson({
		path,
		body: {
			status: action === "Disable" ? "Disabled" : "Active",
		},
		throwOnError: true,
	});
	return { person: data, resetUrl: undefined };
};

/** Run with the signed-in session; discard reset links when the result closes. */
export const usePersonAction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		gcTime: 0,
		mutationFn: runAction,
		onSuccess: ({ person }) => {
			queryClient.setQueryData<RemitImapPeopleListResponse>(
				peopleOperationsListPeopleQueryKey(),
				(list) =>
					list ? { people: replacePerson(list.people, person) } : list,
			);
		},
	});
};
