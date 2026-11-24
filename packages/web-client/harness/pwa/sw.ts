/// <reference lib="webworker" />
import { PrecacheController } from "workbox-precaching";
import {
	REFRESH_TAG,
	refreshInBackground,
} from "../../src/lib/background-refresh.ts";
import {
	activateWhenSafe,
	askClient,
	CHECK_UPDATE,
	CLEAN_SHELL_CACHES,
	isAppNavigation,
	isAppRequest,
	SHELL_VERSION,
	shellCacheName,
	WORKER_VERSION,
} from "../../src/lib/pwa-protocol.ts";

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: { url: string; revision: string | null }[];
};
declare const __APP_SHA__: string;
declare const __APP_BUILD_TIME__: string;
declare const __REMIT_PWA_NAVIGATION_DENYLIST__: readonly string[];

// Each build owns its cache. Activating a new worker must not remove chunks
// still used by clients of the previous worker. Tenant stores are independent.
const cacheName = shellCacheName(__APP_SHA__, __APP_BUILD_TIME__);
const precache = new PrecacheController({
	cacheName,
	plugins: [
		{
			cacheWillUpdate: async ({ response }) =>
				response.status === 200 && !response.redirected ? response : null,
		},
	],
});
precache.addToCacheList(self.__WB_MANIFEST);
self.addEventListener("install", (event) =>
	event.waitUntil(precache.install(event)),
);
self.addEventListener("activate", (event) => {
	event.waitUntil(precache.activate(event).then(() => self.clients.claim()));
});
self.addEventListener("periodicsync", ((
	event: ExtendableEvent & { tag: string },
) => {
	if (event.tag !== REFRESH_TAG) return;
	event.waitUntil(refreshInBackground());
}) as EventListener);
let checking: Promise<boolean> | undefined;
self.addEventListener("message", (event) => {
	// Forward durable revocation to controlled and uncontrolled windows.
	if (event.data?.type === "remit:offline-wipe") {
		event.waitUntil(
			self.clients
				.matchAll({ type: "window", includeUncontrolled: true })
				.then((tabs) => {
					for (const tab of tabs)
						tab.postMessage({
							type: "remit:offline-revoked",
						});
				}),
		);
		return;
	}
	if (event.data === WORKER_VERSION) {
		event.ports[0]?.postMessage(cacheName);
		return;
	}
	if (event.data === CLEAN_SHELL_CACHES) {
		event.waitUntil(
			(async () => {
				const tabs = await self.clients.matchAll({
					type: "window",
					includeUncontrolled: true,
				});
				const versions = await Promise.all(
					tabs.map((tab) => askClient(tab, SHELL_VERSION)),
				);
				if (versions.every((version) => version === cacheName)) {
					for (const name of await caches.keys()) {
						if (self.registration.installing || self.registration.waiting)
							return;
						if (
							name.startsWith("remit-shell-") &&
							name.slice(-24) < cacheName.slice(-24)
						)
							await caches.delete(name);
					}
				}
			})(),
		);
		return;
	}
	if (event.data !== CHECK_UPDATE) return;
	checking ??= activateWhenSafe(
		() => self.clients.matchAll({ type: "window", includeUncontrolled: true }),
		() => self.skipWaiting(),
	).finally(() => {
		checking = undefined;
	});
	event.waitUntil(checking);
});
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (
		request.method !== "GET" ||
		url.origin !== self.location.origin ||
		!isAppRequest(url)
	)
		return;
	if (request.mode === "navigate") {
		if (!isAppNavigation(url, __REMIT_PWA_NAVIGATION_DENYLIST__)) return;
		event.respondWith(
			precache.strategy.handle({
				event,
				request: new Request(new URL("/", self.location.origin)),
			}),
		);
		return;
	}
	// Never runtime-cache API, authentication or mail content responses.
	if (precache.getCacheKeyForURL(request.url)) {
		event.respondWith(precache.strategy.handle({ event, request }));
	} else if (/^\/(?:assets|spellcheck|locales|fonts)\//.test(url.pathname)) {
		event.respondWith(
			(async () => {
				for (const name of await caches.keys()) {
					if (!name.startsWith("remit-shell-")) continue;
					const response = await (await caches.open(name)).match(request, {
						ignoreSearch: true,
					});
					if (response) return response;
				}
				return fetch(request);
			})(),
		);
	}
});
