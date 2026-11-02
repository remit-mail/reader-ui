import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const baseURL = process.env.RACK_WEB_URL ?? "http://localhost:4223";

export default defineConfig({
	testDir: here,
	testMatch: "*.spec.ts",
	timeout: 60_000,
	workers: 1,
	fullyParallel: false,
	reporter: "list",
	globalSetup: join(here, "global-setup.ts"),
	use: {
		baseURL,
		storageState: join(here, ".auth/state.json"),
		timezoneId: "Europe/Amsterdam",
		locale: "en-GB",
		trace: "retain-on-failure",
	},
	outputDir: join(here, "../../../.tmp/e2e-results"),
	projects: [
		{
			name: "desktop",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1440, height: 900 },
			},
			testIgnore: "calendar-phone.spec.ts",
		},
		{
			name: "phone",
			use: { ...devices["Pixel 7"] },
			testMatch: "calendar-phone.spec.ts",
		},
	],
});
