import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { info, matthijs } from "../test-support/special-folders";
import {
	hasUnresolvedSpecialFolders,
	specialFolderAppointments,
} from "./special-folders";

describe("special folders", () => {
	it("preselects the account's appointments, never guesses from similar names", () => {
		const appointments = specialFolderAppointments(matthijs.folderAppointments);
		assert.equal(appointments.trash.mailboxId, "trash");
		assert.equal(appointments.sent.mailboxId, "sent");
		assert.equal(appointments.drafts.mailboxId, "drafts");
		assert.equal(appointments.archive.mailboxId, "archive");
		assert.equal(appointments.junk, undefined);
		assert.equal(
			specialFolderAppointments(info.folderAppointments).trash.mailboxId,
			"trash",
		);
	});
	for (const source of [
		"Proposed",
		"Stale",
		"None",
		"Flagged",
		"Appointed",
		"Detected",
	]) {
		for (const role of ["Trash", "Sent", "Drafts", "Archive"]) {
			it(`${role} from ${source} ${["Proposed", "Stale", "None"].includes(source) ? "needs confirmation" : "is resolved"}`, () => {
				const appointments = matthijs.folderAppointments.map((appointment) =>
					appointment.role === role ? { ...appointment, source } : appointment,
				);
				assert.equal(
					hasUnresolvedSpecialFolders(appointments),
					["Proposed", "Stale", "None"].includes(source),
				);
			});
		}
	}
	it("includes missing appointments and ignores unresolved Junk and Inbox", () => {
		assert.equal(hasUnresolvedSpecialFolders([]), true);
		assert.equal(hasUnresolvedSpecialFolders(info.folderAppointments), true);
		assert.equal(
			hasUnresolvedSpecialFolders([
				...matthijs.folderAppointments,
				{ role: "Inbox", source: "None" },
			]),
			false,
		);
	});
});
