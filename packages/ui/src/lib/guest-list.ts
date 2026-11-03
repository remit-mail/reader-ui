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

/**
 * The guests a Guests field holds, read from its text: entries split on comma,
 * semicolon or line break, blanks dropped, and a second entry for an address
 * already listed dropped too.
 */
export function parseGuestList(text: string): GuestEntry[] {
	const seen = new Set<string>();
	const guests: GuestEntry[] = [];
	for (const part of text.split(/[,;\n]/)) {
		if (part.trim() === "") continue;
		const guest = parseGuest(part);
		if (guest.valid && seen.has(guest.email)) continue;
		if (guest.valid) seen.add(guest.email);
		guests.push(guest);
	}
	return guests;
}

/** The field text for a list of guests, the inverse of `parseGuestList`. */
export function formatGuestList(guests: readonly GuestEntry[]): string {
	return guests
		.map((guest) =>
			guest.valid && guest.displayName !== guest.email
				? `${guest.displayName} <${guest.email}>`
				: guest.text,
		)
		.join(", ");
}

/** The first entry that is not an email address, which blocks a save. */
export function invalidGuest(text: string): GuestEntry | undefined {
	return parseGuestList(text).find((guest) => !guest.valid);
}
