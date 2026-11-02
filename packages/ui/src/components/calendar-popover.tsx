import {
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	type Ref,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../lib/cn.js";
import { type Placement, placePopup } from "../lib/popup-placement.js";

export interface CalendarPopoverProps {
	/** What the popover sits beside; null or out of view centres it. */
	anchor: HTMLElement | null;
	/** Changes whenever the anchor moves, so the popover follows it. */
	anchorKey: string;
	labelledBy: string;
	children: ReactNode;
	/** A header drag moves the popover and leaves the anchor alone. */
	header?: (dragHandle: {
		onPointerDown: (event: PointerEvent<HTMLElement>) => void;
	}) => ReactNode;
	/** Tab wraps inside the popover, which traps nothing else. */
	wrapTab?: boolean;
	panelRef?: Ref<HTMLDivElement>;
	className?: string;
}

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A floating card beside a range or an event on the calendar grid: a
 * non-modal `dialog`, placed on the side with room.
 */
export function CalendarPopover({
	anchor,
	anchorKey,
	labelledBy,
	children,
	header,
	wrapTab = false,
	panelRef,
	className,
}: CalendarPopoverProps) {
	const ownRef = useRef<HTMLDivElement | null>(null);
	const [placement, setPlacement] = useState<Placement | null>(null);
	const [offset, setOffset] = useState({ key: anchorKey, x: 0, y: 0 });
	const shift = offset.key === anchorKey ? offset : { x: 0, y: 0 };

	useLayoutEffect(() => {
		const panel = ownRef.current;
		if (!panel || anchorKey === "") return;
		const place = () => {
			const rect = anchor?.getBoundingClientRect();
			setPlacement(
				placePopup(
					rect
						? {
								left: rect.left,
								top: rect.top,
								width: rect.width,
								height: rect.height,
							}
						: null,
					{ width: panel.offsetWidth, height: panel.offsetHeight },
					{ width: window.innerWidth, height: window.innerHeight },
				),
			);
		};
		place();
		window.addEventListener("resize", place);
		return () => window.removeEventListener("resize", place);
	}, [anchor, anchorKey]);

	const startDrag = (event: PointerEvent<HTMLElement>) => {
		if (event.button !== 0) return;
		if (
			event.target instanceof Element &&
			event.target.closest("button, input, select, a")
		)
			return;
		event.preventDefault();
		const from = { x: event.clientX - shift.x, y: event.clientY - shift.y };
		const move = (moved: globalThis.PointerEvent) =>
			setOffset({
				key: anchorKey,
				x: moved.clientX - from.x,
				y: moved.clientY - from.y,
			});
		const stop = () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", stop);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", stop);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (!wrapTab || event.key !== "Tab") return;
		const items = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
		);
		if (items.length === 0) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	return (
		<div
			ref={(node) => {
				ownRef.current = node;
				if (typeof panelRef === "function") panelRef(node);
				else if (panelRef) panelRef.current = node;
			}}
			role="dialog"
			aria-modal="false"
			aria-labelledby={labelledBy}
			data-calendar-popover=""
			onKeyDown={onKeyDown}
			className={cn(
				"fixed z-40 w-[26rem] max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-surface-raised text-fg shadow-xl shadow-black/20",
				placement === null && "invisible",
				className,
			)}
			style={{
				left: (placement?.left ?? 0) + shift.x,
				top: (placement?.top ?? 0) + shift.y,
			}}
		>
			{header?.({ onPointerDown: startDrag })}
			{children}
		</div>
	);
}
