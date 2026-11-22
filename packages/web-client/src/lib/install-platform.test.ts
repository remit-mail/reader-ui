import assert from "node:assert/strict";
import { it } from "node:test";
import { type InstallPlatform, installPlatform } from "./install-platform";

const mac =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
const safari = "Version/18.0 Safari/605.1.15";
const chromium = "AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36";

const cases: [string, string, number, boolean, InstallPlatform][] = [
	[
		"Chrome Android",
		`Mozilla/5.0 (Linux; Android 14) ${chromium}`,
		5,
		true,
		"chromium-prompt",
	],
	[
		"Chrome Windows",
		`Mozilla/5.0 (Windows NT 10.0) ${chromium}`,
		0,
		true,
		"chromium-prompt",
	],
	[
		"Edge Windows",
		`Mozilla/5.0 (Windows NT 10.0) ${chromium} Edg/131.0`,
		0,
		true,
		"chromium-prompt",
	],
	[
		"Brave Linux",
		`Mozilla/5.0 (X11; Linux x86_64) ${chromium}`,
		0,
		true,
		"chromium-prompt",
	],
	["Chrome Mac", `${mac} ${chromium}`, 0, true, "chromium-prompt"],
	["Edge Mac", `${mac} ${chromium} Edg/131.0`, 0, true, "chromium-prompt"],
	// Brave uses Chrome's user agent; capability comes from the held event.
	["Brave Mac", `${mac} ${chromium}`, 0, true, "chromium-prompt"],
	["Chromium before eligibility", `${mac} ${chromium}`, 0, false, "none"],
	[
		"iPhone Safari",
		`Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 ${safari}`,
		5,
		false,
		"ios-safari",
	],
	[
		"iPad Safari",
		`Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 ${safari}`,
		5,
		false,
		"ios-safari",
	],
	["iPadOS as Mac", `${mac} ${safari}`, 5, false, "ios-safari"],
	["macOS Safari", `${mac} ${safari}`, 0, false, "macos-safari"],
	[
		"macOS Safari without Add to Dock",
		`${mac} Version/16.6 Safari/605.1.15`,
		0,
		false,
		"none",
	],
	["Firefox Mac", `${mac} Gecko/20100101 Firefox/132.0`, 0, false, "none"],
	[
		"Firefox Android",
		"Mozilla/5.0 (Android 14) Gecko/132 Firefox/132.0",
		5,
		false,
		"none",
	],
	[
		"Chrome iOS",
		`Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/131.0 Mobile/15 Safari/604.1`,
		5,
		false,
		"none",
	],
	[
		"Firefox iOS",
		`Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 FxiOS/132.0 ${safari}`,
		5,
		false,
		"none",
	],
	["unknown browser", "Other/1.0", 0, false, "none"],
];

for (const [name, userAgent, touchPoints, hasPrompt, expected] of cases) {
	it(name, () => {
		assert.equal(
			installPlatform({ userAgent, touchPoints, hasPrompt, standalone: false }),
			expected,
		);
	});
	it(`${name} already standalone`, () => {
		assert.equal(
			installPlatform({ userAgent, touchPoints, hasPrompt, standalone: true }),
			"none",
		);
	});
}
