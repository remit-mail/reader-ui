import { configureAmplify } from "./amplify-config";
import { CognitoAccount } from "./cognito/CognitoAccount";
import {
	CognitoProvider,
	CognitoSessionGate,
	CognitoShell,
} from "./cognito/CognitoShell";
import {
	getCognitoToken,
	resetCognitoTokenCache,
} from "./cognito/cognito-token";
import { type AuthProvider, navigateToSignIn } from "./provider";

/**
 * Cognito (AWS Amplify) identity. Importing this module is what pulls Amplify
 * into a build — a distributor that composes a different provider never
 * references it, so `aws-amplify` and `@aws-amplify/ui-react` stay out of that
 * bundle.
 */
export const cognitoAuthProvider: AuthProvider = {
	reauthenticate: navigateToSignIn,
	configure: configureAmplify,
	getToken: getCognitoToken,
	resetToken: resetCognitoTokenCache,
	Shell: CognitoShell,
	Provider: CognitoProvider,
	SessionGate: CognitoSessionGate,
	Account: CognitoAccount,
};
