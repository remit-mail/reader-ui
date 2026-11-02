import { expect, type Page, test } from "playwright/test";
import { weekDay } from "./rack";

const hamburger = (page: Page) =>
	page
		.getByRole("toolbar", { name: "Calendar" })
		.getByRole("button", { name: "Side pane" });
const pane = (page: Page) =>
	page.getByRole("region", { name: "Calendar side pane" });

test("the hamburger writes #sidebar by replace and survives a reload", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	await expect(pane(page)).toBeVisible();
	await page.goto(`/calendar/week/${weekDay(7)}#sidebar`);
	await hamburger(page).click();
	await expect(pane(page)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(7)}$`));
	await expect(page.getByRole("button", { name: "New event" })).toBeVisible();
	await page.reload();
	await expect(pane(page)).toHaveCount(0);
	await hamburger(page).click();
	await expect(page).toHaveURL(/#sidebar$/);
	await page.goBack();
	await expect(page).toHaveURL(
		new RegExp(`/calendar/week/${weekDay(0)}#sidebar$`),
	);
});

test("an empty fragment follows this device's last choice", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	await hamburger(page).click();
	await page.goto(`/calendar/week/${weekDay(0)}`);
	await expect(pane(page)).toHaveCount(0);
	await hamburger(page).click();
	await page.goto(`/calendar/week/${weekDay(0)}`);
	await expect(pane(page)).toBeVisible();
});

test("aria-expanded flips and focus stays on the hamburger", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	await expect(hamburger(page)).toHaveAttribute("aria-expanded", "true");
	await expect(hamburger(page)).toHaveAttribute(
		"aria-controls",
		"calendar-side-pane",
	);
	await hamburger(page).click();
	await expect(hamburger(page)).toHaveAttribute("aria-expanded", "false");
	await expect(hamburger(page)).toBeFocused();
});

test("a mini month day moves the grid, and its arrows leave the grid put", async ({
	page,
}) => {
	await page.goto("/calendar/week/2026-11-04#sidebar");
	const month = pane(page).getByRole("region", { name: "November 2026" });
	await month.getByRole("button", { name: /\b18 November 2026/ }).click();
	await expect(page).toHaveURL(/\/calendar\/week\/2026-11-18#sidebar$/);
	await pane(page).getByRole("button", { name: "Next month" }).click();
	await expect(
		pane(page).getByRole("region", { name: "December 2026" }),
	).toBeVisible();
	await expect(page).toHaveURL(/\/calendar\/week\/2026-11-18#sidebar$/);
});

test("mini month days are buttons named by their full date", async ({
	page,
}) => {
	const today = new Date();
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	const current = pane(page).locator('button[aria-current="date"]');
	await expect(current).toHaveCount(1);
	await expect(current).toHaveAccessibleName(
		new RegExp(`${today.getDate()} \\w+ ${today.getFullYear()}`),
	);
});

test("clearing a calendar hides its events and writes calendarId", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	await expect(page.getByText("Planning").first()).toBeVisible();
	await pane(page)
		.getByRole("checkbox", { name: "Team" })
		.uncheck({ force: true });
	await expect(page).toHaveURL(/calendarId=/);
	await expect(page).not.toHaveURL(/calendarId=[^&#]*team/i);
	await expect(page.getByText("Planning")).toHaveCount(0);
});

test("calendarId in the URL ticks only those calendars", async ({ page }) => {
	await page.goto(`/calendar/week/${weekDay(0)}#sidebar`);
	await pane(page)
		.getByRole("checkbox", { name: "Team" })
		.uncheck({ force: true });
	const url = page.url();
	await page.goto(url);
	await expect(
		pane(page).getByRole("checkbox", { name: "Team" }),
	).not.toBeChecked();
	await expect(
		pane(page).getByRole("checkbox", { name: "Work" }),
	).toBeChecked();
});
