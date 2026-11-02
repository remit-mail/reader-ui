import { expect, type Page, test } from "playwright/test";
import { slotPoint } from "./grid";
import {
	amsterdam,
	createRackEvent,
	deleteRackEvents,
	rackCalendar,
	weekDay,
} from "./rack";

const PREFIX = "e2e drag";
const week = `/calendar/week/${weekDay(0)}`;
const chip = (page: Page, name: string) =>
	page.locator("[data-event-id]", { hasText: name }).first();

const cleanUp = () =>
	deleteRackEvents(
		PREFIX,
		amsterdam(weekDay(-1), "00:00"),
		amsterdam(weekDay(40), "00:00"),
	);

test.beforeEach(async () => {
	await cleanUp();
	const work = await rackCalendar("work");
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} meeting`,
		start: amsterdam(weekDay(1), "06:00"),
		end: amsterdam(weekDay(1), "07:00"),
		timeZone: "Europe/Amsterdam",
	});
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} weekly`,
		start: amsterdam(weekDay(2), "06:00"),
		end: amsterdam(weekDay(2), "06:30"),
		timeZone: "Europe/Amsterdam",
		recurrenceRule: "FREQ=WEEKLY;COUNT=3",
	});
	await createRackEvent({
		calendarId: work,
		summary: `${PREFIX} trip`,
		start: weekDay(3),
		end: weekDay(4),
		allDay: true,
	});
});
test.afterAll(cleanUp);

async function drag(
	page: Page,
	from: { x: number; y: number },
	to: { x: number; y: number },
) {
	await page.mouse.move(from.x, from.y);
	await page.mouse.down();
	await page.mouse.move(to.x, to.y, { steps: 8 });
	await page.mouse.up();
}

const centre = async (page: Page, name: string) => {
	const box = await chip(page, name).boundingBox();
	if (!box) throw new Error(`no chip ${name}`);
	return { x: box.x + box.width / 2, y: box.y + 6 };
};

test("a dragged event moves to another day and time, saves and stays there", async ({
	page,
}) => {
	await page.goto(week);
	const target = await slotPoint(page, 3, 6 * 60);
	const from = await centre(page, `${PREFIX} meeting`);
	await drag(page, from, { x: target.x, y: from.y + 96 });
	await expect(page.locator("[aria-live='polite']").first()).toContainText(
		/Thursday .*08:00 to 09:00/,
	);
	await expect(page).toHaveURL(new RegExp(`${week}$`));
	await page.reload();
	await slotPoint(page, 3, 8 * 60);
	const moved = await chip(page, `${PREFIX} meeting`).boundingBox();
	const column = await page
		.locator(`[data-time-columns] [data-date="${weekDay(3)}"]`)
		.boundingBox();
	expect(moved && column && moved.x >= column.x - 1).toBe(true);
	await chip(page, `${PREFIX} meeting`).click();
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} meeting` }),
	).toContainText("08:00");
});

test("a press under 4 pixels opens the popup and moves nothing", async ({
	page,
}) => {
	await page.goto(week);
	await slotPoint(page, 1, 6 * 60);
	const from = await centre(page, `${PREFIX} meeting`);
	await drag(page, from, { x: from.x + 2, y: from.y + 1 });
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} meeting` }),
	).toBeVisible();
});

test("Esc during a drag puts the event back and saves nothing", async ({
	page,
}) => {
	await page.goto(week);
	await slotPoint(page, 1, 6 * 60);
	const from = await centre(page, `${PREFIX} meeting`);
	const writes: string[] = [];
	page.on("request", (request) => {
		if (request.method() === "PATCH") writes.push(request.url());
	});
	await page.mouse.move(from.x, from.y);
	await page.mouse.down();
	await page.mouse.move(from.x, from.y + 96, { steps: 6 });
	await expect(page.locator("[data-lifted-event]")).toBeVisible();
	await page.keyboard.press("Escape");
	await page.mouse.up();
	await expect(page.locator("[data-lifted-event]")).toHaveCount(0);
	expect(writes).toEqual([]);
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} meeting` }),
	).toHaveCount(0);
});

test("a repeating event asks the scope, and Cancel puts it back", async ({
	page,
}) => {
	await page.goto(week);
	await slotPoint(page, 2, 6 * 60);
	const from = await centre(page, `${PREFIX} weekly`);
	await drag(page, from, { x: from.x, y: from.y + 48 });
	const prompt = page.getByRole("dialog", { name: "Move a repeating event" });
	await expect(prompt).toBeVisible();
	await prompt.getByRole("button", { name: "Cancel" }).click();
	await expect(prompt).toHaveCount(0);
	const back = await centre(page, `${PREFIX} weekly`);
	expect(Math.abs(back.y - from.y)).toBeLessThan(4);
	await drag(page, from, { x: from.x, y: from.y + 48 });
	await prompt.getByRole("button", { name: /This event/ }).click();
	await page.reload();
	await slotPoint(page, 2, 7 * 60);
	await chip(page, `${PREFIX} weekly`).click();
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} weekly` }),
	).toContainText("07:00");
});

test("the bottom edge resizes in quarter hours", async ({ page }) => {
	await page.goto(week);
	await slotPoint(page, 1, 6 * 60);
	const handle = page
		.locator("[data-event-id]", { hasText: `${PREFIX} meeting` })
		.locator("xpath=following-sibling::*[@data-resize-handle]");
	const box = await handle.boundingBox();
	if (!box) throw new Error("no handle");
	const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
	await drag(page, from, { x: from.x, y: from.y + 36 });
	await expect(page.locator("[aria-live='polite']").first()).toContainText(
		"06:00 to 07:45",
	);
	await page.reload();
	await slotPoint(page, 1, 6 * 60);
	await chip(page, `${PREFIX} meeting`).click();
	await expect(
		page.getByRole("dialog", { name: `${PREFIX} meeting` }),
	).toContainText("07:45");
});

test("an all-day event spans more days from its right edge", async ({
	page,
}) => {
	await page.goto(week);
	const handle = page
		.locator("[data-event-id]", { hasText: `${PREFIX} trip` })
		.locator("xpath=following-sibling::*[@data-resize-handle]");
	const box = await handle.boundingBox();
	const columns = await page.locator("[data-time-columns]").boundingBox();
	if (!box || !columns) throw new Error("no handle");
	const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
	await drag(page, from, { x: from.x + columns.width / 7, y: from.y });
	await page.reload();
	const bar = await chip(page, `${PREFIX} trip`).boundingBox();
	expect((bar?.width ?? 0) > columns.width / 7 + 20).toBe(true);
});

test("the month view moves an event by whole days", async ({ page }) => {
	await page.goto(`/calendar/month/${weekDay(0)}`);
	const event = chip(page, `${PREFIX} meeting`);
	const box = await event.boundingBox();
	if (!box) throw new Error("no chip");
	const day = await page
		.locator(`[data-date="${weekDay(2)}"]`)
		.last()
		.boundingBox();
	if (!day) throw new Error("no day cell");
	const saved = page.waitForResponse(
		(response) => response.request().method() === "PATCH",
	);
	await drag(
		page,
		{ x: box.x + 10, y: box.y + box.height / 2 },
		{ x: day.x + day.width / 2, y: box.y + box.height / 2 },
	);
	await saved;
	await page.goto(week);
	await slotPoint(page, 2, 6 * 60);
	const moved = await chip(page, `${PREFIX} meeting`).boundingBox();
	const column = await page
		.locator(`[data-time-columns] [data-date="${weekDay(2)}"]`)
		.boundingBox();
	expect(moved && column && Math.abs(moved.x - column.x) < 4).toBe(true);
});
