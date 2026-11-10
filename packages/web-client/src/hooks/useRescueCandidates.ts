import { threadOperationsSearchThreads } from "@remit/api-http-client/sdk.gen.ts";
import type { RescueCandidate } from "@remit/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { rescueCandidateReason } from "../lib/rescue-candidates";

const TRUST_REASON = "We can verify this sender";

export const rescueCandidatesQueryKey = (junkMailboxId: string | undefined) =>
	["rescue-candidates", junkMailboxId] as const;

/**
 * Fetch rescue candidates from the backend for the given Junk mailbox.
 *
 * Filters by senderTrust=[vip,wellknown] and dkimMismatch=false. The
 * dkimMismatch=false filter excludes senders with no authenticity signal
 * (undefined), not just confirmed mismatches — this is intentional: it closes
 * the impersonation path where a spoofed trusted-sender From with no DKIM
 * would otherwise surface as a rescue candidate.
 *
 * Pages through continuationToken until the search returns none, so the
 * candidates cover the whole Junk mailbox.
 *
 * Only fires when junkMailboxId is provided.
 */
export function useRescueCandidates(junkMailboxId: string | undefined): {
	candidates: RescueCandidate[];
} {
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useInfiniteQuery({
			queryKey: rescueCandidatesQueryKey(junkMailboxId),
			queryFn: async ({ pageParam }) => {
				const { data: page } = await threadOperationsSearchThreads({
					path: { mailboxId: junkMailboxId ?? "" },
					query: {
						senderTrust: ["vip", "wellknown"],
						dkimMismatch: false,
						results: true,
						limit: 500,
						continuationToken: pageParam,
					},
					throwOnError: true,
				});
				return page;
			},
			initialPageParam: undefined as string | undefined,
			getNextPageParam: (lastPage) => lastPage.continuationToken,
			enabled: !!junkMailboxId,
			staleTime: 60_000,
		});

	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage) {
			void fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const candidates = useMemo<RescueCandidate[]>(
		() =>
			(data?.pages ?? [])
				.flatMap((page) => page.items ?? [])
				.map((thread) => ({
					id: thread.messageId,
					senderName: thread.fromName || thread.fromEmail || "Unknown sender",
					senderAddress: thread.fromEmail ?? "",
					subject: thread.subject || "(no subject)",
					snippet: thread.snippet ?? "",
					trustReason: TRUST_REASON,
					trustSubReason: rescueCandidateReason(thread.senderTrust),
					senderTrust: thread.senderTrust,
				})),
		[data],
	);

	return { candidates };
}
