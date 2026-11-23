import {
	userSettingsOperationsClearClassificationProviderMutation,
	userSettingsOperationsGetUserSettingsOptions,
	userSettingsOperationsTestClassificationProviderMutation,
	userSettingsOperationsUpdateUserSettingsMutation,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapUserSettingsResponse } from "@remit/api-http-client/types.gen.ts";
import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { isClassificationSignedOut } from "../lib/classification";
import { reportSignedOut } from "../lib/signed-out";

const reportIfSignedOut = (error: unknown): void => {
	if (isClassificationSignedOut(error)) reportSignedOut();
};

const storeSettings =
	(queryClient: QueryClient) => (settings: RemitImapUserSettingsResponse) => {
		queryClient.setQueryData(
			userSettingsOperationsGetUserSettingsOptions().queryKey,
			settings,
		);
	};

export const useClassificationSettings = () => {
	const query = useQuery({
		...userSettingsOperationsGetUserSettingsOptions(),
	});
	const signedOut = query.isError && isClassificationSignedOut(query.error);
	useEffect(() => {
		if (signedOut) reportSignedOut();
	}, [signedOut]);
	return { ...query, signedOut };
};

export const useSaveClassification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...userSettingsOperationsUpdateUserSettingsMutation(),
		onSuccess: storeSettings(queryClient),
		onError: reportIfSignedOut,
	});
};

export const useClearClassification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...userSettingsOperationsClearClassificationProviderMutation(),
		onSuccess: storeSettings(queryClient),
		onError: reportIfSignedOut,
	});
};

export const useTestClassification = () =>
	useMutation({
		...userSettingsOperationsTestClassificationProviderMutation(),
		onError: reportIfSignedOut,
	});
