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
import {
	classificationActionMeta,
	classificationQueryMeta,
	isClassificationSignedOut,
} from "../lib/classification";
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
		meta: classificationQueryMeta,
		refetchOnWindowFocus: true,
		refetchInterval: 60_000,
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
		meta: classificationActionMeta,
		onSuccess: storeSettings(queryClient),
		onError: reportIfSignedOut,
	});
};

export const useClearClassification = () => {
	const queryClient = useQueryClient();
	return useMutation({
		...userSettingsOperationsClearClassificationProviderMutation(),
		meta: classificationActionMeta,
		onSuccess: storeSettings(queryClient),
		onError: reportIfSignedOut,
	});
};

export const useTestClassification = () =>
	useMutation({
		...userSettingsOperationsTestClassificationProviderMutation(),
		meta: classificationActionMeta,
		onError: reportIfSignedOut,
	});
