import { expect, test } from "playwright/test";
import { weekDay } from "./rack";

const agenda = `/calendar/agenda/${weekDay(0)}`;

test("an event in the strip opens its popup", async ({ page }) => {
	await page.goto(agenda);
	await page.getByRole("button", { name: "Planning" }).first().click();
	await expect(page.getByRole("dialog", { name: "Planning" })).toBeVisible();
});

test("a free stretch opens quick-create on it", async ({ page }) => {
	await page.goto(agenda);
	await page.getByRole("button", { name: /free/ }).first().click();
	await expect(page.getByRole("dialog", { name: "New event" })).toBeVisible();
	await expect(page).toHaveURL(/\/calendar\/agenda\//);
});

test("scrolling rewrites the date by replace, and Back leaves the agenda", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(0)}`);
	await page
		.getByRole("toolbar", { name: "Calendar" })
		.getByLabel("View")
		.selectOption("agenda");
	await expect(page).toHaveURL(/\/calendar\/agenda\//);
	await page.mouse.move(800, 500);
	for (let turn = 0; turn < 8; turn += 1) await page.mouse.wheel(0, 900);
	await expect(page).not.toHaveURL(
		new RegExp(`/calendar/agenda/${weekDay(0)}`),
	);
	await page.goBack();
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(0)}`));
});

test("a day heading opens the day view on that day", async ({ page }) => {
	await page.goto(agenda);
	await page.getByRole("button", { name: /Grid/ }).first().click();
	await expect(page).toHaveURL(/\/calendar\/day\/\d{4}-\d{2}-\d{2}/);
});
