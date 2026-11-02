import { expect, type Page, test } from "playwright/test";
import { clickSlot } from "./grid";
import {
	amsterdam,
	createRackEvent,
	deleteRackEvents,
	rackCalendar,
	weekDay,
} from "./rack";

const PREFIX = "e2e popup";
const week = `/calendar/week/${weekDay(0)}`;
const popup = (page: Page, name: string | RegExp) =>
	page.getByRole("dialog", { name });
const chip = (page: Page, name: string) =>
	page.locator("[data-event-id]", { hasText: name }).first();

test.beforeAll(async () => {
	await deleteRackEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);
	const work = await rackCalendar("work");
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} one-off`,
		start: amsterdam(weekDay(2), "16:00"),
		end: amsterdam(weekDay(2), "17:00"),
		timeZone: "Europe/Amsterdam",
		location: "Room 5",
	});
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} weekly`,
		start: amsterdam(weekDay(3), "16:00"),
		end: amsterdam(weekDay(3), "16:30"),
		timeZone: "Europe/Amsterdam",
		recurrenceRule: "FREQ=WEEKLY;COUNT=4",
	});
});

test.afterAll(async () => {
	await deleteRackEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);
});

test("a click opens the popup, the path names the event and focus lands on the heading", async ({
	page,
}) => {
	await page.goto(week);
	await chip(page, `${PREFIX} one-off`).click();
	const dialog = popup(page, `${PREFIX} one-off`);
	await expect(dialog).toBeVisible();
	await expect(dialog.getByText("Room 5")).toBeVisible();
	await expect(dialog.getByText(/Work · Busy/)).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`${week}/[0-9a-z-]{8,}`));
	await expect(
		dialog.getByRole("heading", { name: `${PREFIX} one-off` }),
	).toBeFocused();
	await dialog.getByRole("button", { name: "Close" }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${week}$`));
	await expect(chip(page, `${PREFIX} one-off`)).toBeFocused();
});

test("a click on another event swaps the popup", async ({ page }) => {
	await page.goto(week);
	await chip(page, `${PREFIX} one-off`).click();
	await expect(popup(page, `${PREFIX} one-off`)).toBeVisible();
	await chip(page, `${PREFIX} weekly`).click();
	await expect(popup(page, `${PREFIX} weekly`)).toBeVisible();
	await expect(popup(page, `${PREFIX} one-off`)).toHaveCount(0);
	await page.goBack();
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("an outside click, Esc and Back close it and start no range", async ({
	page,
}) => {
	await page.goto(week);
	await chip(page, `${PREFIX} one-off`).click();
	await clickSlot(page, 5, 3 * 60);
	await expect(popup(page, `${PREFIX} one-off`)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${week}$`));
	await expect(page.locator("[data-draft-block]")).toHaveCount(0);

	await chip(page, `${PREFIX} one-off`).click();
	await page.keyboard.press("Escape");
	await expect(popup(page, `${PREFIX} one-off`)).toHaveCount(0);

	await chip(page, `${PREFIX} one-off`).click();
	await expect(popup(page, `${PREFIX} one-off`)).toBeVisible();
	await page.goBack();
	await expect(popup(page, `${PREFIX} one-off`)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("a URL for an event deleted elsewhere says it was deleted or moved", async ({
	page,
}) => {
	const work = await rackCalendar("work");
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} doomed`,
		start: amsterdam(weekDay(4), "16:00"),
		end: amsterdam(weekDay(4), "17:00"),
		timeZone: "Europe/Amsterdam",
	});
	await page.goto(week);
	await chip(page, `${PREFIX} doomed`).click();
	await expect(popup(page, `${PREFIX} doomed`)).toBeVisible();
	const address = page.url();
	await deleteRackEvents(
		`${PREFIX} doomed`,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);
	await page.goto(week);
	await page.goto(address);
	await expect(page.getByText("This event was deleted or moved")).toBeVisible();
	await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
	await page.getByRole("button", { name: "Close" }).click();
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("a repeating event asks the scope before it deletes", async ({ page }) => {
	await page.goto(week);
	await chip(page, `${PREFIX} weekly`).click();
	const dialog = popup(page, `${PREFIX} weekly`);
	await dialog.getByRole("button", { name: "Delete" }).click();
	await dialog.getByRole("button", { name: /This event/ }).click();
	await expect(dialog).toHaveCount(0);
	await expect(chip(page, `${PREFIX} weekly`)).toHaveCount(0);
	await page.goto(`/calendar/week/${weekDay(7)}`);
	await expect(chip(page, `${PREFIX} weekly`)).toBeVisible();
});

test("Delete removes a one-off event", async ({ page }) => {
	await page.goto(week);
	await chip(page, `${PREFIX} one-off`).click();
	await popup(page, `${PREFIX} one-off`)
		.getByRole("button", { name: "Delete" })
		.click();
	await expect(popup(page, `${PREFIX} one-off`)).toHaveCount(0);
	await expect(chip(page, `${PREFIX} one-off`)).toHaveCount(0);
});
