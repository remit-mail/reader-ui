// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
import { messageOperationsDescribeMessageOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageAttachments } from "../components/mail/MessageAttachments";
import { MessageBody } from "../components/mail/MessageBody";
import { getOfflineRuntime } from "../lib/offline-runtime";

export const Route = createFileRoute("/downloads/$messageId")({
	component: DownloadedMessage,
});
function DownloadedMessage() {
	const { messageId } = Route.useParams();
	const { data } = useQuery({
		...messageOperationsDescribeMessageOptions({ path: { messageId } }),
		enabled: !!getOfflineRuntime(),
	});
	if (!data) return <p>This message has not been downloaded.</p>;
	return (
		<article>
			<h2>{data.envelope.subject || "(No subject)"}</h2>
			<MessageBody messageId={messageId} bodyParts={data.bodyParts} />
			<MessageAttachments messageId={messageId} bodyParts={data.bodyParts} />
		</article>
	);
}
