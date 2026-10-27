#!/usr/bin/env node
// A workspace package that publishes compiled output instead of source. Inside
// the repo its `exports` point at the source, so tsx, vite and tsgo read it with
// no build step; the tarball points at `dist`, so a host's compiler and bundler
// read JavaScript and declarations and need no knowledge of this repo.
//
// npm has no `publishConfig.exports`, so the package's `packManifest` holds the
// published shape. `prepack` compiles `tsconfig.build.json` into dist, copies
// the stylesheets and other non-TypeScript files beside the output, and writes
// that shape over package.json; `postpack` puts the workspace manifest back.
//
// Usage (from the package directory): pack-dist.mjs prepack|postpack
import { execFileSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = process.cwd();
const manifestPath = join(pkgDir, "package.json");
const backupPath = join(pkgDir, ".package.json.workspace");
const mode = process.argv[2];

const restoreWorkspaceManifest = () => {
	if (existsSync(backupPath)) renameSync(backupPath, manifestPath);
};

const isAsset = (name) =>
	name.endsWith(".d.ts") ||
	!(/\.(ts|tsx)$/.test(name) || name.endsWith(".tsbuildinfo"));

const copyAssets = (from, to) => {
	for (const entry of readdirSync(from, { withFileTypes: true })) {
		if (entry.name === "node_modules" || entry.name === "dist") continue;
		const source = join(from, entry.name);
		if (entry.isDirectory()) {
			copyAssets(source, join(to, entry.name));
			continue;
		}
		if (isAsset(entry.name)) cpSync(source, join(to, entry.name));
	}
};

const buildConfig = () => {
	const config = JSON.parse(
		readFileSync(join(pkgDir, "tsconfig.build.json"), "utf8"),
	);
	const rootDir = join(pkgDir, config.compilerOptions.rootDir);
	const roots = new Set(config.include.map((pattern) => pattern.split("/")[0]));
	return { rootDir, roots: [...roots] };
};

if (mode === "prepack") {
	restoreWorkspaceManifest();
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	if (!manifest.packManifest) {
		throw new Error(`${manifest.name} declares no packManifest`);
	}
	const { packManifest, ...rest } = manifest;
	writeFileSync(backupPath, readFileSync(manifestPath));
	let packed = false;
	try {
		const dist = join(pkgDir, "dist");
		rmSync(dist, { recursive: true, force: true });
		execFileSync(
			join(repoRoot, "node_modules/.bin/tsc"),
			["-p", "tsconfig.build.json"],
			{ cwd: pkgDir, stdio: "inherit" },
		);
		const { rootDir, roots } = buildConfig();
		for (const root of roots) {
			const source = join(pkgDir, root);
			if (!existsSync(source)) continue;
			copyAssets(source, join(dist, relative(rootDir, source)));
		}
		writeFileSync(
			manifestPath,
			`${JSON.stringify({ ...rest, ...packManifest }, null, "\t")}\n`,
		);
		packed = true;
	} finally {
		if (!packed) restoreWorkspaceManifest();
	}
} else if (mode === "postpack") {
	restoreWorkspaceManifest();
} else {
	throw new Error("usage: pack-dist.mjs prepack|postpack");
}
