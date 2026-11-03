import {
	type PointerEvent,
	type ReactNode,
	type Ref,
	useRef,
	useState,
} from "react";
import { cn } from "../lib/cn.js";

const DISMISS_PX = 80;

export interface CalendarSheetProps {
	labelledBy: string;
	onDismiss: () => void;
	children: ReactNode;
	sheetRef?: Ref<HTMLDivElement>;
	className?: string;
}

/**
 * A sheet along the bottom of a phone that leaves the grid above it in view
 * and live: no scrim, so a tap above it reaches the grid. A swipe down on the
 * grabber dismisses it.
 */
export function CalendarSheet({
	labelledBy,
	onDismiss,
	children,
	sheetRef,
	className,
}: CalendarSheetProps) {
	const start = useRef<number | null>(null);
	const [offset, setOffset] = useState(0);

	const down = (event: PointerEvent<HTMLDivElement>) => {
		start.current = event.clientY;
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	const move = (event: PointerEvent<HTMLDivElement>) => {
		if (start.current === null) return;
		setOffset(Math.max(0, event.clientY - start.current));
	};
	const up = () => {
		if (start.current === null) return;
		start.current = null;
		if (offset > DISMISS_PX) onDismiss();
		setOffset(0);
	};

	return (
		<div
			ref={sheetRef}
			role="dialog"
			aria-modal="false"
			aria-labelledby={labelledBy}
			data-calendar-popover=""
			className={cn(
				"fixed inset-x-0 bottom-0 z-50 max-h-[70dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom,0px)] shadow-2xl shadow-black/30",
				className,
			)}
			style={{
				transform: `translateY(${offset}px)`,
				transition: offset === 0 ? "transform 200ms ease-out" : "none",
			}}
		>
			<div
				aria-hidden="true"
				data-sheet-grabber=""
				onPointerDown={down}
				onPointerMove={move}
				onPointerUp={up}
				onPointerCancel={up}
				className="flex h-6 cursor-grab touch-none items-center justify-center"
			>
				<span className="h-1 w-10 rounded-full bg-line-strong" />
			</div>
			{children}
		</div>
	);
}
