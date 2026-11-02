import { expect, type Page, test } from "playwright/test";
import { clickSlot, dragRange, slotPoint } from "./grid";
import {
	amsterdam,
	createRackEvent,
	deleteRackEvents,
	rackCalendar,
	weekDay,
} from "./rack";

const PREFIX = "e2e sidebar";
const week = `/calendar/week/${weekDay(0)}`;
const quick = (page: Page) => page.getByRole("dialog", { name: "New event" });
const sidebar = (page: Page, name = "New event") =>
	page.getByRole("form", { name });
const block = (page: Page) => page.locator("[data-draft-block]");
const chip = (page: Page, name: string) =>
	page.locator("[data-event-id]", { hasText: name }).first();

const cleanUp = () =>
	deleteRackEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(30), "00:00"),
	);

test.beforeAll(async () => {
	await cleanUp();
	const work = await rackCalendar("work");
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} stored`,
		start: amsterdam(weekDay(1), "16:00"),
		end: amsterdam(weekDay(1), "17:00"),
		timeZone: "Europe/Amsterdam",
		location: "Room 7",
	});
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} series`,
		start: amsterdam(weekDay(2), "17:00"),
		end: amsterdam(weekDay(2), "17:30"),
		timeZone: "Europe/Amsterdam",
		recurrenceRule: "FREQ=WEEKLY;COUNT=3",
	});
});
test.afterAll(cleanUp);

const expand = async (page: Page, day = 3) => {
	await page.goto(week);
	await dragRange(page, day, 14 * 60, 15 * 60 + 30);
	await quick(page).getByLabel("Title").fill("Carried title");
	await quick(page).getByLabel("Location").fill("Room 3");
	await quick(page).getByLabel("Location").focus();
	await quick(page).getByRole("button", { name: "More options" }).click();
};

test("More options opens the sidebar on the dashed draft and carries fields and focus", async ({
	page,
}) => {
	await expand(page);
	await expect(sidebar(page)).toBeVisible();
	await expect(sidebar(page).getByLabel("Title")).toHaveValue("Carried title");
	await expect(sidebar(page).getByLabel("Location")).toHaveValue("Room 3");
	await expect(sidebar(page).getByLabel("Location")).toBeFocused();
	await expect(block(page)).toContainText("Draft");
	await expect(block(page)).toHaveClass(/border-dashed/);
	for (const label of [
		"Start time",
		"End time",
		"Time zone",
		"Calendar",
		"Show as",
		"Description",
	])
		await expect(
			sidebar(page).getByLabel(label, { exact: true }),
		).toBeVisible();
	await expect(page).toHaveURL(
		/\/new\?.*start=.*14%3A00%3A00.*end=.*15%3A45%3A00/,
	);
});

test("time fields and the draft block stay in step, and start and end follow by replace", async ({
	page,
}) => {
	await expand(page);
	await sidebar(page).getByLabel("End time").fill("16:30");
	await expect(block(page)).toContainText("14:00 – 16:30");
	await dragRange(page, 5, 9 * 60, 10 * 60);
	await expect(sidebar(page).getByLabel("Start time")).toHaveValue("09:00");
	await expect(sidebar(page).getByLabel("Title")).toHaveValue("Carried title");
	await expect(page).toHaveURL(/start=[^&]*09%3A00%3A00/);
	const handle = block(page).locator('[data-handle="end"]');
	const box = await handle.boundingBox();
	if (!box) throw new Error("no handle");
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 48, {
		steps: 4,
	});
	await page.mouse.up();
	await expect(sidebar(page).getByLabel("End time")).toHaveValue("11:15");
	await page.goBack();
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("a click on the grid leaves the sidebar open", async ({ page }) => {
	await expand(page);
	await clickSlot(page, 0, 20 * 60);
	await expect(sidebar(page)).toBeVisible();
});

test("Save closes the sidebar and focuses the new event", async ({ page }) => {
	await expand(page, 6);
	await sidebar(page).getByLabel("Title").fill(`${PREFIX} saved`);
	await sidebar(page).getByRole("button", { name: "Save" }).click();
	await expect(sidebar(page)).toHaveCount(0);
	await expect(chip(page, `${PREFIX} saved`)).toBeFocused();
	await expect(page).toHaveURL(new RegExp(`${week}$`));
});

test("Cancel closes an untouched draft and asks on a touched one", async ({
	page,
}) => {
	await page.goto(week);
	await clickSlot(page, 2, 8 * 60);
	await quick(page).getByRole("button", { name: "More options" }).click();
	await sidebar(page).getByRole("button", { name: "Cancel" }).click();
	await expect(sidebar(page)).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${week}$`));

	await expand(page);
	await sidebar(page).getByLabel("Description").fill("Bring numbers");
	await page.keyboard.press("Escape");
	const confirm = page.getByRole("dialog", { name: "Discard draft?" });
	await expect(confirm).toBeVisible();
	await confirm.getByRole("button", { name: "Keep editing" }).click();
	await expect(sidebar(page)).toBeVisible();
	await sidebar(page).getByRole("button", { name: "Close" }).click();
	await confirm.getByRole("button", { name: "Discard" }).click();
	await expect(sidebar(page)).toHaveCount(0);
});

test("a reload of /new opens the sidebar on the URL range", async ({
	page,
}) => {
	await page.goto(
		`${week}/new?start=${encodeURIComponent(amsterdam(weekDay(2), "10:15"))}&end=${encodeURIComponent(amsterdam(weekDay(2), "11:00"))}`,
	);
	await expect(sidebar(page).getByLabel("Start time")).toHaveValue("10:15");
	await expect(sidebar(page).getByLabel("End time")).toHaveValue("11:00");
	await expect(sidebar(page).getByLabel("Title")).toHaveValue("");
	await expect(sidebar(page).getByLabel("Title")).toBeFocused();
});

test("Edit opens the stored values with a read-only calendar, and a reload reopens it", async ({
	page,
}) => {
	await page.goto(week);
	await chip(page, `${PREFIX} stored`).click();
	await page
		.getByRole("dialog", { name: `${PREFIX} stored` })
		.getByRole("button", { name: "Edit" })
		.click();
	const edit = sidebar(page, "Edit event");
	await expect(edit.getByLabel("Title")).toHaveValue(`${PREFIX} stored`);
	await expect(edit.getByLabel("Location")).toHaveValue("Room 7");
	await expect(edit.getByLabel("Start time")).toHaveValue("16:00");
	await expect(edit.getByLabel("Calendar")).toBeDisabled();
	await expect(page).toHaveURL(/\/edit$/);
	await expect(block(page)).toContainText("Draft");
	await page.reload();
	await expect(edit.getByLabel("Title")).toHaveValue(`${PREFIX} stored`);
	await edit.getByLabel("Location").fill("Room 8");
	await edit.getByRole("button", { name: "Save" }).click();
	await expect(edit).toHaveCount(0);
	await chip(page, `${PREFIX} stored`).click();
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} stored` }).getByText("Room 8"),
	).toBeVisible();
});

test("saving an edit to a repeating event asks the scope", async ({ page }) => {
	await page.goto(week);
	await chip(page, `${PREFIX} series`).click();
	await page
		.getByRole("dialog", { name: `${PREFIX} series` })
		.getByRole("button", { name: "Edit" })
		.click();
	const edit = sidebar(page, "Edit event");
	await edit.getByLabel("Title").fill(`${PREFIX} series moved`);
	await edit.getByRole("button", { name: "Save" }).click();
	await edit.getByRole("button", { name: /This event/ }).click();
	await expect(edit).toHaveCount(0);
	await expect(chip(page, `${PREFIX} series moved`)).toBeVisible();
	await page.goto(`/calendar/week/${weekDay(7)}`);
	await expect(chip(page, `${PREFIX} series`)).toBeVisible();
	await expect(
		page.locator("[data-event-id]", { hasText: "moved" }),
	).toHaveCount(0);
	void slotPoint;
});
