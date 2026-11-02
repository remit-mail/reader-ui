import { expect, test } from "playwright/test";
import { isoDate } from "./rack";

const apps = (page: import("playwright/test").Page) =>
	page.getByRole("navigation", { name: "Apps" });

test("the app bar opens this week and keeps the panes", async ({ page }) => {
	await page.goto("/mail/brief#intelligence");
	await apps(page).getByRole("link", { name: "Calendar" }).click();
	await expect(page).toHaveURL(
		new RegExp(`/calendar/week/${isoDate(new Date())}.*#intelligence`),
	);
	await expect(
		apps(page).getByRole("link", { name: "Calendar" }),
	).toHaveAttribute("aria-current", "page");
});

test("the app bar returns to mail", async ({ page }) => {
	await page.goto("/calendar");
	await apps(page).getByRole("link", { name: "Mail" }).click();
	await expect(page).toHaveURL(/\/mail\//);
	await expect(apps(page).getByRole("link", { name: "Mail" })).toHaveAttribute(
		"aria-current",
		"page",
	);
});

test("arrow keys move focus and the bar is one tab stop", async ({ page }) => {
	await page.goto("/mail/brief");
	const mail = apps(page).getByRole("link", { name: "Mail" });
	const calendar = apps(page).getByRole("link", { name: "Calendar" });
	await mail.focus();
	await page.keyboard.press("ArrowDown");
	await expect(calendar).toBeFocused();
	await expect(mail).toHaveAttribute("tabindex", "-1");
	await page.keyboard.press("ArrowUp");
	await expect(mail).toBeFocused();
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/\/calendar\/week\//);
});
