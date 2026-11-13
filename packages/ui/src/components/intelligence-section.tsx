import type { ReactNode } from "react";
import { cn } from "../lib/cn.js";

/** One labelled band of the intelligence panel, shared by both its tabs. */
export function IntelligenceSection({
	label,
	headingId,
	children,
	className,
}: {
	label: string;
	/** Names the heading so a control elsewhere can move focus to it. */
	headingId?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			aria-labelledby={headingId}
			className={cn("border-b border-line px-row-inset py-3", className)}
		>
			<h3
				id={headingId}
				tabIndex={headingId ? -1 : undefined}
				className="text-2xs font-semibold uppercase tracking-wider text-fg-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{label}
			</h3>
			<div className="mt-2">{children}</div>
		</section>
	);
}
