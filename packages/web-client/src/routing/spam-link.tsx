import type { SpamVerdictLinkProps } from "@remit/ui";
import { NavLink } from "./nav-link";

/** The Spam check section's links, as router navigations. */
export function SpamVerdictLink({
	target,
	className,
	children,
}: SpamVerdictLinkProps) {
	if (target.kind === "SpamSettings") {
		return (
			<NavLink to="/settings/spam" variant="inline" className={className}>
				{children}
			</NavLink>
		);
	}
	if (target.kind === "NeverInSpamSenders") {
		return (
			<NavLink
				to="/settings/senders"
				search={{ group: "neverSpam" }}
				variant="inline"
				className={className}
			>
				{children}
			</NavLink>
		);
	}
	return (
		<NavLink
			to="/settings/filters"
			search={{ filterId: target.filterId }}
			variant="inline"
			className={className}
		>
			{children}
		</NavLink>
	);
}
