import { configureAmplify } from "./amplify-config";
import { isBetterAuthEnabled } from "./better-auth-config";
import { betterAuthProvider } from "./better-auth-provider";
import { CognitoProvider, CognitoSessionGate } from "./cognito/CognitoShell";
import { cognitoAuthProvider } from "./cognito-provider";
import type { AuthAccountProps, AuthProvider } from "./provider";

const CombinedAccount = (props: AuthAccountProps) =>
	isBetterAuthEnabled() ? (
		<betterAuthProvider.Account {...props} />
	) : (
		<cognitoAuthProvider.Account {...props} />
	);

/**
 * Both identity systems in one build, selected at runtime by
 * `betterAuthEnabled`. This is the default composition and what
 * `@remit/web-client-dist` ships — one artifact that serves a Cognito or a
 * better-auth deployment depending on `config.js`. A distributor that wants a
 * single provider composes `cognitoAuthProvider` or `betterAuthProvider`
 * directly and omits the other.
 */
export const combinedAuthProvider: AuthProvider = {
	reauthenticate: () =>
		isBetterAuthEnabled()
			? betterAuthProvider.reauthenticate()
			: cognitoAuthProvider.reauthenticate(),
	configure: configureAmplify,
	getToken: () =>
		isBetterAuthEnabled()
			? betterAuthProvider.getToken()
			: cognitoAuthProvider.getToken(),
	resetToken: () => {
		betterAuthProvider.resetToken();
		cognitoAuthProvider.resetToken();
	},
	Provider: ({ children }) =>
		isBetterAuthEnabled() ? (
			<>{children}</>
		) : (
			<CognitoProvider>{children}</CognitoProvider>
		),
	SessionGate: ({ children }) =>
		isBetterAuthEnabled() ? (
			<betterAuthProvider.SessionGate>
				{children}
			</betterAuthProvider.SessionGate>
		) : (
			<CognitoSessionGate>{children}</CognitoSessionGate>
		),
	Account: CombinedAccount,
};
