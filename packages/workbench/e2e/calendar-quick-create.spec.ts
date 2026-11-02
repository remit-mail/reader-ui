import { expect, type Page, test } from "playwright/test";
import { clickSlot, dragRange } from "./grid";
import { amsterdam, deleteRackEvents, weekDay } from "./rack";

const PREFIX = "e2e quick";
const week = `/calendar/week/${weekDay(0)}`;
const quick = (page: Page) => page.getByRole("dialog", { name: "New event" });
const block = (page: Page) => page.locator("[data-draft-block]");
const title = (page: Page) => quick(page).getByLabel("Title");

const cleanUp = () =>
	deleteRackEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);
test.beforeAll(cleanUp);
test.afterAll(cleanUp);

test("a drag opens quick-create on the range, and the live region reads it", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 4, 15 * 60, 16 * 60 + 30);
	await expect(quick(page)).toBeVisible();
	await expect(quick(page).getByLabel("Start time")).toHaveValue("15:00");
	await expect(quick(page).getByLabel("End time")).toHaveValue("16:45");
	await expect(block(page)).toContainText("New event");
	await expect(page.locator("[aria-live='polite']").first()).toContainText(
		"15:00 to 16:45",
	);
	await expect(title(page)).toBeFocused();
});

test("a click selects one hour", async ({ page }) => {
	await page.goto(week);
	await clickSlot(page, 2, 14 * 60 + 15);
	await expect(quick(page).getByLabel("Start time")).toHaveValue("14:15");
	await expect(quick(page).getByLabel("End time")).toHaveValue("15:15");
});

test("the popup sits beside the range and never covers it", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 1, 10 * 60, 11 * 60);
	const range = await block(page).boundingBox();
	const popup = await quick(page).boundingBox();
	if (!range || !popup) throw new Error("nothing on screen");
	const apart =
		popup.x >= range.x + range.width ||
		popup.x + popup.width <= range.x ||
		popup.y >= range.y + range.height ||
		popup.y + popup.height <= range.y;
	expect(apart).toBe(true);
});

test("no API request leaves before Save, and the URL holds still", async ({
	page,
}) => {
	await page.goto(week);
	await expect(page.getByRole("grid", { name: "Time grid" })).toBeVisible();
	const writes: string[] = [];
	page.on("request", (request) => {
		if (request.url().includes("/api/") && request.method() !== "GET")
			writes.push(request.url());
	});
	await dragRange(page, 3, 9 * 60, 10 * 60);
	await title(page).fill("Not saved");
	await quick(page).getByLabel("Location").fill("Nowhere");
	expect(writes).toEqual([]);
	await expect(page).toHaveURL(new RegExp(`${week}$`));
	await page.reload();
	await expect(quick(page)).toHaveCount(0);
});

test("Enter in the title saves and focuses the new event", async ({ page }) => {
	await page.goto(week);
	await dragRange(page, 5, 11 * 60, 12 * 60);
	await title(page).fill(`${PREFIX} saved`);
	await title(page).press("Enter");
	await expect(quick(page)).toHaveCount(0);
	const chip = page.locator("[data-event-id]", { hasText: `${PREFIX} saved` });
	await expect(chip).toBeFocused();
});

test("a second drag moves the popup and keeps the title and the focused field", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 1, 9 * 60, 10 * 60);
	await title(page).fill("Keep me");
	await quick(page).getByLabel("Location").fill("Room 9");
	await quick(page).getByLabel("Location").focus();
	await dragRange(page, 6, 14 * 60, 15 * 60);
	await expect(quick(page)).toHaveCount(1);
	await expect(title(page)).toHaveValue("Keep me");
	await expect(quick(page).getByLabel("Location")).toHaveValue("Room 9");
	await expect(quick(page).getByLabel("Start time")).toHaveValue("14:00");
	await expect(block(page)).toHaveCount(1);
	await expect(block(page)).toContainText("Keep me");
	await expect(quick(page).getByLabel("Location")).toBeFocused();
});

test("an outside click after typing clears popup and range, starts no range, and shows no toast", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	await title(page).fill("Throw me away");
	await clickSlot(page, 5, 18 * 60);
	await expect(quick(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);
	await expect(page.getByText(/undo/i)).toHaveCount(0);
	await clickSlot(page, 5, 18 * 60);
	await expect(quick(page)).toBeVisible();
	await expect(title(page)).toHaveValue("");
});

test("a toolbar press closes the popup and runs", async ({ page }) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	await page
		.getByRole("toolbar", { name: "Calendar" })
		.getByRole("button", { name: "Next week" })
		.click();
	await expect(quick(page)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`/calendar/week/${weekDay(7)}`));
});

test("Esc and close clear popup and range, and focus returns to its origin", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	await page.keyboard.press("Escape");
	await expect(quick(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);
	await expect(page.getByRole("grid", { name: "Time grid" })).toBeFocused();
	await dragRange(page, 2, 9 * 60, 10 * 60);
	await quick(page).getByRole("button", { name: "Close" }).click();
	await expect(quick(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);
});

test("focus lands in the title and Tab wraps inside the popup", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	await expect(title(page)).toBeFocused();
	await quick(page).getByRole("button", { name: "Close" }).focus();
	await page.keyboard.press("Tab");
	await expect(title(page)).toBeFocused();
	await page.keyboard.press("Shift+Tab");
	await expect(
		quick(page).getByRole("button", { name: "Close" }),
	).toBeFocused();
});

test("a header drag moves the popup and keeps the range", async ({ page }) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	const before = await quick(page).boundingBox();
	const range = await block(page).boundingBox();
	const grip = await quick(page).locator("svg").first().boundingBox();
	if (!before || !grip || !range) throw new Error("nothing on screen");
	await page.mouse.move(grip.x + 4, grip.y + 4);
	await page.mouse.down();
	await page.mouse.move(grip.x + 124, grip.y + 64, { steps: 5 });
	await page.mouse.up();
	const after = await quick(page).boundingBox();
	expect(Math.round((after?.x ?? 0) - before.x)).toBe(120);
	expect(await block(page).boundingBox()).toEqual(range);
});

test("Enter on the grid opens quick-create, and Enter on an event opens its popup", async ({
	page,
}) => {
	await page.goto(week);
	const grid = page.getByRole("grid", { name: "Time grid" });
	await grid.focus();
	await page.keyboard.press("Shift+ArrowDown");
	await page.keyboard.press("Shift+ArrowDown");
	await page.keyboard.press("Enter");
	await expect(quick(page)).toBeVisible();
	await page.keyboard.press("Escape");
	const event = page
		.locator("[data-event-id]", { hasText: "Planning" })
		.first();
	await event.focus();
	await page.keyboard.press("Enter");
	await expect(page.getByRole("dialog", { name: "Planning" })).toBeVisible();
});

test("New event opens one hour at the tab stop and focus returns to it", async ({
	page,
}) => {
	await page.goto(`${week}#sidebar`);
	const button = page.getByRole("button", { name: "New event" });
	await button.click();
	await expect(quick(page)).toBeVisible();
	const hour = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		hourCycle: "h23",
		timeZone: "Europe/Amsterdam",
	}).format(new Date());
	await expect(quick(page).getByLabel("Start time")).toHaveValue(`${hour}:00`);
	await page.keyboard.press("Escape");
	await expect(button).toBeFocused();
});

test("a drag from an open event popup opens quick-create", async ({ page }) => {
	await page.goto(week);
	await page
		.locator("[data-event-id]", { hasText: "Planning" })
		.first()
		.click();
	await expect(page.getByRole("dialog", { name: "Planning" })).toBeVisible();
	await dragRange(page, 6, 13 * 60, 14 * 60);
	await expect(page.getByRole("dialog", { name: "Planning" })).toHaveCount(0);
	await expect(quick(page)).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("the calendar picker lists only calendars that accept writes", async ({
	page,
}) => {
	await page.goto(week);
	await dragRange(page, 2, 9 * 60, 10 * 60);
	const options = await quick(page)
		.getByLabel("Calendar")
		.locator("option")
		.allTextContents();
	expect(options.sort()).toEqual(["Calendar", "Personal", "Team", "Work"]);
});
