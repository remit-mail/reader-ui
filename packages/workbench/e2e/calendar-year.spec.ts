import { expect, test } from "playwright/test";
import { isoDate, weekDay } from "./rack";

test("twelve months with week numbers, today marked and busy days named by their count", async ({
	page,
}) => {
	await page.goto(`/calendar/year/${weekDay(0)}`);
	const year = page.locator("[data-calendar-year]");
	await expect(year.getByRole("table")).toHaveCount(12);
	await expect(
		year.locator('button[aria-current="date"]'),
	).toHaveAccessibleName(/\d+ events?$/);
	await expect(
		year.getByRole("button", { name: /, [1-9]\d* events?$/ }).first(),
	).toBeVisible();
	await expect(
		page.getByRole("toolbar", { name: "Calendar" }).getByText(/^Week \d+$/),
	).toHaveCount(0);
});

test("a day opens the day view, and the arrows move a year", async ({
	page,
}) => {
	await page.goto(`/calendar/year/${weekDay(0)}`);
	await page
		.getByRole("toolbar", { name: "Calendar" })
		.getByRole("button", { name: "Next year" })
		.click();
	const next = String(new Date().getFullYear() + 1);
	await expect(page).toHaveURL(new RegExp(`/calendar/year/${next}-`));
	await page.goBack();
	await page
		.locator("[data-calendar-year]")
		.locator('button[aria-current="date"]')
		.click();
	await expect(page).toHaveURL(
		new RegExp(`/calendar/day/${isoDate(new Date())}`),
	);
});
