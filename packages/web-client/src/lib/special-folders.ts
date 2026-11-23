import type { RemitImapFolderAppointment } from "@remit/api-http-client/types.gen.ts";
import type { FolderRole, RoleAppointment } from "@remit/ui";
import { CANONICAL_TO_NAV_ROLE } from "./folder-roles";

export const SPECIAL_FOLDER_ROLES = [
	"trash",
	"sent",
	"drafts",
	"archive",
] as const satisfies readonly FolderRole[];

export function specialFolderAppointments(
	appointments: readonly RemitImapFolderAppointment[],
): Record<string, RoleAppointment> {
	const result: Record<string, RoleAppointment> = {};
	for (const appointment of appointments) {
		const role = CANONICAL_TO_NAV_ROLE[appointment.role];
		if (!SPECIAL_FOLDER_ROLES.some((special) => special === role)) continue;
		result[role] = {
			mailboxId: appointment.mailboxId ?? null,
			source: appointment.source,
			staleFolderPath: appointment.staleAppointmentPath,
		};
	}
	return result;
}

// Deliberately name the unresolved sources: future sources such as Detected
// already represent a resolved appointment and must not raise this prompt.
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
