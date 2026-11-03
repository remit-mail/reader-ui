import { expect, type Page, test } from "playwright/test";
import {
	amsterdam,
	calendarIdOf,
	createEvent,
	deleteEvents,
	isoDate,
	weekDay,
} from "./backend";
import { holdAndDrag, slotPoint } from "./grid";

const PREFIX = "e2e phone";
const apps = (page: Page) => page.getByRole("navigation", { name: "Apps" });
const sheet = (page: Page) => page.getByRole("dialog", { name: "New event" });
const block = (page: Page) => page.locator("[data-draft-block]");
const day = `/calendar/week/${weekDay(2)}`;

const cleanUp = () =>
	deleteEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);
test.beforeAll(cleanUp);
test.afterAll(cleanUp);

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

test("a week URL shows the day view", async ({ page }) => {
	await page.goto(day);
	await expect(page.locator("[data-time-columns] [data-date]")).toHaveCount(1);
	await expect(
		page.locator(`[data-time-columns] [data-date="${weekDay(2)}"]`),
	).toHaveCount(1);
});

test("the hamburger opens the slide-over with #nav", async ({ page }) => {
	await page.goto(day);
	await page
		.getByRole("toolbar", { name: "Calendar" })
		.getByRole("button", { name: "Side pane" })
		.click();
	await expect(page).toHaveURL(/#nav$/);
	const nav = page.getByRole("dialog", { name: "Calendars" });
	await expect(nav.getByRole("checkbox", { name: "Work" })).toBeVisible();
	await nav
		.getByRole("button", { name: /\b10 \w+ 2026/ })
		.first()
		.click();
	await expect(nav).toHaveCount(0);
});

test("+ opens the sheet at the tab stop, with focus in the title", async ({
	page,
}) => {
	await page.goto(day);
	await page.getByRole("button", { name: "New event" }).click();
	await expect(sheet(page)).toBeVisible();
	await expect(sheet(page).getByLabel("Title")).toBeFocused();
	await expect(apps(page)).toBeVisible();
});

test("a hold drops a block, a drag stretches it, and release opens the sheet above which the block stays", async ({
	page,
}) => {
	await page.goto(day);
	const from = await slotPoint(page, 0, 10 * 60, 1);
	await holdAndDrag(page, from, { x: from.x, y: from.y + 48 }, 650);
	await expect(sheet(page)).toBeVisible();
	await expect(sheet(page).getByLabel("Start time")).toHaveValue("10:00");
	await expect(sheet(page).getByLabel("End time")).toHaveValue("12:00");
	const range = await block(page).boundingBox();
	const card = await sheet(page).boundingBox();
	expect((range?.y ?? 0) + (range?.height ?? 0)).toBeLessThanOrEqual(
		card?.y ?? 0,
	);
});

test("a scroll drops no block", async ({ page }) => {
	await page.goto(day);
	const from = await slotPoint(page, 0, 12 * 60, 1);
	await holdAndDrag(page, from, { x: from.x, y: from.y - 150 }, 50);
	await expect(block(page)).toHaveCount(0);
	await expect(sheet(page)).toHaveCount(0);
});

test("a swipe down, a tap above and Back clear the sheet and block", async ({
	page,
}) => {
	await page.goto(`/calendar/week/${weekDay(1)}`);
	await page
		.getByRole("toolbar", { name: "Calendar" })
		.getByRole("button", { name: "Next day" })
		.click();
	await expect(page).toHaveURL(/\/calendar\/week\//);
	const open = async () => {
		const from = await slotPoint(page, 0, 10 * 60, 1);
		await holdAndDrag(page, from, from, 650);
		await expect(sheet(page)).toBeVisible();
		await sheet(page).getByLabel("Title").fill("Throw away");
	};
	await open();
	const grabber = await page.locator("[data-sheet-grabber]").boundingBox();
	if (!grabber) throw new Error("no grabber");
	await holdAndDrag(
		page,
		{ x: grabber.x + 20, y: grabber.y + 5 },
		{ x: grabber.x + 20, y: grabber.y + 200 },
		20,
	);
	await expect(sheet(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);

	await open();
	const above = await slotPoint(page, 0, 9 * 60, 1);
	await page.touchscreen.tap(above.x, above.y - 30);
	await expect(sheet(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);

	await open();
	await page.goBack();
	await expect(sheet(page)).toHaveCount(0);
	await expect(block(page)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${day}$`));
	await expect(page.getByText(/undo/i)).toHaveCount(0);
});

test("More options opens the full-screen editor, and Save returns to the day view", async ({
	page,
}) => {
	await page.goto(day);
	const from = await slotPoint(page, 0, 15 * 60, 1);
	await holdAndDrag(page, from, from, 650);
	await sheet(page).getByLabel("Title").fill(`${PREFIX} saved`);
	await sheet(page).getByRole("button", { name: "More options" }).click();
	const editor = page.getByRole("form", { name: "New event" });
	await expect(editor).toBeVisible();
	await expect(page).toHaveURL(/\/new\?/);
	await expect(apps(page)).toHaveCount(0);
	await editor.getByRole("button", { name: "Save" }).click();
	await expect(editor).toHaveCount(0);
	await expect(
		page.locator("[data-event-id]", { hasText: `${PREFIX} saved` }),
	).toBeFocused();
});

test("Back on a touched draft in the editor asks first", async ({ page }) => {
	await page.goto(day);
	await page.getByRole("button", { name: "New event" }).click();
	await sheet(page).getByRole("button", { name: "More options" }).click();
	const editor = page.getByRole("form", { name: "New event" });
	await editor.getByLabel("Description").fill("Bring numbers");
	await page.goBack();
	const confirm = page.getByRole("dialog", { name: "Discard draft?" });
	await expect(confirm).toBeVisible();
	await confirm.getByRole("button", { name: "Discard" }).click();
	await expect(editor).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${day}$`));
});

test("a hold on an event lifts it, and a drag moves it", async ({ page }) => {
	await createEvent({
		calendarId: await calendarIdOf("work"),
		summary: `${PREFIX} held`,
		start: amsterdam(weekDay(2), "06:00"),
		end: amsterdam(weekDay(2), "07:00"),
		timeZone: "Europe/Amsterdam",
	});
	await page.goto(day);
	await slotPoint(page, 0, 6 * 60, 1);
	const chip = page.locator("[data-event-id]", { hasText: `${PREFIX} held` });
	const box = await chip.boundingBox();
	if (!box) throw new Error("no chip");
	const from = { x: box.x + box.width / 2, y: box.y + 8 };
	const saved = page.waitForResponse(
		(response) => response.request().method() === "PATCH",
	);
	await holdAndDrag(page, from, { x: from.x, y: from.y + 96 }, 650);
	await saved;
	await page.reload();
	await slotPoint(page, 0, 8 * 60, 1);
	await page.locator("[data-event-id]", { hasText: `${PREFIX} held` }).click();
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} held` }),
	).toContainText("08:00");
});
