import {
	addressDetailOperationsUpdateAddressMutation,
	addressOperationsSearchAddressesOptions,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { NeverInSpamOffer } from "@remit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { softErrorStatuses } from "../../lib/error-classifier";
import {
	dismissNeverInSpamOffer,
	type NeverInSpamOfferTarget,
	useNeverInSpamOffer,
} from "../../lib/never-in-spam-offer";
import {
	pickSenderAddress,
	senderAddressSearchQuery,
} from "../../lib/sender-address";
import { useErrorBanners } from "../ui/error-banner-context";
import { formatErrorDetail } from "../ui/error-banners";

function Offer({ target }: { target: NeverInSpamOfferTarget }) {
	const queryClient = useQueryClient();
	const { pushError } = useErrorBanners();
	const search = addressOperationsSearchAddressesOptions({
		query: senderAddressSearchQuery(target.email),
	});
	const { data } = useQuery(search);
	const address = pickSenderAddress(data?.items, target.email);
	const lookup = useMutation({
		mutationFn: async () => {
			const found = pickSenderAddress(
				(await queryClient.ensureQueryData(search)).items,
				target.email,
			);
			if (!found) {
				throw new Error(`No address record for ${target.email}`);
			}
			return found;
		},
	});
	const save = useMutation({
		...addressDetailOperationsUpdateAddressMutation(),
		meta: softErrorStatuses(400, 403, 404, 409),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: search.queryKey });
			dismissNeverInSpamOffer();
		},
		onError: (error) =>
			pushError({
				title: "Couldn't save Never in Spam",
				detail: formatErrorDetail(error),
				error,
			}),
	});

	return (
		<NeverInSpamOffer
			sender={target}
			blocked={address?.flags?.blocked?.value === true}
			saving={lookup.isPending || save.isPending}
			onAccept={() => {
				lookup.mutate(undefined, {
					onSuccess: (found) =>
						save.mutate({
							path: { addressId: found.addressId },
							body: {
								flags: {
									neverSpam: { value: true, setAt: Date.now(), setBy: "user" },
								},
							},
						}),
				});
			}}
			onDismiss={dismissNeverInSpamOffer}
		/>
	);
}

/**
 * The banner slot above the Spam list holds one banner at a time: the Never in
 * Spam offer a Not spam press raised, otherwise whatever the slot already
 * shows.
 */
export function NeverInSpamOfferSlot({ fallback }: { fallback?: ReactNode }) {
	const target = useNeverInSpamOffer();
	if (!target) return fallback ?? null;
	return <Offer key={target.email} target={target} />;
}
