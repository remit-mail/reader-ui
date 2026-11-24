/**
 * Pick the renderable body part from a `describeMessage` BodyPartResponse list
 * and fetch its content via CloudFront. The legacy inlined `bodyText` /
 * `bodyHtml` fields were removed in #224 PR 3 — body content lives at the
 * per-part `contentUrl`, JWT-authorized at the edge.
 *
 * Pure helpers (no React) so they can be unit-tested against the generated
 * type without standing up jsdom or DOMPurify.
 */

import { ownParts } from "@remit/data-ports/message-parts";

export type BodyContentKind = "html" | "text";

export interface RenderableBodyPart {
	partPath: string;
	mediaType: string;
	mediaSubtype: string;
	disposition?: string;
	contentUrl: string;
	isMultipart: boolean;
}

export interface PickedBodyPart {
	kind: BodyContentKind;
	contentUrl: string;
}

/**
 * Pick the best body part to render: prefer the first inline `text/html`,
 * fall back to the first inline `text/plain`. Multipart container rows and
 * attachment-disposition parts are ignored — they carry no renderable
 * payload at this position — and so are the parts of a forwarded message. Returns `null` when nothing renderable is
 * available so callers can show an empty-body affordance.
 */
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
	if (html) return { kind: "html", contentUrl: html.contentUrl };
	const text = renderable.find((p) => p.mediaSubtype.toUpperCase() === "PLAIN");
	if (text) return { kind: "text", contentUrl: text.contentUrl };
	return null;
};

/**
 * Discriminated reason for a body-fetch failure. The SPA uses this to render
 * a diagnostic banner instead of a generic "Failed to load (403 Forbidden)"
 * string (issue #401 / postmortem #394).
 *
 * - `auth` — confirmed authentication refusal (401 with no reason, or an
 *             explicit auth-missing/auth-invalid reason).
 * - `link-expired` — the signed content URL expired; describeMessage renews it.
 * - `body-missing` — CloudFront returned a 403/404 with no edge reason header,
 *             which means the request passed the JWT check and S3 had no
 *             object at that key. The S3 bucket policy (OAC) only grants
 *             `s3:GetObject`, so a missing key surfaces as 403 instead of 404
 *             — both shapes are normalised to `body-missing` here.
 * - `content-type-mismatch` — server returned text/html for a plain-text part
 *             (defensive guard against a misconfigured edge or bucket-policy
 *             bypass smuggling HTML into the renderer).
 * - `spa-shell-leak` — CloudFront 403/404 fallback rewrote the response into
 *             the SPA shell HTML. The infra fix (#310) prevents this; this
 *             guard catches a regression.
 * - `not-ready` — the body is not synced yet. The content route answers 202 +
 *             `Retry-After` while the worker (re)fetches it from IMAP; the query
 *             retries on this reason and only surfaces a banner if it never
 *             lands.
 * - `generic` — any other non-2xx, or a fetch-level failure (e.g. offline).
 */
export type BodyFetchReason =
	| "auth"
	| "link-expired"
	| "body-missing"
	| "content-type-mismatch"
	| "spa-shell-leak"
	| "not-ready"
	| "generic";

/**
 * Classify a fetch response into a `BodyFetchReason`. Pure so the
 * discrimination can be unit-tested without mocking the network.
 *
 * - 401 → `auth` unless a content-signature refusal is named.
 * - 403 expired → `link-expired`; other named refusals → `generic`.
 * - 403/404 without the reason header → `body-missing` (S3 origin response).
 * - Anything else → `generic`.
 *
 * Known corner case: CloudFront itself can emit a bare 403 for WAF block,
 * geo-restriction, or signed-URL/cookie failures (none of which we use
 * today, but a future WAF attachment would change that). Those bare-403s
 * also lack `x-remit-403-reason` and therefore classify as `body-missing` —
 * misleading copy, but the user-facing fix is the same in practice
 * (contact support / check status). If WAF is ever added on `/content/*`,
 * revisit and either set a distinct header on the WAF deny or branch on
 * the `X-Amz-Cf-Id` / `Server: CloudFront` headers.
 */
export const classifyBodyFetchFailure = (
	status: number,
	reasonHeader: string | null,
): BodyFetchReason => {
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
