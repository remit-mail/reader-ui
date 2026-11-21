export const COMMIT_UPDATE = "remit:commit-update";
export const PREPARE_UPDATE = "remit:prepare-update";
export const RELEASE_UPDATE = "remit:release-update";
export const CHECK_UPDATE = "remit:check-update";
export const WORKER_VERSION = "remit:worker-version";
export const SHELL_VERSION = "remit:shell-version";
export const CLEAN_SHELL_CACHES = "remit:clean-shell-caches";
export const shellCacheName = (commit: string, time: string): string =>
	`remit-shell-${commit}-${time}`;

/** Private endpoints must never read from the app shell's precache. */
export const isAppRequest = (url: URL): boolean =>
	url.searchParams.get("reauth") !== "1" &&
	!/^\/(?:api|content|outbox-upload|upload|uploads|cdn-cgi|oauth|auth|login|logout|signin|signout|sign-in|sign-up|reset-password|forgot-password|verify-email|callback)(?:\/|$)/i.test(
		url.pathname,
	);

/** Navigations to host pages or file paths must reach the server. */
export const isAppNavigation = (
	url: URL,
	navigationDenylist: readonly string[] = [],
): boolean =>
	isAppRequest(url) &&
	!/(?:\.|%2e)[^/]+\/?$/i.test(url.pathname) &&
	!navigationDenylist.some(
		(path) =>
			url.pathname === path ||
			url.pathname.startsWith(path.endsWith("/") ? path : `${path}/`),
	);

export interface UpdateClient {
	id: string;
	postMessage: (message: unknown, transfer: Transferable[]) => void;
}

/** A missing reply is a veto, including a suspended tab running an old bundle. */
export const askClient = (
	client: Pick<UpdateClient, "postMessage">,
	message: string,
): Promise<unknown> =>
	new Promise((resolve) => {
		const channel = new MessageChannel();
		const finish = (safe: unknown) => {
			clearTimeout(timeout);
			channel.port1.close();
			resolve(safe);
		};
		const timeout = setTimeout(() => finish(undefined), 1500);
		channel.port1.onmessage = (event) => finish(event.data);
		client.postMessage(message, [channel.port2]);
	});

export const activateWhenSafe = async (
	clients: () => Promise<readonly UpdateClient[]>,
	activate: () => Promise<void>,
): Promise<boolean> => {
	let activated = false;
	try {
		const tabs = await clients();
		const prepared = await Promise.all(
			tabs.map(
				async (client) => (await askClient(client, PREPARE_UPDATE)) === true,
			),
		);
		const current = await clients();
		if (
			!prepared.every(Boolean) ||
			current.some((tab) => !tabs.some(({ id }) => id === tab.id))
		)
			return false;
		const committed = await Promise.all(
			current.map(
				async (client) => (await askClient(client, COMMIT_UPDATE)) === true,
			),
		);
		if (!committed.every(Boolean)) return false;
		const final = await clients();
		if (final.some((tab) => !current.some(({ id }) => id === tab.id)))
			return false;
		await activate();
		activated = true;
		return true;
	} finally {
		if (!activated)
			for (const tab of await clients()) tab.postMessage(RELEASE_UPDATE, []);
	}
};
