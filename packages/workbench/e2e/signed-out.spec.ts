import { expect, test } from "playwright/test";
import { E2E_USER, weekDay } from "./backend";

/**
 * Its own session, so signing it out leaves the suite's session alone.
 *
 * A tab holding a bearer token the server no longer accepts: the session
 * cookie still opens the app, and every API call answers 401.
 */
const REVOKED_TOKEN = JSON.stringify({
	value: "eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjQxMDI0NDQ4MDB9.revoked",
	expiresAt: 4102444800,
});

test("a 401 shows the signed-out notice, and signing in returns to the same screen", async ({
	browser,
	baseURL,
}) => {
	const context = await browser.newContext({ storageState: undefined });
	const signIn = await context.request.post("/api/auth/sign-in/email", {
		data: E2E_USER,
		headers: { origin: baseURL ?? "" },
	});
	expect(signIn.ok()).toBe(true);
	const page = await context.newPage();
	await page.addInitScript((token) => {
		if (sessionStorage.getItem("e2e-revoked") !== null) return;
		sessionStorage.setItem("e2e-revoked", "1");
		sessionStorage.setItem("remit.better-auth.token", token);
	}, REVOKED_TOKEN);
	const address = `/calendar/week/${weekDay(0)}`;
	await page.goto(address);

	const notice = page.getByRole("alertdialog", { name: "You're signed out" });
	await expect(notice).toBeVisible();
	await expect(page.getByText(/something went wrong|unexpected/i)).toHaveCount(
		0,
	);

	await notice.getByRole("button", { name: "Sign in" }).click();
	const submit = page.getByRole("button", { name: "Sign in" }).last();
	await page.getByLabel(/email/i).fill(E2E_USER.email);
	await page.getByLabel("Password", { exact: true }).fill(E2E_USER.password);
	await submit.click();

	await expect(page).toHaveURL(new RegExp(`${address}$`));
	await expect(page.getByRole("toolbar", { name: "Calendar" })).toBeVisible();
	await expect(notice).toHaveCount(0);
	await context.close();
});
