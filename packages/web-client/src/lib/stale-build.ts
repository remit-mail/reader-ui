import { APP_SHA } from "./app-info";
import { canUpdate, registerUpdateBlocker } from "./pwa-update";
import { sessionStore } from "./session-storage";

export const STALE_BUILD_RELOAD_KEY_PREFIX = "remit.stale-build-reload:";

type ReloadGuard = Pick<Storage, "getItem" | "setItem">;

export interface StaleBuildPorts {
	reload: () => void;
	guard: ReloadGuard | null;
	commit: string;
}

export const reloadOnceForChunkFailure = ({
	reload,
	guard,
	commit,
}: StaleBuildPorts): boolean => {
	if (guard === null || !canUpdate()) return false;
	const key = `${STALE_BUILD_RELOAD_KEY_PREFIX}${commit}`;
	if (guard.getItem(key) !== null) return false;
	guard.setItem(key, String(Date.now()));
	reload();
	return true;
};

export const installStaleBuildReload = (pendingWrites: () => boolean): void => {
	registerUpdateBlocker(pendingWrites);
	window.addEventListener("vite:preloadError", (event) => {
		const reloaded = reloadOnceForChunkFailure({
			reload: () => window.location.reload(),
			guard: sessionStore(),
			commit: APP_SHA,
		});
		if (reloaded) event.preventDefault();
	});
};
