import { APP_BUILD_TIME, APP_SHA } from "./app-info";
import {
	askClient,
	CHECK_UPDATE,
	CLEAN_SHELL_CACHES,
	COMMIT_UPDATE,
	PREPARE_UPDATE,
	RELEASE_UPDATE,
	SHELL_VERSION,
	shellCacheName,
	WORKER_VERSION,
} from "./pwa-protocol";

import { sessionStore } from "./session-storage";
import { reloadOnceForChunkFailure } from "./stale-build";

const blockers = new Set<() => boolean>();
let prepared = false;

/** Return true while an operation (including a U2 storage write) blocks updating.
 * Synchronous readers must reflect current state, not a delayed React effect.
 */
export const registerUpdateBlocker = (blocked: () => boolean): (() => void) => {
	blockers.add(blocked);
	return () => {
		blockers.delete(blocked);
	};
};
export const isUpdatePrepared = (): boolean => prepared;
export const canUpdate = (): boolean =>
	![...blockers].some((blocked) => blocked());

/** Only a successful fresh network config response may call this contract. */
export const observeServerBuild = (
	commit: unknown,
	registration: Pick<ServiceWorkerRegistration, "update">,
): void => {
	if (typeof commit === "string" && commit !== APP_SHA)
		void registration.update();
};

export const installPwaUpdateCoordinator = (
	pendingWrites: () => boolean,
): void => {
	registerUpdateBlocker(pendingWrites);
	if (!("serviceWorker" in navigator)) return;
	const sw = navigator.serviceWorker;
	let reloaded = false;
	let registered: ServiceWorkerRegistration | undefined;
	const documentVersion = shellCacheName(APP_SHA, APP_BUILD_TIME);
	const reload = () => {
		if (reloaded) return;
		reloaded = true;
		window.location.reload();
	};
	let lease: ReturnType<typeof setTimeout> | undefined;
	const release = () => {
		prepared = false;
		document.documentElement.inert = false;
		clearTimeout(lease);
	};
	// Takeover can precede a tab's vote (or even its first registration).
	// Recover only this document, after its own draft/write barrier clears.
	const recover = async () => {
		const active = sw.controller;
		if (
			!active ||
			reloaded ||
			!registered ||
			registered.waiting ||
			registered.installing
		)
			return;
		const version = await askClient(active, WORKER_VERSION);
		if (active !== sw.controller || reloaded || typeof version !== "string")
			return;
		if (version === documentVersion || !canUpdate()) {
			release();
			return;
		}
		prepared = true;
		document.documentElement.inert = true;
		if (
			!reloadOnceForChunkFailure({
				reload,
				guard: sessionStore(),
				commit: `${documentVersion}->${version}`,
			})
		)
			release();
	};
	sw.addEventListener("message", (event) => {
		if (event.data === SHELL_VERSION)
			event.ports[0]?.postMessage(shellCacheName(APP_SHA, APP_BUILD_TIME));
		if (event.data === RELEASE_UPDATE) release();
		if (event.data === COMMIT_UPDATE) {
			const safe = prepared && canUpdate();
			if (safe) {
				clearTimeout(lease);
			}
			event.ports[0]?.postMessage(safe);
			return;
		}
		if (event.data !== PREPARE_UPDATE) return;
		const safe = canUpdate();
		if (safe) {
			prepared = true;
			// Hold user edits while the worker collects the other tabs' votes.
			document.documentElement.inert = true;
			clearTimeout(lease);
			lease = setTimeout(release, 5000);
		}
		event.ports[0]?.postMessage(safe);
	});
	sw.addEventListener("controllerchange", () => {
		sw.controller?.postMessage(CLEAN_SHELL_CACHES);
		void recover();
	});
	let serverBuild: unknown;
	window.addEventListener("remit:server-build", (event) => {
		serverBuild = (event as CustomEvent).detail;
		if (registered) observeServerBuild(serverBuild, registered);
	});
	const check = () => {
		// First installation activates itself; there is no old worker to replace.
		if (registered?.active?.state === "activated")
			registered.waiting?.postMessage(CHECK_UPDATE);
		void recover();
	};
	let chunkFailed = false;
	window.addEventListener("vite:preloadError", (event) => {
		event.preventDefault();
		chunkFailed = true;
		if (registered) void registered.update().then(check);
	});
	void sw
		.register("/sw.js", { scope: "/", updateViaCache: "none" })
		.then((registration) => {
			registered = registration;
			observeServerBuild(serverBuild, registration);
			if (chunkFailed) void registration.update().then(check);
			sw.controller?.postMessage(CLEAN_SHELL_CACHES);
			check();
			registration.addEventListener("updatefound", () => {
				registration.installing?.addEventListener("statechange", check);
			});
			let timer: ReturnType<typeof setInterval> | undefined;
			const resume = () => {
				clearInterval(timer);
				check();
				timer = setInterval(check, 5000);
			};
			resume();
			window.addEventListener("pagehide", () => {
				clearInterval(timer);
				release();
			});
			window.addEventListener("pageshow", (event) => {
				if (event.persisted) resume();
			});
		});
};
