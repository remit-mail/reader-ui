#!/usr/bin/env node
// Consumer acceptance for @remit/web-client and @remit/ui: the packed tarballs,
// installed into a clean directory beside the published reader packages they
// peer on, must build a servable app from an entry and a three-line vite config.
//
// Off the packed tarballs, so it works before either package is published:
//   1. Static — every third-party module the shipped build code imports is a
//      dependency or a peer, never a devDependency a tarball consumer lacks.
//   2. Spellcheck — the staging plugin names the file it wanted and both ways
//      past it when the engine is absent, and stages from a named engine.
//   3. Build — the host builds, ships the runtime config, splits the routes
//      into their own chunks, and its stylesheet carries the ui's own
//      utilities (the row select toggle's border).
import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_ONLY_UTILITY = ".border-fg-subtle\\/40";
const MIN_ROUTE_CHUNKS = 50;

const run = (cmd, args, opts = {}) =>
	execFileSync(cmd, args, { encoding: "utf8", ...opts });

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const refuse = (message) => {
	console.error(message);
	process.exit(1);
};

const packageNameOf = (specifier) => {
	const parts = specifier.split("/");
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
};

const isThirdParty = (specifier) =>
	!specifier.includes("${") &&
	!specifier.startsWith(".") &&
	!specifier.startsWith("/") &&
	!specifier.startsWith("node:") &&
	!specifier.startsWith("@remit/");

const scanImports = (dir) => {
	const found = new Set();
	const walk = (current) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const path = join(current, entry.name);
			if (entry.isDirectory()) {
				walk(path);
				continue;
			}
			if (!entry.name.endsWith(".js")) continue;
			const source = readFileSync(path, "utf8");
			for (const match of source.matchAll(
				/(?:from|import)\s*\(?\s*["']([^"']+)["']/g,
			)) {
				if (isThirdParty(match[1])) found.add(packageNameOf(match[1]));
			}
		}
	};
	walk(dir);
	return found;
};

const pack = (workspace, into) =>
	join(
		into,
		run("npm", ["pack", "-w", workspace, "--pack-destination", into], {
			cwd: repoRoot,
			stdio: ["ignore", "pipe", "inherit"],
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

const tmp = mkdtempSync(join(tmpdir(), "remit-web-consumer-"));
try {
	const uiTarball = pack("@remit/ui", tmp);
	const webTarball = pack("@remit/web-client", tmp);
	run("tar", ["-xzf", webTarball, "-C", tmp]);
	const pkgDir = join(tmp, "package");
	const manifest = readJson(join(pkgDir, "package.json"));

	const declared = new Set([
		...Object.keys(manifest.dependencies ?? {}),
		...Object.keys(manifest.peerDependencies ?? {}),
	]);
	const undeclared = [
		...scanImports(join(pkgDir, "dist", "harness")),
		...scanImports(join(pkgDir, "dist", "spellcheck")),
	].filter((name) => !declared.has(name));
	if (undeclared.length > 0) {
		refuse(
			`@remit/web-client ships build code importing undeclared packages: ${[...new Set(undeclared)].join(", ")}. Declare them as dependencies or peerDependencies.`,
		);
	}

	const root = readJson(join(repoRoot, "package.json")).devDependencies;
	const web = readJson(
		join(repoRoot, "packages", "web-client", "package.json"),
	);
	const pinned = (names, from) =>
		Object.fromEntries(names.map((name) => [name, from[name]]));
	const consumer = join(tmp, "consumer");
	mkdirSync(join(consumer, "src"), { recursive: true });
	writeFileSync(
		join(consumer, "package.json"),
		JSON.stringify(
			{
				name: "consumer",
				private: true,
				type: "module",
				dependencies: {
					"@remit/ui": `file:${uiTarball}`,
					"@remit/web-client": `file:${webTarball}`,
					...pinned(
						[
							"@remit/api-http-client",
							"@remit/data-ports",
							"@remit/domain-enums",
							"@remit/mail-oauth-service",
							"@tanstack/react-query",
						],
						root,
					),
					...pinned(
						[
							"react",
							"react-dom",
							"vite",
							"@vitejs/plugin-react",
							"@tailwindcss/vite",
							"tailwindcss",
							"@tanstack/router-plugin",
							"dictionary-en",
						],
						web.devDependencies,
					),
				},
				overrides: { "@remit/ui": `file:${uiTarball}` },
			},
			null,
			2,
		),
	);
	writeFileSync(
		join(consumer, "src", "main.tsx"),
		[
			'import { betterAuthProvider } from "@remit/web-client/auth/better-auth";',
			'import { mountApp } from "@remit/web-client/shell";',
			"",
			"mountApp({ authProvider: betterAuthProvider });",
			"",
		].join("\n"),
	);
	writeFileSync(
		join(consumer, "vite.config.js"),
		[
			'import { webClientPreset } from "@remit/web-client/vite-preset";',
			'import { defineConfig } from "vite";',
			'export default defineConfig(webClientPreset({ entry: "src/main.tsx", runtimeConfig: { betterAuthEnabled: true } }));',
			"",
		].join("\n"),
	);
	run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], {
		cwd: consumer,
		stdio: "inherit",
	});

	const plugin = join(
		consumer,
		"node_modules",
		"@remit",
		"web-client",
		"dist",
		"spellcheck",
		"vite-plugin.js",
	);
	const stage = (settings) => {
		const env = { ...process.env };
		delete env.REMIT_SPELLCHECK_ENGINE_DIR;
		delete env.REMIT_SPELLCHECK_LANGUAGES;
		return spawnSync(
			process.execPath,
			[
				"--input-type=module",
				"-e",
				`const { stageSpellcheck } = await import(${JSON.stringify(plugin)}); process.stdout.write(JSON.stringify(stageSpellcheck(process.env.REMIT_SPELLCHECK_LANGUAGES, "/").files.map((file) => file.path)));`,
			],
			{ cwd: consumer, encoding: "utf8", env: { ...env, ...settings } },
		);
	};
	const missing = stage({ REMIT_SPELLCHECK_ENGINE_DIR: join(tmp, "absent") });
	const said = `${missing.stderr}${missing.stdout}`;
	const silent = [
		"hunspell.wasm",
		"REMIT_SPELLCHECK_ENGINE_DIR",
		"REMIT_SPELLCHECK_LANGUAGES=",
	].filter((word) => !said.includes(word));
	if (missing.status === 0 || silent.length > 0) {
		refuse(
			`@remit/web-client staged the spellchecker without an engine and did not say ${silent.join(" or ") || "why"}:\n${said}`,
		);
	}
	const staged = stage({ REMIT_SPELLCHECK_LANGUAGES: "en" });
	const stagedFiles = staged.status === 0 ? JSON.parse(staged.stdout) : [];
	const absent = [
		"hunspell.wasm",
		"hunspell.mjs",
		"dictionaries/en/index.aff",
		"dictionaries/en/index.dic",
		"NOTICE.txt",
		"manifest.json",
	].filter((path) => !stagedFiles.includes(path));
	if (absent.length > 0) {
		refuse(
			`@remit/web-client did not stage ${absent.join(", ")} from the installed @remit/spellcheck-engine:\n${staged.stderr}${staged.stdout}`,
		);
	}

	const env = { ...process.env, REMIT_SPELLCHECK_LANGUAGES: "en" };
	delete env.REMIT_SPELLCHECK_ENGINE_DIR;
	run(join(consumer, "node_modules", ".bin", "vite"), ["build"], {
		cwd: consumer,
		stdio: "inherit",
		env,
	});
	const dist = join(consumer, "dist");
	for (const file of ["index.html", "config.js"]) {
		if (!existsSync(join(dist, file))) {
			refuse(`the consumer build has no ${file}`);
		}
	}
	const spellcheck = join(dist, "spellcheck");
	if (
		!existsSync(spellcheck) ||
		!readdirSync(spellcheck).some((dir) =>
			existsSync(join(spellcheck, dir, "manifest.json")),
		)
	) {
		refuse("the consumer build staged no spellcheck manifest");
	}
	if (
		!readFileSync(join(dist, "config.js"), "utf8").includes("betterAuthEnabled")
	) {
		refuse(
			"the consumer build kept the package config.js over its own runtimeConfig",
		);
	}
	const chunks = readdirSync(join(dist, "assets")).filter((name) =>
		name.endsWith(".js"),
	);
	if (chunks.length < MIN_ROUTE_CHUNKS) {
		refuse(
			`the consumer build has ${chunks.length} script chunks: the routes were not split out of the entry`,
		);
	}
	const css = readdirSync(join(dist, "assets"))
		.filter((name) => name.endsWith(".css"))
		.map((name) => readFileSync(join(dist, "assets", name), "utf8"))
		.join("\n");
	if (!css.includes(UI_ONLY_UTILITY)) {
		refuse(
			`the consumer build's stylesheet has no ${UI_ONLY_UTILITY}: @remit/ui's components were not scanned for utilities`,
		);
	}

	console.log(
		"Consumer acceptance OK: the packed web client and ui build a servable app from a three-line vite config, with the ui's utilities in its stylesheet.",
	);
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
