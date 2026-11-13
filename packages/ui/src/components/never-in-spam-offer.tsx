import { useEffect, useRef } from "react";
import { Banner } from "./banner.js";
import { Button } from "./button.js";

export interface NeverInSpamOfferProps {
	sender: { name: string; email: string };
	blocked: boolean;
	saving: boolean;
	onAccept: () => void;
	onDismiss: () => void;
}

/**
 * What follows Not spam on a message in Spam: keep this sender's mail out of
 * Spam from now on. It sits in the slot above the Spam list, takes focus
 * because the reader's own press raised it, and never times out.
 */
export function NeverInSpamOffer({
	sender,
	blocked,
	saving,
	onAccept,
	onDismiss,
}: NeverInSpamOfferProps) {
	const acceptRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		acceptRef.current?.focus();
	}, []);

	const who = `${sender.name} (${sender.email})`;

	return (
		<Banner
			tone="info"
			variant="soft"
			role="status"
			className="rounded-none border-b border-line"
			onKeyDown={(event) => {
				if (event.key !== "Escape") return;
				event.stopPropagation();
				onDismiss();
			}}
		>
			<p className="text-sm text-fg">
				Moved to Inbox.{" "}
				{blocked
					? `You have ${who} blocked. Keeping their mail out of Spam means unblocking them.`
					: `Should mail from ${who} stay out of Spam from now on?`}
			</p>
			<div className="mt-2 flex flex-wrap gap-2">
				<Button
					ref={acceptRef}
					variant="primary"
					size="md"
					aria-busy={saving || undefined}
					onClick={saving ? undefined : onAccept}
				>
					{saving
						? "Saving..."
						: blocked
							? "Unblock and never put this sender in Spam"
							: "Never put this sender in Spam"}
				</Button>
				<Button variant="ghost" size="md" disabled={saving} onClick={onDismiss}>
					No thanks
				</Button>
			</div>
		</Banner>
	);
}
