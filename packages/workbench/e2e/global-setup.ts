import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { request } from "playwright/test";
import { RACK_USER } from "./rack";

const here = dirname(fileURLToPath(import.meta.url));
const statePath = join(here, ".auth/state.json");

/** Sign-in is rate limited, so a session that still answers is kept. */
async function sessionStillValid(baseURL: string): Promise<boolean> {
	if (!existsSync(statePath)) return false;
	const context = await request.newContext({
		baseURL,
		storageState: statePath,
	});
	const response = await context.get("/api/auth/get-session");
	const body = response.ok() ? await response.text() : "null";
	await context.dispose();
	return body !== "null" && body !== "";
}

export default async function globalSetup(): Promise<void> {
	const baseURL = process.env.RACK_WEB_URL ?? "http://localhost:4223";
	if (await sessionStillValid(baseURL)) return;
	const context = await request.newContext({ baseURL });
	const response = await context.post("/api/auth/sign-in/email", {
		data: RACK_USER,
		headers: { origin: baseURL },
	});
	if (!response.ok()) {
		throw new Error(
			`rack sign-in failed: ${response.status()} ${await response.text()}; run npm run rack -- seed`,
		);
	}
	mkdirSync(dirname(statePath), { recursive: true });
	await context.storageState({ path: statePath });
	await context.dispose();
}
