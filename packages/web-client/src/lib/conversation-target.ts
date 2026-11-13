/**
 * What the reading pane needs to show a conversation.
 *
 * The thread is the whole address — `ConversationView` fetches by it — and the
 * rest is what the list already knows about the row the reader pointed at, so
 * the pane paints a subject before the thread's own messages arrive. A thread no
 * list holds carries none of it and still opens.
 */
import type { RemitImapThreadMessageResponse } from "@remit/api-http-client/types.gen.ts";

export interface ConversationTarget {
	threadId: string;
	mailboxId: string;
	subject?: string;
	messageId?: string;
	/** The row the reader pointed at, whose spam verdict the banner states. */
	row?: RemitImapThreadMessageResponse;
}
