import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../lib/cn.js";

export interface SwitchProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role" | "onClick"> {
	checked: boolean;
	onToggle: () => void;
	ref?: Ref<HTMLButtonElement>;
}

/**
 * An on/off switch with a 44px hit area. `aria-disabled` keeps it focusable so
 * it can announce why it does not move, and swallows the press like `disabled`.
 */
export function Switch({
	checked,
	onToggle,
	disabled,
	className,
	ref,
	...props
}: SwitchProps) {
	const ariaDisabled = props["aria-disabled"];
	const inert =
		disabled === true || ariaDisabled === true || ariaDisabled === "true";
	return (
		<button
			type="button"
			role="switch"
			ref={ref}
			aria-checked={checked}
			disabled={disabled}
			onClick={() => {
				if (!inert) onToggle();
			}}
			className={cn(
				"group inline-flex h-11 w-14 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
				inert ? "cursor-not-allowed" : "cursor-pointer",
				className,
			)}
			{...props}
		>
			<span
				aria-hidden
				className={cn(
					"relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
					checked
						? "border-positive bg-positive"
						: "border-line-strong bg-surface-sunken",
					inert && "opacity-60",
				)}
			>
				<span
					className={cn(
						"size-4 rounded-full bg-canvas transition-transform",
						checked ? "translate-x-6" : "translate-x-1",
					)}
				/>
			</span>
		</button>
	);
}
