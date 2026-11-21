import { APP_BUILD_TIME, APP_SHA } from "./app-info";
import {
	CHECK_UPDATE,
	CLEAN_SHELL_CACHES,
	COMMIT_UPDATE,
	PREPARE_UPDATE,
	RELEASE_UPDATE,
	SHELL_VERSION,
	shellCacheName,
} from "./pwa-protocol";

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
	let controller = sw.controller;
	let reloaded = false;
	let lease: ReturnType<typeof setTimeout> | undefined;
	const release = () => {
		prepared = false;
		document.documentElement.inert = false;
		clearTimeout(lease);
	};
	sw.addEventListener("message", (event) => {
		if (event.data === SHELL_VERSION)
			event.ports[0]?.postMessage(shellCacheName(APP_SHA, APP_BUILD_TIME));
		if (event.data === RELEASE_UPDATE) release();
		if (event.data === COMMIT_UPDATE) {
			const safe = prepared && canUpdate();
			if (safe) clearTimeout(lease);
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
		const previous = controller;
		controller = sw.controller;
		if (!previous) {
			controller?.postMessage(CLEAN_SHELL_CACHES);
			return;
		}
		if (reloaded) return;
		reloaded = true;
		window.location.reload();
	});
	let serverBuild: unknown;
	let registered: ServiceWorkerRegistration | undefined;
	window.addEventListener("remit:server-build", (event) => {
		serverBuild = (event as CustomEvent).detail;
		if (registered) observeServerBuild(serverBuild, registered);
	});
	void sw
		.register("/sw.js", { scope: "/", updateViaCache: "none" })
		.then((registration) => {
			registered = registration;
			observeServerBuild(serverBuild, registration);
			const check = () => registration.waiting?.postMessage(CHECK_UPDATE);
			sw.controller?.postMessage(CLEAN_SHELL_CACHES);
			check();
			registration.addEventListener("updatefound", () => {
				registration.installing?.addEventListener("statechange", check);
			});
			const timer = setInterval(check, 5000);
			window.addEventListener("pagehide", () => clearInterval(timer), {
				once: true,
			});
			window.addEventListener("vite:preloadError", (event) => {
				event.preventDefault();
				void registration.update();
				check();
			});
		});
};
