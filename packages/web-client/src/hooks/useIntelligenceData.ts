import { addressOperationsSearchAddressesOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapAddressResponse,
	RemitImapThreadMessageResponse,
} from "@remit/api-http-client/types.gen.ts";
import type {
	AuthenticityIntel,
	IntelligenceData,
	PlacementIntel,
	SenderFlagsIntel,
	SenderIntel,
} from "@remit/ui";
import { isThreadCategory } from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { isServerError } from "../lib/error-classifier";
import { formatDate } from "../lib/format";
import {
	pickSenderAddress,
	senderAddressSearchQuery,
} from "../lib/sender-address";

/**
 * Format a creation timestamp as a human-readable "first seen" label.
 * - Today: "today"
 * - Otherwise: "Jan 2025"
 */
function formatFirstSeenLabel(createdAtMs: number): string {
	const d = new Date(createdAtMs);
	const now = new Date();
	if (d.toDateString() === now.toDateString()) return "today";
	return formatDate(d, { month: "short", year: "numeric" });
}

/**
 * A sender address we cannot read: empty, missing the `@`, or whose domain
 * part carries no dot (catches placeholders like `missing_domain` and other
 * junk). Structural — never a hard-coded literal.
 */
export function isSenderAddressUnverifiable(
	fromEmail: string | undefined,
): boolean {
	if (!fromEmail) return true;
	const [, domain] = fromEmail.split("@");
	if (!domain) return true;
	return !domain.includes(".");
}

const NO_SIGNAL_SUMMARY =
	"We can't verify the sender of this email, which could mean it's from an insecure source.";

const UNREADABLE_SENDER_SUMMARY =
	"We couldn't read this sender's address, so we can't confirm who really sent this message.";

/**
 * Build category intel from the thread message and address lookup.
 *
 * The row's category is a string the API chose, so it is narrowed rather than
 * asserted: a value this build has no entry for — a category a newer server
 * classifies into — resolves to `uncategorized`, which is the taxonomy's own
 * name for "no classification this client can act on" and renders a readable
 * neutral chip. Asserting instead would leave the chip with no tone at all.
 */
export function buildCategoryIntel(
	thread: RemitImapThreadMessageResponse,
	address: RemitImapAddressResponse | undefined,
): IntelligenceData["category"] {
	const served = thread.category ?? "personal";
	return {
		value: isThreadCategory(served) ? served : "uncategorized",
		overridden:
			address?.flags?.category?.value != null &&
			address.flags.category.value !== thread.category,
	};
}

/**
 * Build sender intel from the thread message and address lookup.
 *
 * Engagement counters (`inboundCount`/`replyCount`) are passed through
 * as-is from the address response. When absent (`undefined`) they remain
 * `undefined` so the `SenderCard` engagement clause is suppressed rather
 * than rendering a misleading "0 received" next to an earned trust badge.
 */
export function buildSenderIntel(
	thread: RemitImapThreadMessageResponse,
	address: RemitImapAddressResponse | undefined,
): SenderIntel {
	return {
		name: thread.fromName ?? thread.fromEmail ?? "Unknown",
		email: thread.fromEmail ?? "",
		trust: thread.senderTrust,
		firstSeenLabel: address
			? formatFirstSeenLabel(address.createdAt)
			: "unknown",
		// Pass counters through as-is. undefined stays undefined so the panel
		// suppresses the engagement clause when data is absent.
		inboundCount: address?.inboundCount,
		replyCount: address?.replyCount,
		addressUnverified: isSenderAddressUnverifiable(thread.fromEmail),
	};
}

/**
 * Build sender flags from the address response.
 */
function buildSenderFlags(
	address: RemitImapAddressResponse | undefined,
): SenderFlagsIntel {
	if (!address?.flags) return {};
	return {
		vip: address.flags.vip?.value === true,
		muted: address.flags.muted?.value === true,
		blocked: address.flags.blocked?.value === true,
	};
}

/** The brand the display name asserts, or `undefined` when it asserts none. */
function claimedBrandOf(
	thread: RemitImapThreadMessageResponse,
): string | undefined {
	if (!thread.fromName) return undefined;
	if (thread.fromName === thread.fromEmail) return undefined;
	return thread.fromName;
}

/** Build authenticity intel from the thread message's authenticity field. */
export function buildAuthenticityIntel(
	thread: RemitImapThreadMessageResponse,
): AuthenticityIntel {
	if (isSenderAddressUnverifiable(thread.fromEmail)) {
		return {
			verdict: "mismatch",
			fromDomain: "",
			addressUnreadable: true,
			summary: UNREADABLE_SENDER_SUMMARY,
		};
	}

	const auth = thread.authenticity;
	if (!auth) {
		return {
			verdict: "caution",
			fromDomain: thread.fromEmail?.split("@")[1] ?? "",
			summary: NO_SIGNAL_SUMMARY,
		};
	}
	if (!auth.dkimMismatch) {
		return {
			verdict: "aligned",
			fromDomain: auth.fromDomain,
			dkimDomain: auth.dkimDomain,
			summary: auth.dkimDomain
				? `This message was signed by ${auth.dkimDomain}.`
				: `Nothing looks unusual about this sender.`,
		};
	}

	const fromDomain = auth.fromDomain;
	const dkimDomain = auth.dkimDomain;
	const claimedBrand = claimedBrandOf(thread);
	// dkimDomain is known whenever a mismatch was named against a real
	// domain; the fallback covers the (defensive, not currently reachable)
	// case where a mismatch fires with none — say what actually happened
	// (a signature failed to verify) rather than inventing a sender identity
	// we do not have.
	const whatHappened = dkimDomain
		? `it was actually sent from ${dkimDomain}`
		: "its signature failed to verify";
	const summary = claimedBrand
		? `The display name claims "${claimedBrand}", but ${whatHappened}${dkimDomain ? ` — not ${fromDomain}` : ""}. Real senders use their own address.`
		: `This message claims to be from ${fromDomain}, but ${whatHappened}.`;
	return {
		verdict: "mismatch",
		fromDomain,
		dkimDomain,
		claimedBrand,
		summary,
	};
}

export function buildPlacementIntel(
	thread: RemitImapThreadMessageResponse,
): PlacementIntel | undefined {
	const verdict = thread.placementVerdict;
	if (!verdict) return undefined;
	return {
		action: verdict.action,
		confidence: verdict.confidence,
		fromPlacement: verdict.fromPlacement,
		reasons: verdict.reasons,
		dryRun: verdict.dryRun,
	};
}

export interface UseIntelligenceDataResult {
	data: Omit<IntelligenceData, "spamAction"> | null;
	/**
	 * True when the address lookup failed with a fatal first-party 5xx. The panel
	 * must not silently render the sender's flags (VIP/muted/blocked) as absent —
	 * that misrepresents the sender's real state. Escalation covers it.
	 */
	addressErrorIsFatal: boolean;
	/**
	 * Address id for the sender — needed for PATCH /addresses/{id} mutations.
	 * `undefined` until the lookup resolves the row for exactly this address;
	 * quick actions that PATCH it must stay unwired until then.
	 */
	addressId: string | undefined;
	/**
	 * Raw address response for the sender — forwarded to the quick-action
	 * mutation hooks so they can optimistically patch the cache.
	 */
	address: RemitImapAddressResponse | undefined;
}

/**
 * Maps a `RemitImapThreadMessageResponse` into `IntelligenceData` for the
 * `IntelligencePanel` component. Two data sources:
 *
 * 1. The thread row itself (already loaded) → sender basics, trust, authenticity, category.
 * 2. `GET /addresses/search?q=<email>` → address flags (VIP/muted/blocked/etc.)
 *    and first-seen timestamp. One round-trip per unique sender.
 */
export function useIntelligenceData(
	thread: RemitImapThreadMessageResponse | null | undefined,
): UseIntelligenceDataResult {
	const senderEmail = thread?.fromEmail ?? null;

	// --- Address lookup: flags + first-seen timestamp ---
	const { data: addressSearchResult, error: addressError } = useQuery({
		...addressOperationsSearchAddressesOptions({
			query: senderAddressSearchQuery(senderEmail ?? undefined),
		}),
		enabled: Boolean(senderEmail),
		staleTime: 30_000,
	});

	const address = pickSenderAddress(
		addressSearchResult?.items,
		senderEmail ?? undefined,
	);

	const data = useMemo((): Omit<IntelligenceData, "spamAction"> | null => {
		if (!thread) return null;

		const sender = buildSenderIntel(thread, address);

		const authenticity = buildAuthenticityIntel(thread);

		const category = buildCategoryIntel(thread, address);

		const flags = buildSenderFlags(address);

		return {
			sender,
			authenticity,
			category,
			flags,
			placement: buildPlacementIntel(thread),
		};
	}, [thread, address]);

	return {
		data,
		addressErrorIsFatal: isServerError(addressError),
		addressId: address?.addressId,
		address,
	};
}
