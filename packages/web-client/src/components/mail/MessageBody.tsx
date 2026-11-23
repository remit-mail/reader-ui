import {
	buildCidResolver,
	type CidResolver,
	cn,
	type EmailRenderCategory,
	MessageBodyView,
} from "@remit/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthProvider } from "../../auth/provider";
import { useIsDark } from "../../hooks/useIsDark";
import { useMessageBodyContent } from "../../hooks/useMessageBodyContent";
import { useToggleTrusted } from "../../hooks/useToggleTrusted";
import { fetchAttachment } from "../../lib/attachment-download";
import {
	externalImageBytes,
	requestExternalImage,
} from "../../lib/external-image";
import { getOfflineRuntime } from "../../lib/offline-runtime";
import { getRuntimeConfig } from "../../runtime-config";
import { BlockedImagesNotice } from "./BlockedImagesNotice";
import { MessageBodyErrorBanner } from "./MessageBodyErrorBanner";

/**
 * Subset of the OpenAPI `BodyPartResponse` consumed by this component for
 * inline-image / attachment URL resolution and the body fetcher. Pinning a
 * structural subset avoids a hard import on the generated types so this file
 * compiles before `make` runs in fresh checkouts.
 */
export interface MessageBodyPart {
	bodyPartId: string;
	partPath: string;
	mediaType: string;
	mediaSubtype: string;
	contentId?: string;
	contentUrl: string;
	disposition?: string;
	dispositionFilename?: string;
	isMultipart: boolean;
}

interface MessageBodyProps {
	/**
	 * Body parts from `describeMessage`. The component picks the first
	 * `text/html` part (fallback `text/plain`) and fetches its `contentUrl`
	 * from CloudFront. `cid:CONTENT_ID` references in HTML resolve to other
	 * parts' `contentUrl` via the same list (#224 PR 3).
	 */
	bodyParts?: readonly MessageBodyPart[];
	/**
	 * Local-render fallback for callers that don't have BodyParts (Outbox
	 * drafts, Compose preview). When `bodyParts` is provided, these are
	 * ignored — the component fetches via CloudFront instead.
	 */
	html?: string;
	text?: string;
	/**
	 * Whether the From-address has the `trusted` flag set. Trusted senders
	 * auto-load images. The "Load images" bar is suppressed entirely for
	 * trusted senders. Ignored when `isBlocked` is set.
	 */
	isTrusted?: boolean;
	/**
	 * Whether the From-address has the `blocked` flag set. A blocked sender
	 * never loads images, "even on explicit click" (`BlockedFlag`), so this
	 * suppresses auto-load and removes the manual load affordances rather than
	 * greying them out. Blocked outranks trusted: it is the more restrictive
	 * instruction, and a sender carrying both is still blocked.
	 */
	isBlocked?: boolean;
	/**
	 * The current message id. Required for the body-content query cache key
	 * and by `useToggleTrusted` for the optimistic cache patch.
	 */
	messageId?: string;
	/**
	 * The From-address `addressId`. When omitted (e.g. the envelope has no
	 * parseable From) the "Always trust" button is hidden.
	 */
	fromAddressId?: string;
	/**
	 * Message category (personal/newsletter/marketing/…). Together with
	 * `hasAuthorBackground` this determines whether to apply the framed
	 * newsletter treatment or the plain-email normalization CSS.
	 */
	category?: EmailRenderCategory;
	/**
	 * Extra classes for the `.message-body` wrapper. `MessageCard` leaves this
	 * unset: the kit's `ExpandedMessage` owns the gutter, and runs the sandboxed
	 * email frame out of it so mail renders on its own ground.
	 */
	className?: string;
}

const LoadingSkeleton = () => (
	// biome-ignore lint/a11y/useSemanticElements: <div> with role="status" preserves block layout; <output> is inline
	<div
		className="animate-pulse space-y-2"
		role="status"
		aria-label="Loading message body"
	>
		<div className="h-4 bg-surface-sunken rounded w-full" />
		<div className="h-4 bg-surface-sunken rounded w-11/12" />
		<div className="h-4 bg-surface-sunken rounded w-3/4" />
		<div className="h-4 bg-surface-sunken rounded w-5/6" />
	</div>
);

const EmptyBody = () => (
	<p className="text-fg-muted text-sm italic">
		This message has no body content.
	</p>
);

export const MessageBody = ({
	bodyParts,
	html,
	text,
	isTrusted = false,
	isBlocked = false,
	messageId,
	fromAddressId,
	category,
	className,
}: MessageBodyProps) => {
	// "Load once" is a decision about one message. Reset it when the instance is
	// handed a different message so the grant can't ride along — today every
	// caller keys this component by message, which makes the leak unreachable,
	// but the guarantee should hold structurally rather than by a caller's key.
	const [allowImagesOnce, setAllowImagesOnce] = useState(false);
	const [grantedFor, setGrantedFor] = useState(messageId);
	if (grantedFor !== messageId) {
		setGrantedFor(messageId);
		setAllowImagesOnce(false);
	}
	const allowImages = !isBlocked && (isTrusted || allowImagesOnce);
	const proxyUrl = getRuntimeConfig().externalImageProxyUrl;
	const loadExternalImage = useCallback(
		async (remoteUrl: string) => {
			const resolvedRemoteUrl = new URL(remoteUrl, document.baseURI).href;
			const runtime = getOfflineRuntime();
			return runtime
				? runtime.externalImage(proxyUrl!, resolvedRemoteUrl)
				: externalImageBytes(
						await requestExternalImage(proxyUrl!, resolvedRemoteUrl),
					);
		},
		[proxyUrl],
	);
	const [imageError, setImageError] = useState<unknown>();
	const reportImageError = useCallback((error: unknown) => {
		getOfflineRuntime()?.report(error);
		setImageError(error);
	}, []);
	const isDark = useIsDark();
	// `useToggleTrusted` surfaces its own failure (banner + rollback) and a fatal
	// 5xx escalates globally — no consumer-side error effect needed here.
	const { toggleTrusted, isPending: isTrustPending } = useToggleTrusted({
		messageId: messageId ?? "",
	});

	const hasParts = !!bodyParts && bodyParts.length > 0;
	const {
		picked,
		data: fetched,
		isLoading: isBodyLoading,
		isError: isBodyError,
		error: bodyError,
		refetch: refetchBody,
	} = useMessageBodyContent({
		messageId,
		bodyParts,
		enabled: hasParts,
	});

	const renderedHtml =
		hasParts && fetched?.kind === "html" ? fetched.body : html;
	const renderedText =
		hasParts && fetched?.kind === "text" ? fetched.body : text;

	const { getToken } = useAuthProvider();
	const [inline, setInline] = useState<{
		html: string;
		parts: readonly MessageBodyPart[];
		urls: Map<string, string>;
	}>();
	useEffect(() => {
		const runtime = getOfflineRuntime();
		if (!runtime || !renderedHtml || !bodyParts) return;
		const template = document.createElement("template");
		template.innerHTML = renderedHtml;
		const referenced = new Set(
			[...template.content.querySelectorAll("img[src]")]
				.map((image) => image.getAttribute("src") ?? "")
				.filter((src) => src.startsWith("cid:"))
				.map((src) => src.slice(4).replace(/^<|>$/g, "")),
		);
		let stopped = false;
		const urls = new Map<string, string>();
		const parts = bodyParts.filter(
			(part) =>
				part.mediaType.toLowerCase() === "image" &&
				part.contentId &&
				referenced.has(part.contentId.replace(/^<|>$/g, "")),
		);
		void Promise.all(
			parts.map(async (part) => {
				const blob = await fetchAttachment(
					part.contentUrl,
					getToken,
					`${part.mediaType}/${part.mediaSubtype}`.toLowerCase(),
				).catch((error: unknown) => {
					runtime.report(error);
					return undefined;
				});
				if (blob && !stopped)
					urls.set(
						part.contentId!.replace(/^<|>$/g, ""),
						URL.createObjectURL(blob),
					);
			}),
		).then(() => {
			if (!stopped) setInline({ html: renderedHtml, parts: bodyParts, urls });
		});
		return () => {
			stopped = true;
			for (const url of urls.values()) URL.revokeObjectURL(url);
		};
	}, [renderedHtml, bodyParts, getToken]);
	const resolveCid: CidResolver = useMemo(() => {
		if (!getOfflineRuntime()) return buildCidResolver(bodyParts ?? []);
		return (cid) =>
			inline && inline.html === renderedHtml && inline.parts === bodyParts
				? inline.urls.get(cid.replace(/^<|>$/g, ""))
				: undefined;
	}, [inline, renderedHtml, bodyParts]);

	if (hasParts) {
		if (isBodyLoading) {
			return (
				<div className={cn("message-body", className)}>
					<LoadingSkeleton />
				</div>
			);
		}
		if (isBodyError && !fetched) {
			return (
				<div className={cn("message-body", className)}>
					<MessageBodyErrorBanner
						error={bodyError}
						onRetry={() => refetchBody()}
					/>
				</div>
			);
		}
		if (!picked) {
			return (
				<div className={cn("message-body", className)}>
					<EmptyBody />
				</div>
			);
		}
	} else if (!html && !text) {
		return (
			<div className={cn("message-body", className)}>
				<EmptyBody />
			</div>
		);
	}

	const canAlwaysTrust = Boolean(fromAddressId && messageId);
	const handleAlwaysTrust = () => {
		if (!fromAddressId || isTrustPending) return;
		setAllowImagesOnce(true);
		toggleTrusted(fromAddressId, false);
	};

	// The sanitize → classify → sandboxed-iframe rendering lives in the kit's
	// `MessageBodyView` (the single source of truth, shared with Storybook's
	// reading panes — #940). This component keeps the data orchestration:
	// bodyParts → html/text, the allow-images-once trust state, and the
	// privacy "images blocked" bar (it touches app trust state, so it stays
	// here and is injected via `renderBlockedNotice`).
	return (
		<>
			{isBodyError && fetched && (
				<MessageBodyErrorBanner
					error={bodyError}
					onRetry={() => refetchBody()}
				/>
			)}
			{imageError !== undefined && (
				<MessageBodyErrorBanner error={imageError} />
			)}
			<MessageBodyView
				className={className}
				html={renderedHtml}
				text={renderedText}
				isDark={isDark}
				category={category}
				allowImages={allowImages}
				loadExternalImage={proxyUrl ? loadExternalImage : undefined}
				onImageError={reportImageError}
				resolveCid={resolveCid}
				renderBlockedNotice={(blockedImageCount) => (
					<BlockedImagesNotice
						blockedImageCount={blockedImageCount}
						canAlwaysTrust={canAlwaysTrust}
						isTrustPending={isTrustPending}
						isSenderBlocked={isBlocked}
						onLoadOnce={() => setAllowImagesOnce(true)}
						onAlwaysTrust={handleAlwaysTrust}
					/>
				)}
			/>
		</>
	);
};
