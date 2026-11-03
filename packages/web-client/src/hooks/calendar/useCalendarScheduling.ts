/**
 * Who an event's invitations go out from, who can be invited, and whether the
 * messages a save queued reached their guests.
 *
 * A save answers with the scheduling messages it put in the outbox. They are
 * sent after the save returns, so whether each one went is followed here, by
 * reading the outbox row until the send worker settles it.
 */
import {
	addressOperationsSearchAddressesOptions,
	configOperationsGetConfigOptions,
	outboxDetailOperationsGetOutboxMessageOptions,
	outboxDetailOperationsSendOutboxMessageMutation,
	userSettingsOperationsGetUserSettingsOptions,
	userSettingsOperationsUpdateUserSettingsMutation,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapCalendarSchedulingSend,
	RemitImapOutboxMessageStatus,
} from "@remit/api-http-client/types.gen.ts";
import type { CalendarSender, GuestSuggestion } from "@remit/ui";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDebouncedValue } from "../useDebouncedValue";

export interface CalendarSenders {
	senders: CalendarSender[];
	/**
	 * The account the editor starts on: the default sender in effect, as the
	 * settings API answers it. Absent while it loads, or when no account sends mail.
	 */
	defaultSenderId: string | undefined;
	setDefaultSender: (accountId: string) => Promise<void>;
}

/** The reader's accounts that can send mail, and the default one. */
export function useCalendarSenders(): CalendarSenders {
	const queryClient = useQueryClient();
	const { data } = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: 60_000,
	});
	const { data: settings } = useQuery(
		userSettingsOperationsGetUserSettingsOptions(),
	);
	const update = useMutation(userSettingsOperationsUpdateUserSettingsMutation());
	const senders = useMemo(
		() =>
			(data?.accounts ?? [])
				.filter((account) => account.syncedServices.includes("Mail"))
				.map((account) => ({
					accountId: account.accountId,
					email: account.email,
				})),
		[data?.accounts],
	);
	const defaultSenderId = settings?.defaultInvitationSenderAccountId;
	const setDefaultSender = useCallback(
		async (accountId: string) => {
			await update.mutateAsync({
				body: { defaultInvitationSenderAccountId: accountId },
			});
			await queryClient.invalidateQueries({
				queryKey: userSettingsOperationsGetUserSettingsOptions().queryKey,
			});
		},
		[update, queryClient],
	);
	return { senders, defaultSenderId, setDefaultSender };
}

const MIN_QUERY = 2;

/** Contacts matching what is typed in a Guests field, as the composer finds them. */
export function useGuestSuggestions(query: string): GuestSuggestion[] {
	const debounced = useDebouncedValue(query.trim(), 200);
	const { data } = useQuery({
		...addressOperationsSearchAddressesOptions({
			query: { q: debounced, limit: 8 },
		}),
		enabled: debounced.length >= MIN_QUERY,
	});
	return useMemo(
		() =>
			(data?.items ?? []).map((address) => ({
				email: address.normalizedEmail,
				name: address.displayName ?? "",
			})),
		[data?.items],
	);
}

const SETTLED: readonly RemitImapOutboxMessageStatus[] = [
	"sent",
	"unfiled",
	"failed",
	"blocked",
];

const MISSED: readonly RemitImapOutboxMessageStatus[] = ["failed", "blocked"];

export interface SendsFollowUp {
	/** The guests a message has not reached, once its row settled as failed. */
	missed: string[];
	/** Sends every failed message again. */
	retry: () => Promise<void>;
}

/**
 * Follows each queued scheduling message until it settles. A row that left the
 * outbox was sent and filed, which reads as a 404 here and as reached.
 */
export function useSendsFollowUp(
	sends: readonly RemitImapCalendarSchedulingSend[],
): SendsFollowUp {
	const queryClient = useQueryClient();
	const resend = useMutation(outboxDetailOperationsSendOutboxMessageMutation());
	const results = useQueries({
		queries: sends.map((send) => ({
			...outboxDetailOperationsGetOutboxMessageOptions({
				path: { outboxMessageId: send.outboxMessageId },
			}),
			meta: { softErrorStatuses: [404] },
			retry: false,
			refetchInterval: (query: {
				state: {
					data?: { status: RemitImapOutboxMessageStatus };
					error: unknown;
				};
			}) => {
				if (query.state.error) return false;
				const status = query.state.data?.status;
				return status && SETTLED.includes(status) ? false : 1500;
			},
		})),
	});
	const missed = sends.filter((_, index) => {
		const status = results[index]?.data?.status;
		return status !== undefined && MISSED.includes(status);
	});
	const retry = useCallback(async () => {
		for (const send of missed) {
			await resend.mutateAsync({
				path: { outboxMessageId: send.outboxMessageId },
			});
			await queryClient.invalidateQueries({
				queryKey: outboxDetailOperationsGetOutboxMessageOptions({
					path: { outboxMessageId: send.outboxMessageId },
				}).queryKey,
			});
		}
	}, [missed, resend, queryClient]);
	return { missed: missed.map((send) => send.email), retry };
}
