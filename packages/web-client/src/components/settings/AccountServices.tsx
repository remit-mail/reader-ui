import {
	accountDetailOperationsUpdateAccountMutation,
	configOperationsGetConfigQueryKey,
	microsoftOAuthOperationsMicrosoftOAuthStartMutation,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapAccountResponse } from "@remit/api-http-client/types.gen.ts";
import { microsoftServicesGranted } from "@remit/mail-oauth-service";
import {
	type AccountService,
	type AccountServiceIntent,
	formatErrorMessage,
} from "@remit/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	REDIRECT_STALL_MESSAGE,
	useRedirectEnded,
} from "../../hooks/useRedirectEnded";
import { useErrorBanners } from "../ui/error-banner-context";
import {
	type AccountServiceRefusal,
	AccountServicesCard,
} from "./AccountServicesCard";

const SERVICES: AccountService[] = ["Mail", "Calendar"];
const PROVIDER_NAME = "Microsoft";

const isMicrosoft = (account: RemitImapAccountResponse): boolean =>
	account.authType === "oauthMicrosoft";

const withService = (
	services: AccountService[],
	service: AccountService,
): AccountService[] =>
	SERVICES.filter(
		(candidate) => candidate === service || services.includes(candidate),
	);

export interface AccountServicesProps {
	account: RemitImapAccountResponse;
	onRemoveAccount: () => void;
}

export function AccountServices({
	account,
	onRemoveAccount,
}: AccountServicesProps) {
	const queryClient = useQueryClient();
	const { pushError, dismissError } = useErrorBanners();
	const [refusal, setRefusal] = useState<AccountServiceRefusal | null>(null);
	const [redirecting, setRedirecting] = useState<AccountService | null>(null);

	const save = useMutation({
		...accountDetailOperationsUpdateAccountMutation(),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: configOperationsGetConfigQueryKey(),
			}),
	});

	const consent = useMutation({
		...microsoftOAuthOperationsMicrosoftOAuthStartMutation(),
	});

	const markRedirectStarted = useRedirectEnded((end) => {
		const service = redirecting;
		setRedirecting(null);
		if (end !== "stalled" || service === null) return;
		setRefusal({ service, intent: "on", message: REDIRECT_STALL_MESSAGE });
	});

	const enabled =
		save.isPending && save.variables?.body.syncedServices
			? save.variables.body.syncedServices
			: account.syncedServices;
	const offered = isMicrosoft(account) ? SERVICES : ["Mail" as const];
	const consented = isMicrosoft(account)
		? microsoftServicesGranted(account.grantedScopes)
		: offered;

	const commit = (
		services: AccountService[],
		service: AccountService,
		intent: AccountServiceIntent,
	) => {
		const previous = [...enabled];
		setRefusal(null);
		save.mutate(
			{
				path: { accountId: account.accountId },
				body: { syncedServices: services },
			},
			{
				onSuccess: () => {
					if (intent !== "off") return;
					const id = pushError({
						severity: "info",
						title: `Stopped syncing ${service.toLowerCase()}`,
						action: {
							kind: "button",
							label: "Undo",
							onClick: () => {
								dismissError(id);
								commit(previous, service, "on");
							},
						},
					});
				},
				onError: (error) =>
					setRefusal({ service, intent, message: formatErrorMessage(error) }),
			},
		);
	};

	const startConsent = (service: AccountService) => {
		setRefusal(null);
		consent.mutate(
			{
				body: {
					email: account.email,
					services: withService(enabled, service),
				},
			},
			{
				onSuccess: (data) => {
					setRedirecting(service);
					markRedirectStarted();
					window.location.assign(data.authorizationUrl);
				},
				onError: (error) =>
					setRefusal({
						service,
						intent: "on",
						message: formatErrorMessage(error),
					}),
			},
		);
	};

	const requestChange = (
		service: AccountService,
		intent: AccountServiceIntent,
	) => {
		if (intent === "off") {
			if (enabled.length === 1) onRemoveAccount();
			else
				commit(
					enabled.filter((candidate) => candidate !== service),
					service,
					"off",
				);
			return;
		}
		if (!consented.includes(service)) {
			startConsent(service);
			return;
		}
		commit(withService(enabled, service), service, "on");
	};

	return (
		<AccountServicesCard
			providerName={PROVIDER_NAME}
			offered={offered}
			enabled={enabled}
			consented={consented}
			disabled={save.isPending || consent.isPending || redirecting !== null}
			refusal={refusal}
			onRequestChange={requestChange}
		/>
	);
}
