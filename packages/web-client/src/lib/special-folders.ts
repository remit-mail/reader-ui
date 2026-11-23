import type { FolderRole } from "@remit/ui";
import { CANONICAL_TO_NAV_ROLE } from "./folder-roles";

export const SPECIAL_FOLDER_ROLES = [
	"trash",
	"sent",
	"drafts",
	"archive",
] as const satisfies readonly FolderRole[];

// Name only unresolved sources: Detected and any future resolved sources
// must not raise this prompt.
export function hasUnresolvedSpecialFolders(
	appointments: readonly { role: string; source: string }[],
): boolean {
	return SPECIAL_FOLDER_ROLES.some((role) => {
		const source =
			appointments.find(
				(appointment) => CANONICAL_TO_NAV_ROLE[appointment.role] === role,
			)?.source ?? "None";
		return source === "Proposed" || source === "Stale" || source === "None";
	});
}
