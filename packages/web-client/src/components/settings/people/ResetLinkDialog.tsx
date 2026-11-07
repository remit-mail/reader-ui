import { Button, Dialog } from "@remit/ui";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ResetLinkDialogProps {
	email: string;
	resetUrl: string;
	onDone: () => void;
}

const ignoreDismiss = () => undefined;

/**
 * The reset link, shown once. Only Done closes it: Esc and a click outside do
 * nothing, so the link is not lost by accident. It lives in memory only.
 */
export function ResetLinkDialog({
	email,
	resetUrl,
	onDone,
}: ResetLinkDialogProps) {
	const [copied, setCopied] = useState(false);
	const [copyFailed, setCopyFailed] = useState(false);

	const copy = () => {
		navigator.clipboard
			.writeText(resetUrl)
			.then(() => {
				setCopyFailed(false);
				setCopied(true);
			})
			.catch(() => setCopyFailed(true));
	};

	return (
		<Dialog open onClose={ignoreDismiss} title={`Reset link for ${email}`}>
			<header className="border-b border-line px-5 py-3 text-sm font-semibold text-fg">
				Reset link for {email}
			</header>
			<div className="space-y-4 px-5 py-4 text-sm text-fg-muted">
				<p>
					They are signed out everywhere. Give them this link, by message or in
					person. It works once, for 24 hours.
				</p>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Button
						variant="primary"
						size="sm"
						icon={
							copied ? (
								<Check className="size-3.5" />
							) : (
								<Copy className="size-3.5" />
							)
						}
						onClick={copy}
					>
						{copied ? "Copied" : "Copy"}
					</Button>
					<input
						readOnly
						tabIndex={-1}
						value={resetUrl}
						aria-label={`Reset link for ${email}`}
						onFocus={(event) => event.currentTarget.select()}
						className="min-w-0 flex-1 rounded-sm border border-line bg-surface px-2 py-1.5 font-mono text-xs text-fg sm:order-first"
					/>
				</div>
				{copyFailed && (
					<p className="text-xs text-danger" role="alert">
						Copying did not work in this browser. Select the link and copy it by
						hand.
					</p>
				)}
				<p>
					You see this link only now. Close this window and it is gone. Make a
					new one if it gets lost.
				</p>
			</div>
			<footer className="flex justify-end border-t border-line px-5 py-3">
				<Button variant="secondary" size="sm" onClick={onDone}>
					Done
				</Button>
			</footer>
		</Dialog>
	);
}
