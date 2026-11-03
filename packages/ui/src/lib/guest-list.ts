/** One guest as the Guests field holds them. */
export interface GuestEntry {
	/** What the reader typed for this guest, kept so an invalid entry can be shown and fixed. */
	text: string;
	email: string;
	/** The name before the address, or the address itself when none was given. */
	displayName: string;
	valid: boolean;
}

const EMAIL = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;
const NAMED = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/;

/** One typed entry: `ann@example.com`, or `Ann Smith <ann@example.com>`. */
export function parseGuest(text: string): GuestEntry {
	const trimmed = text.trim();
	const named = NAMED.exec(trimmed);
	const email = (named?.[2] ?? trimmed).trim().toLowerCase();
	const name = named?.[1]?.trim() ?? "";
	return {
		text: trimmed,
		email,
		displayName: name === "" ? email : name,
		valid: EMAIL.test(email),
	};
}

/** A guest the server already holds, by address and the name it stored. */
export function storedGuest(email: string, displayName: string): GuestEntry {
	return {
		text: email,
		email,
		displayName: displayName === "" ? email : displayName,
		valid: true,
	};
}

/** The list with one more guest, unless that address is already on it. */
export function withGuest(
	guests: readonly GuestEntry[],
	guest: GuestEntry,
): GuestEntry[] {
	if (guest.valid && guests.some((other) => other.email === guest.email))
		return [...guests];
	return [...guests, guest];
}

/** The first entry that is not an email address, which blocks a save. */
export function invalidGuest(
	guests: readonly GuestEntry[],
): GuestEntry | undefined {
	return guests.find((guest) => !guest.valid);
}
