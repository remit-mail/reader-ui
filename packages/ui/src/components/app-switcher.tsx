import { type MouseEvent, useRef } from "react";
import { CalendarDays, Mail } from "../icons.js";
import { cn } from "../lib/cn.js";
import { useRovingFocus } from "../lib/roving-focus.js";

export type AppId = "mail" | "calendar";

export interface AppSwitchItem {
	id: AppId;
	label: string;
	href: string;
}

export interface AppSwitcherProps {
	items: readonly AppSwitchItem[];
	active: AppId;
	/** Runs on a plain click; a modified click follows the link natively. */
	onNavigate: (id: AppId) => void;
	className?: string;
}

const ICONS = { mail: Mail, calendar: CalendarDays } as const;

const APP_ITEM_SELECTOR = "[data-app-item]";

const isPlainClick = (click: MouseEvent<HTMLAnchorElement>): boolean =>
	click.button === 0 &&
	!click.metaKey &&
	!click.ctrlKey &&
	!click.shiftKey &&
	!click.altKey;

function AppLink({
	item,
	active,
	onNavigate,
	className,
	iconClassName,
}: {
	item: AppSwitchItem;
	active: boolean;
	onNavigate: (id: AppId) => void;
	className: string;
	iconClassName: string;
}) {
	const Icon = ICONS[item.id];
	return (
		<a
			href={item.href}
			data-app-item=""
			aria-current={active ? "page" : undefined}
			onClick={(click) => {
				if (!isPlainClick(click)) return;
				click.preventDefault();
				onNavigate(item.id);
			}}
			className={cn(
				"flex flex-col items-center justify-center gap-0.5 rounded-lg outline-none transition-colors",
				"focus-visible:ring-2 focus-visible:ring-ring",
				active
					? "bg-accent-soft text-accent"
					: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
				className,
			)}
		>
			<Icon className={iconClassName} aria-hidden="true" />
			<span className="text-2xs font-medium">{item.label}</span>
		</a>
	);
}

export function AppBar({
	items,
	active,
	onNavigate,
	className,
}: AppSwitcherProps) {
	const navRef = useRef<HTMLElement>(null);
	useRovingFocus({ containerRef: navRef, itemSelector: APP_ITEM_SELECTOR });
	return (
		<nav
			ref={navRef}
			aria-label="Apps"
			className={cn(
				"flex w-16 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-2",
				className,
			)}
		>
			{items.map((item) => (
				<AppLink
					key={item.id}
					item={item}
					active={item.id === active}
					onNavigate={onNavigate}
					className="size-14"
					iconClassName="size-5"
				/>
			))}
		</nav>
	);
}

export function AppTabBar({
	items,
	active,
	onNavigate,
	className,
}: AppSwitcherProps) {
	return (
		<nav
			aria-label="Apps"
			className={cn(
				"flex shrink-0 items-stretch justify-around border-t border-line bg-surface px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]",
				className,
			)}
		>
			{items.map((item) => (
				<AppLink
					key={item.id}
					item={item}
					active={item.id === active}
					onNavigate={onNavigate}
					className="min-h-12 min-w-16 flex-1"
					iconClassName="size-5"
				/>
			))}
		</nav>
	);
}
