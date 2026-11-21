import { useEffect, useState } from "react";
import { useAuthProvider } from "../auth/provider";
import type { MessageBodyPart } from "../components/mail/MessageBody";
import { fetchAttachment } from "../lib/attachment-download";
import { getOfflineRuntime } from "../lib/offline-runtime";

/** CID parts are mail content, never remote tracking images. Object URLs live
 * only for this render lifetime; durable storage holds the original bytes. */
export const useDownloadedInlineParts = (
	parts: readonly MessageBodyPart[] | undefined,
) => {
	const { getToken } = useAuthProvider();
	const [resolved, setResolved] = useState<
		| { source: readonly MessageBodyPart[]; parts: readonly MessageBodyPart[] }
		| undefined
	>();
	useEffect(() => {
		const runtime = getOfflineRuntime();
		if (!runtime || !parts) return;
		let stopped = false;
		const urls: string[] = [];
		setResolved(undefined);
		void (async () => {
			const result = [];
			for (const part of parts) {
				if (!part.contentId || part.mediaType.toLowerCase() !== "image") {
					result.push(part);
					continue;
				}
				const blob = await fetchAttachment(
					part.contentUrl,
					getToken,
					`${part.mediaType}/${part.mediaSubtype}`.toLowerCase(),
				);
				if (stopped) return;
				const url = URL.createObjectURL(blob);
				urls.push(url);
				result.push({ ...part, contentUrl: url });
			}
			if (!stopped) setResolved({ source: parts, parts: result });
		})().catch((cause: unknown) => {
			if (!stopped) {
				runtime.report(cause);
			}
		});
		return () => {
			stopped = true;
			for (const url of urls) URL.revokeObjectURL(url);
		};
	}, [parts, getToken]);
	return {
		parts: getOfflineRuntime()
			? ((resolved && resolved.source === parts ? resolved.parts : undefined) ??
				parts?.map((part) =>
					part.contentId ? { ...part, contentUrl: "" } : part,
				))
			: parts,
	};
};
