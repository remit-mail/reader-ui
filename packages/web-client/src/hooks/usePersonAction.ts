import { peopleOperationsListPeopleQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import {
	peopleOperationsCreatePasswordReset,
	peopleOperationsCreateStepUp,
	peopleOperationsSignOutPerson,
	peopleOperationsUpdatePerson,
} from "@remit/api-http-client/sdk.gen.ts";
import type {
	RemitImapPeopleListResponse,
	RemitImapPerson,
	RemitImapStepUpAction,
} from "@remit/api-http-client/types.gen.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { peopleActionMeta, replacePerson } from "../lib/people";

export interface PersonActionInput {
	action: RemitImapStepUpAction;
	person: RemitImapPerson;
	password: string;
}

export interface PersonActionResult {
	person: RemitImapPerson;
	resetUrl: string | undefined;
}

const runAction = async (
	{ action, person }: PersonActionInput,
	stepUpToken: string,
): Promise<PersonActionResult> => {
	const path = { userId: person.userId };
	if (action === "SignOut") {
		const { data } = await peopleOperationsSignOutPerson({
			path,
			body: { stepUpToken },
			throwOnError: true,
		});
		return { person: data, resetUrl: undefined };
	}
	if (action === "ResetPassword") {
		const { data } = await peopleOperationsCreatePasswordReset({
			path,
			body: { stepUpToken },
			throwOnError: true,
		});
		return { person: data.person, resetUrl: data.resetUrl };
	}
	const { data } = await peopleOperationsUpdatePerson({
		path,
		body: {
			status: action === "Disable" ? "Disabled" : "Active",
			stepUpToken,
		},
		throwOnError: true,
	});
	return { person: data, resetUrl: undefined };
};

/**
 * One People action behind its own password step-up: the token is earned for
 * this action on this person and spent at once, never stored.
 */
export const usePersonAction = () => {
	const queryClient = useQueryClient();

	return useMutation({
		meta: peopleActionMeta,
		mutationFn: async (
			input: PersonActionInput,
		): Promise<PersonActionResult> => {
			const { data } = await peopleOperationsCreateStepUp({
				body: {
					password: input.password,
					action: input.action,
					userId: input.person.userId,
				},
				throwOnError: true,
			});
			return runAction(input, data.stepUpToken);
		},
		onSuccess: ({ person }) => {
			queryClient.setQueryData<RemitImapPeopleListResponse>(
				peopleOperationsListPeopleQueryKey(),
				(list) =>
					list ? { people: replacePerson(list.people, person) } : list,
			);
		},
	});
};
