// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * The reply, reply-all or forward under a conversation opened from a label.
 * The conversation reads it off the address and opens it at its head.
 */
import { createFileRoute } from "@tanstack/react-router";
import { replySearchSchemas } from "../../../../../../lib/mail-search";

export const Route = createFileRoute(
	"/mail/label/$labelId/$threadId/$messageId/$mode/{-$outboxMessageId}",
)({ validateSearch: replySearchSchemas.label });
