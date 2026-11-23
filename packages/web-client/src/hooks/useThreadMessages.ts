import { threadDetailOperationsListThreadMessagesQueryKey } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { RemitImapThreadMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Every original message in a thread, read from the cached thread-messages listing.
 *
 * A toolbar verb acts on the whole conversation, not the one row that
 * represents it in a list. When the conversation has not been opened yet its
 * messages are not cached, and the representative message is the best the
 * caller can do.
 */
export const useThreadMessages = (): ((
	thread: RemitImapThreadMessageResponse,
) => RemitImapThreadMessageResponse[]) => {
	const queryClient = useQueryClient();
	return useCallback(
		(thread: RemitImapThreadMessageResponse) => {
			const threadKey = threadDetailOperationsListThreadMessagesQueryKey({
				path: { threadId: thread.threadId },
			});
			const cached = queryClient.getQueriesData<{
				items: RemitImapThreadMessageResponse[];
			}>({ queryKey: threadKey });
			const messages = cached.flatMap(([, data]) => data?.items ?? []);
			return messages.length > 0 ? messages : [thread];
		},
		[queryClient],
	);
};
