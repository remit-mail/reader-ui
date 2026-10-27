import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import type { Plugin, PluginOption, ProxyOptions, UserConfig } from "vite";
import { spellcheckPlugin } from "../spellcheck/vite-plugin.ts";
import { spellcheckWorkerStub } from "../spellcheck/worker-stub.ts";

export interface WebClientPresetOptions {
	/** The module that calls `mountApp`, relative to the vite root. */
	entry: string;
	/** Written to `config.js` in the build; the package default otherwise. */
	runtimeConfig?: Record<string, unknown>;
	/** The commit the bundle names; GITHUB_SHA or `git rev-parse HEAD` otherwise. */
	commit?: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const compiled = !import.meta.url.endsWith(".ts");
const codeRoot = resolve(here, "..");
const packageRoot = compiled ? resolve(codeRoot, "..") : codeRoot;
const ENTRY_ID = "/@remit-web-client/entry";

const resolveGitSha = (): string => {
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
	try {
		return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
	} catch {
		return "dev";
	}
};

const isPageRequest = (req: IncomingMessage): boolean =>
	req.method === "GET" &&
	(req.headers.accept ?? "").includes("text/html") &&
	!(req.url ?? "").startsWith("/api");

const indexHtml = (entry: string): Plugin => {
	const template = (): string =>
		readFileSync(join(codeRoot, "harness", "index.html"), "utf8");
	let indexPath = "";
	let entryPath = "";
	return {
		name: "remit-web-client-index-html",
		config: () => ({ build: { rollupOptions: { input: "index.html" } } }),
		configResolved(config) {
			indexPath = resolve(config.root, "index.html");
			entryPath = resolve(config.root, entry);
		},
		resolveId(id) {
			if (id === ENTRY_ID) return entryPath;
			if (resolve(dirname(indexPath), id) === indexPath) return indexPath;
			return null;
		},
		load(id) {
			return id === indexPath ? template() : null;
		},
		configureServer(server) {
			return () => {
				server.middlewares.use(
					async (
						req: IncomingMessage,
						res: ServerResponse,
						next: () => void,
					) => {
						if (!isPageRequest(req)) return next();
						const html = await server.transformIndexHtml(
							req.url ?? "/",
							template(),
						);
						res.setHeader("Content-Type", "text/html");
						res.end(html);
					},
				);
			};
		},
	};
};

const runtimeConfigFile = (runtimeConfig?: Record<string, unknown>): Plugin => {
	const served = (): string | undefined =>
		process.env.REMIT_RUNTIME_CONFIG ??
		(runtimeConfig ? JSON.stringify(runtimeConfig) : undefined);
	const serve = (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void,
	): void => {
		const body = served();
		if (req.url !== "/config.js" || body === undefined) {
			next();
			return;
		}
		res.setHeader("Content-Type", "application/javascript");
		res.end(`window.__REMIT_CONFIG__ = ${body};\n`);
	};
	let outDir = "";
	return {
		name: "remit-web-client-runtime-config",
		configResolved(config) {
			outDir = resolve(config.root, config.build.outDir);
		},
		configureServer(server) {
			server.middlewares.use(serve);
		},
		configurePreviewServer(server) {
			server.middlewares.use(serve);
		},
		closeBundle() {
			if (!runtimeConfig) return;
			writeFileSync(
				join(outDir, "config.js"),
				`window.__REMIT_CONFIG__ = ${JSON.stringify(runtimeConfig)};\n`,
			);
		},
	};
};

const routes = (): PluginOption =>
	tanstackRouter({
		target: "react",
		autoCodeSplitting: true,
		routesDirectory: join(codeRoot, "src", "routes"),
		generatedRouteTree: join(
			codeRoot,
			"src",
			compiled ? "routeTree.gen.js" : "routeTree.gen.ts",
		),
		disableTypes: compiled,
		routeFileIgnorePattern: "\\.d\\.ts$",
	});

const backendProxy = (): Record<string, ProxyOptions> => {
	const target = `http://localhost:${process.env.VITE_PROXY_BACKEND_PORT ?? "5433"}`;
	return {
		"/api/auth": { target, changeOrigin: true },
		"/api": {
			target,
			changeOrigin: true,
			rewrite: (path: string) => path.replace(/^\/api/, ""),
		},
		"/content": { target, changeOrigin: true },
		"/feeds/calendar": { target, changeOrigin: true },
		"/outbox-upload": { target, changeOrigin: true },
	};
};

const allowedHosts = (): string[] | undefined =>
	process.env.VITE_ALLOWED_HOST ? [process.env.VITE_ALLOWED_HOST] : undefined;

/**
 * Rollup keeps up to `maxParallelFileOps` module reads in flight, and each one
 * holds a file descriptor. Its default of 1000 is above the 1024 `RLIMIT_NOFILE`
 * soft limit that container runtimes hand a build step, and the icon barrels this
 * app imports (lucide-react re-exports ~1500 single-icon modules) give rollup
 * enough sibling modules to saturate the ceiling, so the default reliably fails
 * with EMFILE inside an image build while passing on a developer machine.
 */
const MAX_PARALLEL_FILE_OPS = 64;

export const webClientPreset = ({
	entry,
	runtimeConfig,
	commit,
}: WebClientPresetOptions): UserConfig => ({
	plugins: [
		indexHtml(entry),
		runtimeConfigFile(runtimeConfig),
		routes(),
		react(),
		tailwindcss(),
		spellcheckPlugin(),
		spellcheckWorkerStub(),
	],
	publicDir: join(packageRoot, "public"),
	define: {
		__APP_SHA__: JSON.stringify(commit ?? resolveGitSha()),
		__APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},
	build: { rollupOptions: { maxParallelFileOps: MAX_PARALLEL_FILE_OPS } },
	server: {
		host: "0.0.0.0",
		allowedHosts: allowedHosts(),
		proxy: backendProxy(),
	},
	preview: {
		host: "0.0.0.0",
		allowedHosts: allowedHosts(),
		proxy: backendProxy(),
	},
});
