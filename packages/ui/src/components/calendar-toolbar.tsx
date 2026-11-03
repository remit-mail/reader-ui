import { useId } from "react";
import { cn } from "../lib/cn.js";

export interface SegmentOption<T extends string> {
	value: T;
	label: string;
	/** Shown instead of `label` where the control has to fit a thumb. */
	shortLabel: string;
}

/**
 * A flat choice, drawn the way the nav sidebar draws a picked mailbox: weight
 * and hue mark what is on, and nothing is raised. The calendar's toolbar and the
 * nav are the same act — choosing what the pane shows — so they look the same.
 */
export function segmentClassName(active: boolean): string {
	return cn(
		"flex cursor-pointer items-center justify-center rounded-md px-2 font-medium transition-colors",
		"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
		active
			? "bg-accent-2-soft text-accent-2"
			: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
	);
}

export interface SegmentedProps<T extends string> {
	options: SegmentOption<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Grows every segment to a 44px touch target. */
	touch?: boolean;
	ariaLabel: string;
	className?: string;
}

export function Segmented<T extends string>({
	options,
	value,
	onChange,
	touch,
	ariaLabel,
	className,
}: SegmentedProps<T>) {
	const group = useId();
	return (
		<fieldset className={cn("inline-flex items-center gap-0.5", className)}>
			<legend className="sr-only">{ariaLabel}</legend>
			{options.map((option) => (
				<label
					key={option.value}
					className={cn(
						segmentClassName(value === option.value),
						touch ? "min-h-11 flex-1 text-sm" : "h-7 text-xs",
					)}
				>
					<input
						type="radio"
						name={group}
						value={option.value}
						checked={value === option.value}
						onChange={() => onChange(option.value)}
						className="sr-only"
					/>
					{touch ? option.shortLabel : option.label}
				</label>
			))}
		</fieldset>
	);
}
