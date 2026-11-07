import {
	AuthCard,
	AuthFooter,
	AuthHero,
	Banner,
	Button,
	PasswordInput,
} from "@remit/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { buildBugReportContext, buildGitHubIssueUrl } from "../lib/bug-report";
import { getErrorStatus } from "../lib/error-classifier";
import { authFooterNote } from "./account-menu-mode";
import { authServerMessage, classifyAuthError } from "./auth-error";
import { authRefusal } from "./auth-refusal";
import { authClient } from "./better-auth-config";

const RESET_PATH = /\/reset-password\/([^/]+)\/?$/;

/** The token in a `/reset-password/<token>` address, the link People hands out. */
export const resetPasswordToken = (pathname: string): string | undefined => {
	const match = RESET_PATH.exec(pathname);
	return match?.[1] ? decodeURIComponent(match[1]) : undefined;
};

const MIN_LENGTH = 12;
const MAX_LENGTH = 128;

const lengthProblem = (password: string): string | undefined => {
	const length = [...password].length;
	if (length >= MIN_LENGTH && length <= MAX_LENGTH) return undefined;
	return `This password has ${length} characters. Use ${MIN_LENGTH} to ${MAX_LENGTH}.`;
};

type Problem =
	| { kind: "length"; message: string }
	| { kind: "deadLink" }
	| { kind: "signInOff" }
	| { kind: "inline"; message: string }
	| { kind: "server"; message: string };

const SET_FAILED = "Your password was not set";

/**
 * A report for a reset the server failed. The address carries the reset token,
 * so the report names the page and never the token.
 */
const resetReportHref = (message: string): string =>
	buildGitHubIssueUrl({
		...buildBugReportContext({
			title: `Reset password: ${message}`,
			errorMessage: message,
		}),
		href: `${window.location.origin}/reset-password/<token>`,
	});

const problemFor = (failure: unknown): Problem => {
	if (authRefusal(failure) === "signInOff") return { kind: "signInOff" };
	const code =
		failure && typeof failure === "object" && "code" in failure
			? failure.code
			: undefined;
	if (code === "INVALID_TOKEN") return { kind: "deadLink" };
	const kind = classifyAuthError(failure);
	if (kind === "network") {
		return {
			kind: "inline",
			message:
				"Can't reach the server. You may be offline. Check your connection and try again.",
		};
	}
	if (kind === "rateLimited") {
		return {
			kind: "inline",
			message: "Too many tries from this address. Wait a minute and try again.",
		};
	}
	const status = getErrorStatus(failure);
	const server = authServerMessage(failure);
	return {
		kind: "server",
		message: `${SET_FAILED}. The server answered ${status ?? "nothing"}${server ? `: ${server}` : ""}.`,
	};
};

interface ResetPasswordPageProps {
	token: string;
	onDone: () => void;
}

/**
 * Where a reset link from the People page lands. Opening it uses nothing; only
 * Set password spends the token, so a mail scanner that follows the link does
 * no harm. It never shows whose account it is.
 */
export function ResetPasswordPage({ token, onDone }: ResetPasswordPageProps) {
	const [password, setPassword] = useState("");
	const [problem, setProblem] = useState<Problem | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (submitting) return;
		const tooShortOrLong = lengthProblem(password);
		if (tooShortOrLong) {
			setProblem({ kind: "length", message: tooShortOrLong });
			return;
		}
		setProblem(null);
		setSubmitting(true);
		const failure: unknown = await authClient
			.resetPassword({ newPassword: password, token })
			.then(
				(result) => result.error ?? null,
				(thrown: unknown) => thrown,
			);
		setSubmitting(false);
		if (!failure) {
			onDone();
			return;
		}
		setProblem(problemFor(failure));
	};

	return (
		<AuthCard>
			<AuthHero />
			<form
				onSubmit={submit}
				className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-surface p-7 shadow-lg"
			>
				<h1 className="text-base font-semibold text-fg">
					Choose a new password
				</h1>

				{problem?.kind === "deadLink" && (
					<Banner tone="danger">
						This link no longer works. Ask for a new one.
					</Banner>
				)}
				{problem?.kind === "signInOff" && (
					<Banner tone="info">
						<p className="font-medium">Sign-in is turned off on this server.</p>
						<p className="mt-1">
							The link works once the person who runs this server turns sign-in
							back on.
						</p>
					</Banner>
				)}
				{problem?.kind === "inline" && (
					<Banner tone="danger">{problem.message}</Banner>
				)}
				{problem?.kind === "server" && (
					<Banner tone="danger">
						<p>{problem.message}</p>
						<a
							href={resetReportHref(problem.message)}
							target="_blank"
							rel="noreferrer"
							className="mt-1 inline-block font-medium text-accent hover:underline"
						>
							Report an issue
						</a>
					</Banner>
				)}

				<div className="flex flex-col gap-1 text-sm">
					<label htmlFor="reset-new-password" className="text-fg-muted">
						New password
					</label>
					<PasswordInput
						ref={inputRef}
						id="reset-new-password"
						autoComplete="new-password"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							if (problem?.kind === "length") setProblem(null);
						}}
						placeholder="12 to 128 characters"
						aria-invalid={problem?.kind === "length"}
						aria-describedby="reset-new-password-hint"
						required
					/>
					<p id="reset-new-password-hint" className="text-xs text-fg-muted">
						{problem?.kind === "length" ? (
							<span className="text-danger" role="alert">
								{problem.message}
							</span>
						) : (
							"Use 12 to 128 characters. Spaces and any symbols are fine. A long phrase is easy to remember."
						)}
					</p>
				</div>

				<Button type="submit" aria-busy={submitting}>
					Set password
				</Button>
			</form>
			<AuthFooter
				note={authFooterNote({
					betterAuthEnabled: true,
					cognitoConfigured: false,
				})}
			/>
		</AuthCard>
	);
}
