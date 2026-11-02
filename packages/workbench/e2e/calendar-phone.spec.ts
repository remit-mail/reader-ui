import { expect, test } from "playwright/test";
import { isoDate } from "./rack";

const apps = (page: import("playwright/test").Page) =>
	page.getByRole("navigation", { name: "Apps" });

test.describe("tab bar", () => {
	test("switches apps", async ({ page }) => {
		await page.goto("/mail/brief");
		await apps(page).getByRole("link", { name: "Calendar" }).click();
		await expect(page).toHaveURL(
			new RegExp(`/calendar/(week|day)/${isoDate(new Date())}`),
		);
		await apps(page).getByRole("link", { name: "Mail" }).click();
		await expect(page).toHaveURL(/\/mail\//);
	});

	test("is a landmark with aria-current and 44 px targets", async ({
		page,
	}) => {
		await page.goto("/calendar");
		const calendar = apps(page).getByRole("link", { name: "Calendar" });
		await expect(calendar).toHaveAttribute("aria-current", "page");
		for (const name of ["Mail", "Calendar"]) {
			const box = await apps(page).getByRole("link", { name }).boundingBox();
			expect(box?.width).toBeGreaterThanOrEqual(44);
			expect(box?.height).toBeGreaterThanOrEqual(44);
		}
	});
});
