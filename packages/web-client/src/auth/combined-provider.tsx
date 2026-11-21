import type { ReactNode } from "react";
import { configureAmplify } from "./amplify-config";
import { isBetterAuthEnabled } from "./better-auth-config";
import { betterAuthProvider } from "./better-auth-provider";
import { CognitoProvider, CognitoSessionGate } from "./cognito/CognitoShell";
import { cognitoAuthProvider } from "./cognito-provider";
import type { AuthAccountProps, AuthProvider } from "./provider";

/**
 * Both identity systems in one build, selected at runtime by
 * `betterAuthEnabled`. This is the default composition and what
 * `@remit/web-client-dist` ships — one artifact that serves a Cognito or a
 * better-auth deployment depending on `config.js`. A distributor that wants a
 * single provider composes `cognitoAuthProvider` or `betterAuthProvider`
 * directly and omits the other.
 */
const CombinedShell = ({ children }: { children: ReactNode }) =>
	isBetterAuthEnabled() ? (
		<betterAuthProvider.Shell>{children}</betterAuthProvider.Shell>
	) : (
		<cognitoAuthProvider.Shell>{children}</cognitoAuthProvider.Shell>
	);

const CombinedAccount = (props: AuthAccountProps) =>
	isBetterAuthEnabled() ? (
		<betterAuthProvider.Account {...props} />
	) : (
		<cognitoAuthProvider.Account {...props} />
	);

export const combinedAuthProvider: AuthProvider = {
	configure: configureAmplify,
	getToken: () =>
		isBetterAuthEnabled()
			? betterAuthProvider.getToken()
			: cognitoAuthProvider.getToken(),
	resetToken: () => {
		betterAuthProvider.resetToken();
		cognitoAuthProvider.resetToken();
	},
	Shell: CombinedShell,
	Provider: ({ children }) =>
		isBetterAuthEnabled() ? (
			<>{children}</>
		) : (
			<CognitoProvider>{children}</CognitoProvider>
		),
	SessionGate: ({ children }) =>
		isBetterAuthEnabled() ? (
			<betterAuthProvider.Shell>{children}</betterAuthProvider.Shell>
		) : (
			<CognitoSessionGate>{children}</CognitoSessionGate>
		),
	Account: CombinedAccount,
};
