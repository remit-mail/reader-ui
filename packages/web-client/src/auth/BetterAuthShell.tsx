import {
	AuthCard,
	AuthFooter,
	AuthHero,
	Banner,
	Button,
	Input,
	PasswordInput,
} from "@remit/ui";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { AppShellSkeleton } from "../components/layout/AppShellSkeleton";
import { FatalErrorOverlay } from "../components/ui/FatalErrorOverlay";
import { openBugReport } from "../lib/bug-report";
import { authFooterNote } from "./account-menu-mode";
import {
	type AuthRequest,
	authInlineMessage,
	classifyAuthError,
	reportFatalAuthError,
} from "./auth-error";
import { type AuthRefusal, authRefusal } from "./auth-refusal";
import {
	authClient,
	isBetterAuthEnabled,
	isSignUpDisabledError,
} from "./better-auth-config";
import { ResetPasswordPage, resetPasswordToken } from "./ResetPasswordPage";
import { SessionRateLimited } from "./SessionRateLimited";
import { classifySessionQuery, type SessionQuery } from "./session-state";

type Mode = "signIn" | "signUp";

interface BetterAuthShellProps {
	children: ReactNode;
}

const SIGN_UP_REQUEST: AuthRequest = {
	method: "POST",
	path: "/api/auth/sign-up/email",
};
const SIGN_IN_REQUEST: AuthRequest = {
	method: "POST",
	path: "/api/auth/sign-in/email",
};

export type SignInNotice = AuthRefusal | "passwordChanged";

const NoticeBanner = ({ notice }: { notice: SignInNotice }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		ref.current?.focus();
	}, []);

	return (
		<div ref={ref} tabIndex={-1} className="outline-none">
			{notice === "signInOff" && (
				<Banner tone="info">
					<p className="font-medium">Sign-in is turned off on this server.</p>
					<p className="mt-1">
						The person who runs this server turned it off. Ask them when it is
						back.
					</p>
				</Banner>
			)}
			{notice === "accountDisabled" && (
				<Banner tone="danger">
					<p className="font-medium">This account is disabled.</p>
					<p className="mt-1">Ask the person who runs this server.</p>
				</Banner>
			)}
			{notice === "passwordChanged" && (
				<Banner tone="success">
					Password changed. Sign in with your new password.
				</Banner>
			)}
		</div>
	);
};

interface SignInFormProps {
	notice?: SignInNotice;
}

export const SignInForm = ({ notice: initialNotice }: SignInFormProps) => {
	const [mode, setMode] = useState<Mode>("signIn");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	// Learned from the server's rejection, never a client-side flag — the UI
	// cannot disagree with better-auth's `disableSignUp`.
	const [signUpClosed, setSignUpClosed] = useState(false);
	const [notice, setNotice] = useState<SignInNotice | undefined>(initialNotice);

	const signInOff = notice === "signInOff";
	const activeMode: Mode = signUpClosed || signInOff ? "signIn" : mode;

	const handleFailure = (failure: unknown, request: AuthRequest) => {
		const refusal = authRefusal(failure);
		if (refusal) {
			setNotice(refusal);
			return;
		}
		if (isSignUpDisabledError(failure)) {
			setSignUpClosed(true);
			setMode("signIn");
			return;
		}
		const kind = classifyAuthError(failure);
		if (kind === "fatal") {
			reportFatalAuthError(failure, request);
			return;
		}
		setError(authInlineMessage(failure, kind));
	};

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (submitting) return;
		setError(null);
		setNotice(undefined);
		setSubmitting(true);

		const request = activeMode === "signUp" ? SIGN_UP_REQUEST : SIGN_IN_REQUEST;
		// better-auth returns `{ error }` for a server rejection, but a network
		// failure rejects the promise — fold both into one failure value so a
		// broken route or contract never vanishes as an unhandled rejection.
		const failure: unknown = await (activeMode === "signUp"
			? authClient.signUp.email({ email, password, name })
			: authClient.signIn.email({ email, password })
		).then(
			(result) => result.error ?? null,
			(thrown: unknown) => thrown,
		);

		setSubmitting(false);
		// On success `failure` is null; better-auth's session store updates and
		// useSession re-renders the gate into the app.
		if (failure) handleFailure(failure, request);
	};

	return (
		<>
			<FatalErrorOverlay />
			<AuthCard>
				<AuthHero />
				<form
					onSubmit={submit}
					className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-7 shadow-lg"
				>
					{notice && <NoticeBanner key={notice} notice={notice} />}

					{signInOff ? null : signUpClosed ? (
						<Banner tone="info">
							New signups are currently closed. Sign in with an existing
							account, or contact your administrator for access.
						</Banner>
					) : (
						<div className="flex gap-1">
							<Button
								size="sm"
								variant={activeMode === "signIn" ? "secondary" : "ghost"}
								aria-pressed={activeMode === "signIn"}
								onClick={() => setMode("signIn")}
							>
								Sign in
							</Button>
							<Button
								size="sm"
								variant={activeMode === "signUp" ? "secondary" : "ghost"}
								aria-pressed={activeMode === "signUp"}
								onClick={() => setMode("signUp")}
							>
								Create account
							</Button>
						</div>
					)}

					{error && <Banner tone="danger">{error}</Banner>}

					{activeMode === "signUp" && (
						<div className="flex flex-col gap-1 text-sm">
							<label htmlFor="ba-name" className="text-fg-muted">
								Name
							</label>
							<Input
								id="ba-name"
								type="text"
								autoComplete="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Your name"
								required
							/>
						</div>
					)}

					<div className="flex flex-col gap-1 text-sm">
						<label htmlFor="ba-email" className="text-fg-muted">
							Email
						</label>
						<Input
							id="ba-email"
							type="email"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							disabled={signInOff}
						/>
					</div>

					<div className="flex flex-col gap-1 text-sm">
						<label htmlFor="ba-password" className="text-fg-muted">
							Password
						</label>
						<PasswordInput
							id="ba-password"
							autoComplete={
								activeMode === "signUp" ? "new-password" : "current-password"
							}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Your password"
							required
							disabled={signInOff}
						/>
					</div>

					<Button type="submit" disabled={signInOff}>
						{activeMode === "signUp" ? "Create account" : "Sign in"}
					</Button>
				</form>
				<AuthFooter
					note={authFooterNote({
						betterAuthEnabled: isBetterAuthEnabled(),
						cognitoConfigured: false,
					})}
				/>
			</AuthCard>
		</>
	);
};

interface SessionGateProps {
	session: SessionQuery;
	onRetry: () => void;
	notice?: SignInNotice;
	children: ReactNode;
}

/**
 * What the app shows for each state the session lookup can be in, separated
 * from the hook that feeds it so every state can be driven directly.
 */
export const SessionGate = ({
	session,
	onRetry,
	notice,
	children,
}: SessionGateProps) => {
	const state = classifySessionQuery(session);

	if (state.kind === "active") return <>{children}</>;
	if (state.kind === "pending") return <AppShellSkeleton />;
	if (state.kind === "rateLimited") {
		return <SessionRateLimited onRetry={onRetry} onReport={openBugReport} />;
	}
	if (state.kind === "refused") {
		return <SignInForm key={state.refusal} notice={state.refusal} />;
	}
	return <SignInForm notice={notice} />;
};

/**
 * The gate, plus the one page that stands before it: a reset link opens its
 * page signed out, and setting the password leads to the sign-in form.
 */
export const BetterAuthShell = ({ children }: BetterAuthShellProps) => {
	const { data, isPending, error, refetch } = authClient.useSession();
	const [resetToken, setResetToken] = useState(() =>
		resetPasswordToken(window.location.pathname),
	);
	const [notice, setNotice] = useState<SignInNotice | undefined>(undefined);

	if (resetToken) {
		return (
			<ResetPasswordPage
				token={resetToken}
				onDone={() => {
					window.history.replaceState(null, "", "/");
					setResetToken(undefined);
					setNotice("passwordChanged");
				}}
			/>
		);
	}

	return (
		<SessionGate
			session={{ data, isPending, error }}
			onRetry={() => {
				void refetch();
			}}
			notice={notice}
		>
			{children}
		</SessionGate>
	);
};
