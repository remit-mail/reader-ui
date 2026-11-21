import type { RemitImapDescribeMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/downloads")({ component: Downloads });
const downloadedMessages = (client: QueryClient) =>
	client
		.getQueryCache()
		.getAll()
		.filter((query) => {
			const first = query.queryKey[0];
			return (
				first &&
				typeof first === "object" &&
				"_id" in first &&
				first._id === "messageOperationsDescribeMessage" &&
				query.state.data
			);
		})
		.map((query) => query.state.data as RemitImapDescribeMessageResponse);
function Downloads() {
	const client = useQueryClient();
	const [messages, setMessages] = useState(() => downloadedMessages(client));
	useEffect(
		() =>
			client.getQueryCache().subscribe((event) => {
				if (
					event.type === "added" ||
					event.type === "updated" ||
					event.type === "removed"
				)
					setMessages(downloadedMessages(client));
			}),
		[client],
	);
	return (
		<div className="flex h-full flex-col gap-4 overflow-auto p-4">
			<h1>Downloaded mail</h1>
			<p>
				Previously opened messages remain here when their list pages change.
				Only parts already saved on this device are available offline.
			</p>
			<Link to="/mail/brief">Back to mail</Link>
			<ul>
				{messages.map(({ message, envelope }) => (
					<li key={message.messageId}>
						<Link
							to="/downloads/$messageId"
							params={{ messageId: message.messageId }}
						>
							{envelope.subject || "(No subject)"}
						</Link>
					</li>
				))}
			</ul>
			{messages.length === 0 && <p>No downloaded messages yet.</p>}
			<Outlet />
		</div>
	);
}
