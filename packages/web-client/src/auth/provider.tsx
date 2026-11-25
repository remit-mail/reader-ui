import {
	createContext,
	type FC,
	type ReactNode,
	useContext,
	useMemo,
} from "react";

import { getOfflineRuntime } from "../lib/offline-runtime";

/**
 * The auth-integration seam. A deployment composes the web client against
 * exactly one provider — the identity system it runs — and never ships the
 * others. `mountApp` receives the chosen provider and publishes it here; the
 * app shell and every screen read it through `useAuthProvider`, so no surface
 * imports a specific identity system directly.
 */
export interface AuthAccount {
	email: string | null;
	signOut: () => void | Promise<void>;
}

export interface AuthAccountProps {
	children: (account: AuthAccount) => ReactNode;
	/** Rendered when no session is active. Defaults to nothing. */
	fallback?: ReactNode;
}

/** Reload through the sign-in gate at this address without deleting the session. */
export const navigateToSignIn = (): void => {
	window.location.reload();
};

export interface AuthProvider {
	/** Host renewal navigation; must never revoke the login session. */
	reauthenticate: () => void | Promise<void>;
	/** Called once at boot, before render, to initialize the identity SDK. */
	configure(): void;
	/**
	 * The current session's bearer token. The API interceptor and the raw content
	 * fetch read it through here, so the identity SDK stays inside the provider.
	 *
	 * `null` means this deployment has no identity to present — no identity system
	 * is composed, or none is configured — and the request is expected to travel
	 * unauthenticated. It never means the token could not be produced: a provider
	 * that holds a session and fails to mint a token throws, because a request
	 * that cannot be authenticated must not be sent.
	 */
	getToken(): Promise<string | null>;
	/** Drop any cached token so the next `getToken` re-mints. */
	resetToken(): void;
	/** Identity context that must also exist during remembered offline reading. */
	Provider?: FC<{ children: ReactNode }>;
	/** Online-only gate that renders children once a session is established. */
	SessionGate?: FC<{ children: ReactNode }>;
	/**
	 * Render-prop over the active session's identity and sign-out action.
	 * Renders `fallback` when no session is active.
	 */
	Account: FC<AuthAccountProps>;
}

/**
 * The zero-identity provider. It has no session and no identity SDK, so a
 * surface that renders without a mounted provider (an isolated component
 * render, a harness) degrades to "signed out" instead of crashing.
 */
export const noneAuthProvider: AuthProvider = {
	reauthenticate: navigateToSignIn,
	configure: () => {},
	getToken: async () => null,
	resetToken: () => {},
	Account: ({ fallback = null }) => <>{fallback}</>,
};

const AuthProviderContext = createContext<AuthProvider>(noneAuthProvider);

export const AuthProviderProvider = ({
	value,
	children,
}: {
	value: AuthProvider;
	children?: ReactNode;
}) => {
	const provider = useMemo<AuthProvider>(
		() => ({
			...value,
			Account: ({ children, ...props }) => (
				<value.Account {...props}>
					{(account) =>
						children({
							...account,
							signOut: () => {
								const runtime = getOfflineRuntime();
								return runtime
									? runtime.removeDownloads().then(() => account.signOut())
									: account.signOut();
							},
						})
					}
				</value.Account>
			),
		}),
		[value],
	);
	return <AuthProviderContext value={provider}>{children}</AuthProviderContext>;
};

export const useAuthProvider = (): AuthProvider =>
	useContext(AuthProviderContext);
