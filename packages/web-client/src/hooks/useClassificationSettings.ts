import {
	userSettingsOperationsClearClassificationProviderMutation,
	userSettingsOperationsGetUserSettingsOptions,
	userSettingsOperationsTestClassificationProviderMutation,
	userSettingsOperationsUpdateUserSettingsMutation,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapUserSettingsResponse } from "@remit/api-http-client/types.gen.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
	classificationActionMeta,
	classificationQueryMeta,
	isClassificationSignedOut,
} from "../lib/classification";
import { reportSignedOut } from "../lib/signed-out";

const settingsKey = () =>
	userSettingsOperationsGetUserSettingsOptions().queryKey;

const useReportSignedOut = (error: unknown): void => {
	const signedOut = error !== null && isClassificationSignedOut(error);
	useEffect(() => {
		if (signedOut) reportSignedOut();
	}, [signedOut]);
};

export const useClassificationSettings = () => {
	const query = useQuery({
		...userSettingsOperationsGetUserSettingsOptions(),
		meta: classificationQueryMeta,
	});
	useReportSignedOut(query.error);
	return {
		...query,
		signedOut: query.isError && isClassificationSignedOut(query.error),
	};
};

export const useClassificationActions = () => {
	const queryClient = useQueryClient();
	const store = (settings: RemitImapUserSettingsResponse) => {
		queryClient.setQueryData(settingsKey(), settings);
	};
	const save = useMutation({
		...userSettingsOperationsUpdateUserSettingsMutation(),
		meta: classificationActionMeta,
		onSuccess: store,
	});
	const clear = useMutation({
		...userSettingsOperationsClearClassificationProviderMutation(),
		meta: classificationActionMeta,
		onSuccess: store,
	});
	const toggle = useMutation({
		...userSettingsOperationsUpdateUserSettingsMutation(),
		meta: classificationActionMeta,
		onSuccess: store,
	});
	const test = useMutation({
		...userSettingsOperationsTestClassificationProviderMutation(),
		meta: classificationActionMeta,
	});
	useReportSignedOut(save.error);
	useReportSignedOut(clear.error);
	useReportSignedOut(toggle.error);
	useReportSignedOut(test.error);
	return { save, clear, toggle, test };
};
