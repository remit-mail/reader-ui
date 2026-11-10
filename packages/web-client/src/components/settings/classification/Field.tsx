import { FieldLabel } from "@remit/ui";
import type { ReactNode } from "react";

export function Field({
	id,
	label,
	hint,
	error,
	children,
}: {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			{children}
			{error && (
				<p id={`${id}-error`} className="mt-1 text-xs text-danger">
					{error}
				</p>
			)}
			{hint && (
				<p id={`${id}-hint`} className="mt-1 text-xs text-fg-subtle">
					{hint}
				</p>
			)}
		</div>
	);
}

export const describedBy = (id: string, hint: boolean, error: boolean) =>
	[error ? `${id}-error` : "", hint ? `${id}-hint` : ""]
		.filter(Boolean)
		.join(" ") || undefined;
