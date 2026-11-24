import {
	outboxAttachmentOperationsCompleteOutboxAttachmentMutation,
	outboxAttachmentOperationsRenewOutboxAttachmentMutation,
	outboxDetailOperationsMintOutboxAttachmentMutation,
	outboxDetailOperationsUpdateOutboxMessageMutation,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState, useSyncExternalStore } from "react";
import { wrapHttpFailure } from "../lib/api";
import {
	type AttachmentTransport,
	ComposeAttachmentController,
	type DraftForAttachment,
} from "../lib/compose-attachment-controller";

export type { DraftForAttachment };

const putFile = (
	uploadUrl: string,
	file: File,
	signal: AbortSignal,
): Promise<void> =>
	fetch(uploadUrl, { method: "PUT", body: file, signal }).then(
		async (response) => {
			if (!response.ok) {
				const text = await response.text();
				if (
					response.headers.get("x-remit-upload-reason") === "expired" ||
					((response.status === 403 || response.status === 409) &&
						(/^(expired|no-live-reservation)$/.test(text) ||
							/<Code>(RequestExpired|ExpiredToken)<\/Code>|<Message>Request has expired<\/Message>/.test(
								text,
							)))
				) {
					throw wrapHttpFailure(
						{
							code: "attachment_rejected",
							reason: "ReservationExpired",
							message: "The upload URL expired.",
						},
						response.status,
					);
				}
				const body = response.headers
					.get("content-type")
					?.includes("application/json")
					? JSON.parse(text)
					: { message: text };
				throw wrapHttpFailure(body, response.status);
			}
		},
	);

interface UseComposeAttachmentsOptions {
	ensureDraft: () => Promise<DraftForAttachment>;
}

/** The composer's side of `ComposeAttachmentController`, over the app's API. */
export const useComposeAttachments = ({
	ensureDraft,
}: UseComposeAttachmentsOptions) => {
	const mintMutation = useMutation({
		...outboxDetailOperationsMintOutboxAttachmentMutation(),
	});
	const renewMutation = useMutation({
		...outboxAttachmentOperationsRenewOutboxAttachmentMutation(),
	});
	const completeMutation = useMutation({
		...outboxAttachmentOperationsCompleteOutboxAttachmentMutation(),
	});
	const updateMutation = useMutation({
		...outboxDetailOperationsUpdateOutboxMessageMutation(),
	});

	const transportRef = useRef<AttachmentTransport | null>(null);
	transportRef.current = {
		mint: (outboxMessageId, file) =>
			mintMutation.mutateAsync({
				path: { outboxMessageId },
				body: {
					filename: file.name,
					contentType: file.type || "application/octet-stream",
					sizeBytes: file.size,
				},
			}),
		renew: (outboxMessageId, outboxAttachmentId) =>
			renewMutation.mutateAsync({
				path: { outboxMessageId, outboxAttachmentId },
			}),
		put: putFile,
		complete: (outboxMessageId, outboxAttachmentId) =>
			completeMutation
				.mutateAsync({ path: { outboxMessageId, outboxAttachmentId } })
				.then((attachment) => ({ contentUrl: attachment.contentUrl })),
		keep: (outboxMessageId, attachmentIds) =>
			updateMutation
				.mutateAsync({
					path: { outboxMessageId },
					body: { attachmentIds },
				})
				.then(() => undefined),
	};
	const ensureDraftRef = useRef(ensureDraft);
	ensureDraftRef.current = ensureDraft;

	const [controller] = useState(
		() =>
			new ComposeAttachmentController({
				transport: () => {
					const transport = transportRef.current;
					if (!transport) throw new Error("attachment transport not ready");
					return transport;
				},
				ensureDraft: () => ensureDraftRef.current(),
			}),
	);

	const items = useSyncExternalStore(
		controller.subscribe,
		controller.getSnapshot,
		controller.getSnapshot,
	);

	return {
		items,
		attach: controller.attach,
		retry: controller.retry,
		remove: controller.remove,
		load: controller.load,
		reset: controller.reset,
		owns: controller.owns,
		isLoaded: controller.isLoaded,
		refreshLinks: controller.refreshLinks,
		storedContent: controller.storedContent,
		onRemoved: controller.onRemoved,
		blockingReason: controller.blockingReason(),
	};
};
