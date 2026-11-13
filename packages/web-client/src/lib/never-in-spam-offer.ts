import { useSyncExternalStore } from "react";

/**
 * The sender a Not spam on a message in Spam just returned to the Inbox. The
 * offer is the transient result of that one press, so it lives in memory and
 * never in the address (url-state R6); the next Not spam replaces it.
 */
export interface NeverInSpamOfferTarget {
	name: string;
	email: string;
}

let current: NeverInSpamOfferTarget | undefined;
const listeners = new Set<() => void>();

const publish = (next: NeverInSpamOfferTarget | undefined): void => {
	current = next;
	for (const listener of listeners) listener();
};

export const raiseNeverInSpamOffer = (target: NeverInSpamOfferTarget): void =>
	publish(target);

export const dismissNeverInSpamOffer = (): void => publish(undefined);

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

export const useNeverInSpamOffer = (): NeverInSpamOfferTarget | undefined =>
	useSyncExternalStore(
		subscribe,
		() => current,
		() => current,
	);
