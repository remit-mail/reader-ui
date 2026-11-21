import type { RemitImapDescribeMessageResponse } from "@remit/api-http-client/types.gen.ts";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getOfflineRuntime } from "../lib/offline-runtime";

export const Route = createFileRoute("/downloads")({ component: Downloads });
function Downloads() {
	const [messages, setMessages] = useState<RemitImapDescribeMessageResponse[]>(
		[],
	);
	useEffect(() => {
		const runtime = getOfflineRuntime();
		if (!runtime) return;
		void runtime
			.downloadedMessages()
			.then((index) =>
				setMessages(
					Object.values(index).map(
						(entry) =>
							(entry as { data: RemitImapDescribeMessageResponse }).data,
					),
				),
			)
			.catch(runtime.report);
	}, []);
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
