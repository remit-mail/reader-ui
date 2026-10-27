#!/usr/bin/env node
// Runs the web-client suite as four shards at once, then merges their LCOV and
// enforces the line floor on the union (packages/web-client/scripts).
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHARD_TOTAL = 4;
const packageRoot = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"packages",
	"web-client",
);

const runShard = (index) =>
	new Promise((resolve) => {
		const child = spawn(
			process.execPath,
			[join(packageRoot, "scripts", "test-shard.mjs")],
			{
				stdio: "inherit",
				env: {
					...process.env,
					SHARD_INDEX: String(index),
					SHARD_TOTAL: String(SHARD_TOTAL),
				},
			},
		);
		child.on("exit", (code, signal) => resolve({ index, code, signal }));
	});

const results = await Promise.all(
	Array.from({ length: SHARD_TOTAL }, (_, i) => runShard(i + 1)),
);
const failed = results.filter(({ code }) => code !== 0);
if (failed.length > 0) {
	for (const { index, code, signal } of failed) {
		console.error(
			`web-client shard ${index}/${SHARD_TOTAL} failed: ${signal ?? `exit ${code}`}`,
		);
	}
	process.exit(1);
}

const lcovFiles = results.map(({ index }) =>
	join(packageRoot, "coverage", `shard-${index}.lcov`),
);
const { status } = spawnSync(
	process.execPath,
	[join(packageRoot, "scripts", "coverage-merge.mjs"), ...lcovFiles],
	{ stdio: "inherit" },
);
process.exitCode = status ?? 1;
