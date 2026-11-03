import {
	accountOperationsCreateAccount,
	calendarEventOperationsCreateCalendarEvent,
	calendarEventOperationsListCalendarEvents,
	calendarOperationsCreateCalendar,
	calendarOperationsListCalendars,
	configOperationsGetConfig,
	type RemitImapCalendarColor,
	type RemitImapCreateCalendarEventInput,
} from "@remit/api-http-client";
import { client } from "@remit/api-http-client/client.gen.ts";

const required = (name: string): string => {
	const value = process.env[name];
	if (!value) throw new Error(`set ${name} to seed the e2e account`);
	return value;
};

const backend = required("E2E_BACKEND_URL");
const origin = required("E2E_WEB_URL");
const timeZone = "Europe/Amsterdam";
const credentials = {
	name: "E2E Demo",
	email: required("E2E_EMAIL"),
	password: required("E2E_PASSWORD"),
};

const cookieOf = (response: Response): string =>
	response.headers
		.getSetCookie()
		.map((cookie) => cookie.split(";")[0])
		.join("; ");

const authPost = (path: string, body: object): Promise<Response> =>
	fetch(`${backend}/api/auth/${path}`, {
		method: "POST",
		headers: { "content-type": "application/json", origin },
		body: JSON.stringify(body),
	});

const session = async (): Promise<string> => {
	const signIn = await authPost("sign-in/email", credentials);
	if (signIn.ok) return cookieOf(signIn);
	const signUp = await authPost("sign-up/email", credentials);
	if (!signUp.ok) {
		throw new Error(`sign-up failed: ${signUp.status} ${await signUp.text()}`);
	}
	return cookieOf(signUp);
};

const bearer = async (cookie: string): Promise<string> => {
	const response = await fetch(`${backend}/api/auth/token`, {
		headers: { cookie },
	});
	const body = (await response.json()) as { token?: string };
	if (!response.ok || !body.token) {
		throw new Error(`token exchange failed: ${response.status}`);
	}
	return body.token;
};

const pad = (value: number): string => String(value).padStart(2, "0");

const day = (offset: number): Date => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + offset);
	return date;
};

const isoDate = (date: Date): string =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const at = (offset: number, hour: number, minute = 0): string => {
	const local = `${isoDate(day(offset))}T${pad(hour)}:${pad(minute)}:00`;
	const probe = new Date(`${local}Z`);
	const zoned = new Date(probe.toLocaleString("en-US", { timeZone }));
	const utc = new Date(probe.toLocaleString("en-US", { timeZone: "UTC" }));
	const minutes = Math.round((zoned.getTime() - utc.getTime()) / 60000);
	const sign = minutes < 0 ? "-" : "+";
	const abs = Math.abs(minutes);
	return `${local}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

const ensureCalendar = async (
	displayName: string,
	urlSegment: string,
	color: RemitImapCalendarColor,
): Promise<string> => {
	const { data } = await calendarOperationsListCalendars({
		throwOnError: true,
	});
	const existing = data.items.find((item) => item.urlSegment === urlSegment);
	if (existing) return existing.calendarId;
	const created = await calendarOperationsCreateCalendar({
		throwOnError: true,
		body: { displayName, urlSegment, color, timezone: timeZone },
	});
	return created.data.calendarId;
};

/**
 * The shell sends a reader with no mail account to onboarding, so the e2e
 * account holds one. Nothing listens on its IMAP port; the account only has to exist.
 */
const ensureMailAccount = async (): Promise<void> => {
	const { data } = await configOperationsGetConfig({ throwOnError: true });
	if ((data.accounts ?? []).length > 0) return;
	await accountOperationsCreateAccount({
		throwOnError: true,
		body: {
			email: credentials.email,
			displayName: credentials.name,
			password: credentials.password,
			imapHost: "localhost",
			imapPort: 3143,
			imapTls: false,
			imapStartTls: false,
			smtpEnabled: false,
		},
	});
};

const timed = (
	calendarId: string,
	summary: string,
	offset: number,
	start: [number, number],
	end: [number, number],
	extra: Partial<RemitImapCreateCalendarEventInput> = {},
): RemitImapCreateCalendarEventInput => ({
	calendarId,
	summary,
	start: at(offset, ...start),
	end: at(offset, ...end),
	timeZone,
	...extra,
});

const allDay = (
	calendarId: string,
	summary: string,
	offset: number,
	days: number,
): RemitImapCreateCalendarEventInput => ({
	calendarId,
	summary,
	start: isoDate(day(offset)),
	end: isoDate(day(offset + days)),
	allDay: true,
});

const main = async (): Promise<void> => {
	const token = await bearer(await session());
	client.setConfig({
		baseUrl: backend,
		headers: { authorization: `Bearer ${token}` },
	});

	await ensureMailAccount();
	const work = await ensureCalendar("Work", "work", "Cal1");
	const home = await ensureCalendar("Personal", "personal", "Cal3");
	const team = await ensureCalendar("Team", "team", "Cal5");

	const { data: listed } = await calendarEventOperationsListCalendarEvents({
		throwOnError: true,
		query: { from: at(-7, 0), to: at(21, 0) },
	});
	if (listed.items.length > 0) {
		console.log(
			`e2e-seed: ${credentials.email} already holds ${listed.items.length} events`,
		);
		return;
	}

	const events: RemitImapCreateCalendarEventInput[] = [];
	for (const week of [-7, 0, 7, 14]) {
		events.push(
			timed(work, "Standup", week, [9, 30], [9, 45]),
			timed(work, "Standup", week + 1, [9, 30], [9, 45]),
			timed(work, "Standup", week + 2, [9, 30], [9, 45]),
			timed(work, "Standup", week + 3, [9, 30], [9, 45]),
			timed(work, "Standup", week + 4, [9, 30], [9, 45]),
			timed(team, "Planning", week, [10, 0], [11, 30], {
				location: "Room 3",
			}),
			timed(home, "Gym", week + 1, [18, 0], [19, 0]),
			timed(home, "Gym", week + 3, [18, 0], [19, 0]),
		);
	}
	events.push(
		timed(work, "Design review: calendar", 1, [14, 0], [15, 0], {
			description: "Walk through the calendar rebuild on a phone.",
			location: "Video call",
		}),
		timed(work, "1:1", 2, [11, 0], [11, 30]),
		timed(team, "Overlapping sync A", 2, [13, 0], [14, 0]),
		timed(team, "Overlapping sync B", 2, [13, 30], [14, 30]),
		timed(home, "Dinner with friends", 4, [19, 30], [22, 0], {
			location: "De Kas",
		}),
		timed(work, "Late deploy window", 3, [22, 0], [23, 30], {
			transparency: "Transparent",
		}),
		timed(team, "Offsite (tentative)", 9, [9, 0], [17, 0], {
			status: "Tentative",
		}),
		timed(work, "Cancelled retro", 4, [15, 0], [16, 0], {
			status: "Cancelled",
		}),
		allDay(home, "Holiday", 5, 2),
		allDay(team, "Conference", 15, 3),
		allDay(work, "Release day", 3, 1),
	);

	for (const body of events) {
		await calendarEventOperationsCreateCalendarEvent({
			throwOnError: true,
			body,
		});
	}
	console.log(
		`e2e-seed: ${events.length} events in 3 calendars for ${credentials.email}`,
	);
};

await main();
