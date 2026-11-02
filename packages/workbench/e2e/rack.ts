import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	calendarEventDetailOperationsDeleteCalendarEvent,
	calendarEventOperationsCreateCalendarEvent,
	calendarEventOperationsListCalendarEvents,
	calendarOperationsListCalendars,
	type RemitImapCalendarResponse,
	type RemitImapCreateCalendarEventInput,
} from "@remit/api-http-client";
import { client } from "@remit/api-http-client/client.gen.ts";

export const RACK_USER = {
	email: "demo@rack.remit.local",
	password: "rack-demo-password",
};

const backend = process.env.RACK_BACKEND_URL ?? "http://localhost:4224";
const origin = process.env.RACK_WEB_URL ?? "http://localhost:4223";

let configured: Promise<void> | undefined;

const statePath = join(
	dirname(fileURLToPath(import.meta.url)),
	".auth/state.json",
);

/** The session global setup stored, so a run signs in once. */
const storedCookie = (): string => {
	if (!existsSync(statePath)) return "";
	const state = JSON.parse(readFileSync(statePath, "utf8")) as {
		cookies: { name: string; value: string }[];
	};
	return state.cookies
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");
};

const signedInCookie = async (): Promise<string> => {
	const stored = storedCookie();
	if (stored !== "") return stored;
	const signIn = await fetch(`${backend}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "content-type": "application/json", origin },
		body: JSON.stringify(RACK_USER),
	});
	if (!signIn.ok) throw new Error(`rack sign-in failed: ${signIn.status}`);
	return signIn.headers
		.getSetCookie()
		.map((line) => line.split(";")[0])
		.join("; ");
};

const configure = async (): Promise<void> => {
	const cookie = await signedInCookie();
	const token = await fetch(`${backend}/api/auth/token`, {
		headers: { cookie },
	});
	const body = (await token.json()) as { token?: string };
	if (!body.token)
		throw new Error(`rack token exchange failed: ${token.status}`);
	client.setConfig({
		baseUrl: backend,
		headers: { authorization: `Bearer ${body.token}` },
	});
};

const ready = (): Promise<void> => {
	configured ??= configure();
	return configured;
};

export async function rackCalendars(): Promise<RemitImapCalendarResponse[]> {
	await ready();
	const { data } = await calendarOperationsListCalendars({
		throwOnError: true,
	});
	return data.items;
}

export async function rackCalendar(urlSegment: string): Promise<string> {
	const found = (await rackCalendars()).find(
		(calendar) => calendar.urlSegment === urlSegment,
	);
	if (!found)
		throw new Error(`no rack calendar ${urlSegment}; run npm run rack -- seed`);
	return found.calendarId;
}

export async function createRackEvent(
	input: RemitImapCreateCalendarEventInput,
): Promise<void> {
	await ready();
	await calendarEventOperationsCreateCalendarEvent({
		throwOnError: true,
		body: input,
	});
}

/** Removes every event whose title starts with the prefix, in the window. */
export async function deleteRackEvents(
	prefix: string,
	from: string,
	to: string,
): Promise<void> {
	await ready();
	const { data } = await calendarEventOperationsListCalendarEvents({
		throwOnError: true,
		query: { from, to },
	});
	const doomed = new Map<string, string>();
	for (const item of data.items) {
		if (item.summary.startsWith(prefix))
			doomed.set(item.calendarObjectId, item.calendarId);
	}
	for (const [calendarObjectId, calendarId] of doomed) {
		await calendarEventDetailOperationsDeleteCalendarEvent({
			path: { calendarObjectId },
			query: { calendarId },
		});
	}
}

const pad = (value: number): string => String(value).padStart(2, "0");

export const isoDate = (date: Date): string =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Monday of the week holding today, plus a number of days. */
export function weekDay(offset: number): string {
	const date = new Date();
	date.setHours(12, 0, 0, 0);
	date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + offset);
	return isoDate(date);
}

/** A wall-clock time in Amsterdam as an ISO string with its offset. */
export function amsterdam(day: string, time: string): string {
	const probe = new Date(`${day}T${time}:00Z`);
	const zoned = new Date(
		probe.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }),
	);
	const utc = new Date(probe.toLocaleString("en-US", { timeZone: "UTC" }));
	const minutes = Math.round((zoned.getTime() - utc.getTime()) / 60000);
	const sign = minutes < 0 ? "-" : "+";
	const abs = Math.abs(minutes);
	return `${day}T${time}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}
