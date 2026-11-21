import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PluginOption } from "vite";
import { type ManifestOptions, VitePWA } from "vite-plugin-pwa";

export interface PwaOptions {
	enabled: boolean;
	manifestOverrides?: Partial<ManifestOptions>;
	/** Host-owned paths excluded from shell navigation, including descendants. */
	navigationDenylist?: readonly string[];
	/** Stage required host assets before the precache is generated. */
	beforePrecache?: (outDir: string) => Promise<void>;
}

const filesIn = (directory: string): string[] =>
	readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? filesIn(join(directory, entry.name)).map(
					(name) => `${entry.name}/${name}`,
				)
			: [entry.name],
	);

export const completePrecache = <T extends { url: string }>(
	entries: T[],
	files: string[],
): T[] => {
	const urls = new Set(entries.map(({ url }) => url));
	const missing = files.filter(
		(name) => !name.endsWith(".map") && name !== "sw.js" && !urls.has(name),
	);
	for (const required of ["index.html", "config.js"]) {
		if (!urls.has(required)) missing.push(required);
	}
	if (missing.length)
		throw new Error(`Incomplete PWA precache: ${missing.join(", ")}`);
	return entries.map((entry) => ({
		...entry,
		url: entry.url === "index.html" ? "/" : entry.url,
	}));
};

export const pwaPlugins = (
	packageRoot: string,
	options?: PwaOptions,
): PluginOption[] => {
	if (!options?.enabled) return [];
	let outDir = "";
	const manifest = {
		...JSON.parse(
			readFileSync(join(packageRoot, "public/manifest.webmanifest"), "utf8"),
		),
		...options.manifestOverrides,
		id: "/",
		start_url: "/",
		scope: "/",
	};
	return [
		{
			name: "remit-pwa-root",
			configResolved(config) {
				if (config.base !== "/")
					throw new Error("The PWA requires base / and scope /");
				outDir = join(config.root, config.build.outDir);
			},
			generateBundle() {
				this.emitFile({
					type: "asset",
					fileName: "manifest.webmanifest",
					source: JSON.stringify(manifest),
				});
			},
		},
		VitePWA({
			strategies: "injectManifest",
			integration: {
				beforeBuildServiceWorker: async () => {
					await options.beforePrecache?.(outDir);
				},
			},
			srcDir: join(packageRoot, "harness/pwa"),
			filename: "sw.ts",
			scope: "/",
			injectRegister: false,
			manifest: false,
			includeManifestIcons: false,
			injectManifest: {
				rollupFormat: "iife",
				globPatterns: ["**/*"],
				globIgnores: ["**/*.map", "sw.js"],
				maximumFileSizeToCacheInBytes: 64 * 1024 * 1024,
				manifestTransforms: [
					async (entries) => {
						return {
							manifest: completePrecache(entries, filesIn(outDir)),
							warnings: [],
						};
					},
				],
			},
		}),
	];
};
