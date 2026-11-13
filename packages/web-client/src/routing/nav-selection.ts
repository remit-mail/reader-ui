import { useLocation, useParams } from "@tanstack/react-router";
import { locationIsOnList } from "../lib/mail-route";

const LABEL_NAV_PREFIX = "label:";

/** The nav id of a label's entry. Mailbox ids are UUIDs, so the prefix never collides. */
export function labelNavId(labelId: string): string {
	return `${LABEL_NAV_PREFIX}${labelId}`;
}

/** The label a nav id names, or `undefined` when it names something else. */
export function labelIdOfNavId(navId: string): string | undefined {
	return navId.startsWith(LABEL_NAV_PREFIX)
		? navId.slice(LABEL_NAV_PREFIX.length)
		: undefined;
}

/**
 * The nav entry the address selects, or `""` where none does.
 *
 *   - `/settings/*` → "settings"
 *   - `/calendar/*` → "calendar"
 *   - `/mail/outbox`, `/mail/flagged`, `/mail/brief` → that list
 *   - `/mail/label/$labelId` → the label's nav id
 *   - `/mail/$mailboxId` → the mailbox id, which is what the sidebar keys on
 *
 * Read off the pathname rather than the matches: the router commits the new
 * location before it swaps them, so the entry the reader just tapped highlights
 * on the tap instead of when its list finishes loading.
 */
export function useSelectedNavId(): string {
	const { pathname } = useLocation();
	const mailbox = useParams({ from: "/mail/$mailboxId", shouldThrow: false });
	const label = useParams({ from: "/mail/label/$labelId", shouldThrow: false });

	if (locationIsOnList(pathname, "/settings")) return "settings";
	if (locationIsOnList(pathname, "/calendar")) return "calendar";
	if (locationIsOnList(pathname, "/mail/outbox")) return "outbox";
	if (locationIsOnList(pathname, "/mail/flagged")) return "flagged";
	if (locationIsOnList(pathname, "/mail/brief")) return "brief";
	if (label?.labelId) return labelNavId(label.labelId);
	return mailbox?.mailboxId ?? "";
}
