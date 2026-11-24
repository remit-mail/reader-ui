import { ownParts } from "@remit/data-ports/message-parts";

export type BodyContentKind = "html" | "text";

export interface RenderableBodyPart {
	partPath: string;
	mediaType: string;
	mediaSubtype: string;
	disposition?: string;
	contentUrl: string;
	isMultipart: boolean;
	sizeOctets?: number;
}

export interface PickedBodyPart {
	kind: BodyContentKind;
	contentUrl: string;
	sizeOctets?: number;
}

export const pickRenderablePart = (
	parts: readonly RenderableBodyPart[],
): PickedBodyPart | null => {
	const renderable = ownParts(parts).filter(
		(p) =>
			!p.isMultipart &&
			p.disposition !== "attachment" &&
			p.mediaType === "TEXT" &&
			p.contentUrl.length > 0,
	);
	const html = renderable.find((p) => p.mediaSubtype.toUpperCase() === "HTML");
	const part =
		html ?? renderable.find((p) => p.mediaSubtype.toUpperCase() === "PLAIN");
	if (!part) return null;
	return {
		kind: html ? "html" : "text",
		contentUrl: part.contentUrl,
		...(part.sizeOctets === undefined ? {} : { sizeOctets: part.sizeOctets }),
	};
};

export type BodyFetchReason =
	| "auth"
	| "link-expired"
	| "body-missing"
	| "content-type-mismatch"
	| "spa-shell-leak"
	| "not-ready"
	| "generic";

export const BODY_FAILURE_REASON_HEADER = "x-remit-403-reason";

/**
 * The reason header distinguishes an expired signature from a missing body or
 * expired session. A bare 403 denotes a missing body, like 404. A 202 means the
 * body is still syncing.
 */
export const classifyBodyFetchFailure = (
	status: number,
	reasonHeader: string | null,
): BodyFetchReason => {
	if (status === 202) return "not-ready";
	const edgeReason = reasonHeader?.trim() ?? "";
	if (status === 403 && edgeReason === "expired") return "link-expired";
	if (
		status === 401 &&
		(!edgeReason ||
			edgeReason === "auth-missing" ||
			edgeReason === "auth-invalid")
	)
		return "auth";
	if (status === 401 || status === 403)
		return edgeReason ? "generic" : "body-missing";
	if (status === 404) return "body-missing";
	return "generic";
};
