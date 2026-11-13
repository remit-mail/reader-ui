import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";

export interface SpamHrefs {
	spamSettings: string;
	senders: string;
	filters: string;
	labelList: (labelId: string) => string;
	labelMessage: (
		labelId: string,
		threadId: string,
		messageId: string,
	) => string;
}

/**
 * The addresses the spam surfaces link to, built by the router so they carry
 * the deployment's base path. A label's message opens under its label list.
 */
export function useSpamHrefs(): SpamHrefs {
	const router = useRouter();
	return useMemo(
		() => ({
			spamSettings: router.buildLocation({ to: "/settings/spam" }).href,
			senders: router.buildLocation({ to: "/settings/senders" }).href,
			filters: router.buildLocation({ to: "/settings/filters" }).href,
			labelList: (labelId) =>
				router.buildLocation({
					to: "/mail/label/$labelId",
					params: { labelId },
				}).href,
			labelMessage: (labelId, threadId, messageId) =>
				router.buildLocation({
					to: "/mail/label/$labelId/$threadId/$messageId",
					params: { labelId, threadId, messageId },
				}).href,
		}),
		[router],
	);
}
