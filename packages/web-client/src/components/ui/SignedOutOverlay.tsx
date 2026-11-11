import { useModalFocus, useOverlayScope } from "@remit/ui";
import { LogIn } from "@remit/ui/icons";
import { useEffect, useRef, useState } from "react";
import { useAuthProvider } from "../../auth/provider";
import {
	isSignedOut,
	resetSignedOut,
	subscribeSignedOut,
} from "../../lib/signed-out";

const SIGN_IN_CLASS =
	"mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-ring";

/**
 * The signed-out notice every screen shares. It covers the screen so nothing
 * behind it reads as empty data, stays until the reader signs in, and its sign
 * in clears the dead session so the sign-in screen opens at the same address.
 */
export function SignedOutOverlay() {
	const [open, setOpen] = useState(isSignedOut);
	const { Account } = useAuthProvider();
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => subscribeSignedOut(setOpen), []);
	useOverlayScope({ id: "signed-out", open });
	useModalFocus(dialogRef, open);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm">
			<div
				ref={dialogRef}
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="signed-out-title"
				aria-describedby="signed-out-text"
				tabIndex={-1}
				className="w-full max-w-sm rounded-lg border border-line bg-surface p-6 shadow-xl outline-none"
			>
				<h2 id="signed-out-title" className="text-lg font-semibold text-fg">
					You're signed out
				</h2>
				<p id="signed-out-text" className="mt-2 text-sm text-fg-muted">
					The server no longer accepts this session. Sign in again to carry on
					here; you will come back to this screen.
				</p>
				<Account
					fallback={
						<button
							type="button"
							onClick={() => {
								resetSignedOut();
								window.location.reload();
							}}
							className={SIGN_IN_CLASS}
						>
							<LogIn className="size-4" aria-hidden="true" />
							Sign in
						</button>
					}
				>
					{({ signOut }) => (
						<button
							type="button"
							onClick={() => {
								resetSignedOut();
								void signOut();
							}}
							className={SIGN_IN_CLASS}
						>
							<LogIn className="size-4" aria-hidden="true" />
							Sign in
						</button>
					)}
				</Account>
			</div>
		</div>
	);
}
