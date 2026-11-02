import { expect, test } from "playwright/test";
import { isoDate, RACK_USER, weekDay } from "./rack";

const toolbar = (page: import("playwright/test").Page) =>
	page.getByRole("toolbar", { name: "Calendar" });

test("a bare /calendar lands on this week", async ({ page }) => {
	await page.goto("/calendar");
	await expect(page).toHaveURL(
		new RegExp(`/calendar/week/${isoDate(new Date())}$`),
	);
	await expect(toolbar(page).getByText(/^Week \d+$/)).toBeVisible();
	await expect(page.getByText("Pick an event to read it here.")).toHaveCount(0);
	await expect(page.getByRole("navigation", { name: "Mailboxes" })).toHaveCount(
		0,
	);
});

test("an unknown view lands on the week of the same date", async ({ page }) => {
	await page.goto("/calendar/fortnight/2026-06-10");
	await expect(page).toHaveURL(/\/calendar\/week\/2026-06-10$/);
});

test("Today returns to the range with today", async ({ page }) => {
	await page.goto("/calendar/week/2026-06-10");
	await toolbar(page).getByRole("button", { name: "Today" }).click();
	await expect(page).toHaveURL(
		new RegExp(`/calendar/week/${isoDate(new Date())}$`),
	);
});

test("the view dropdown rewrites the path on the same date", async ({
	page,
}) => {
	await page.goto("/calendar/week/2026-06-10");
	for (const view of ["day", "month", "year", "agenda", "week"]) {
		await toolbar(page).getByLabel("View").selectOption(view);
		await expect(page).toHaveURL(new RegExp(`/calendar/${view}/2026-06-10`));
	}
});

test("the arrows step one unit, and Back and reload keep the range", async ({
	page,
}) => {
	const monday = weekDay(0);
	await page.goto(`/calendar/week/${monday}`);
	await expect(toolbar(page).getByText(/^Week \d+$/)).toBeVisible();
	const next = toolbar(page).getByRole("button", { name: "Next week" });
	await next.click();
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(7)}$`));
	await next.click();
	await next.click();
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(21)}$`));
	await page.goBack();
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(14)}$`));
	await page.reload();
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(14)}$`));
	await expect(toolbar(page).getByText(/^Week \d+$/)).toBeVisible();
	await toolbar(page).getByLabel("View").selectOption("day");
	await toolbar(page).getByRole("button", { name: "Next day" }).click();
	await expect(page).toHaveURL(new RegExp(`/calendar/day/${weekDay(15)}$`));
});

test("an expired session reaches the global signed-out handling", async ({
	browser,
}) => {
	const context = await browser.newContext({ storageState: undefined });
	const page = await context.newPage();
	await page.goto("/calendar/week/2026-06-10");
	const submit = page.getByRole("button", { name: "Sign in" }).last();
	await expect(submit).toBeVisible();
	await expect(page.getByRole("toolbar", { name: "Calendar" })).toHaveCount(0);
	await page.getByLabel(/email/i).fill(RACK_USER.email);
	await page.getByLabel("Password", { exact: true }).fill(RACK_USER.password);
	await submit.click();
	await expect(page).toHaveURL(/\/calendar\/week\/2026-06-10$/);
	await expect(page.getByRole("toolbar", { name: "Calendar" })).toBeVisible();
	await context.close();
});

test("Glance halves the hour, survives a reload and leaves the URL alone", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}`);
	const columns = page.locator("[data-time-columns]");
	const detail = (await columns.boundingBox())?.height ?? 0;
	await page.getByRole("radio", { name: "Glance" }).check({ force: true });
	await expect
		.poll(async () => (await columns.boundingBox())?.height ?? 0)
		.toBeCloseTo(detail / 2, 0);
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(0)}$`));
	await page.reload();
	await expect(page.getByRole("radio", { name: "Glance" })).toBeChecked();
	await page.getByRole("radio", { name: "Detail" }).check({ force: true });
});
