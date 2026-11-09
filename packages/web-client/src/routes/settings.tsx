/**
 * Settings layout route — a pass-through Outlet. Each child page
 * (`/settings/accounts`, `/settings/senders`, …) renders its own
 * full-viewport `SettingsShell` from @remit/ui, exactly as the
 * approved Storybook stories do. This route only provides the route
 * boundary; no layout chrome lives here.
 *
 * Shared nav items and helpers are exported so every child page imports
 * them from this file, keeping a single source of truth for nav shape.
 */
import type { SettingsNavItem } from "@remit/ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	CalendarDays,
	Filter,
	FolderTree,
	Inbox,
	Palette,
	ShieldCheck,
	Tag,
	UserCog,
	Users,
} from "lucide-react";
import { AdvancedNavIcon } from "../components/settings/AdvancedNavIcon";
import { WarningsNavIcon } from "../components/settings/WarningsNavIcon";
import { usePeople } from "../hooks/usePeople";

/* ------------------------------------------------------------------ */
/* Nav items — single source of truth shared by all settings pages    */
/* ------------------------------------------------------------------ */

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
	{ id: "accounts", label: "Accounts", icon: <Inbox className="size-4" /> },
	{
		id: "security",
		label: "Security",
		icon: <ShieldCheck className="size-4" />,
	},
	{
		id: "senders",
		label: "Senders & Rules",
		icon: <Users className="size-4" />,
	},
	{
		id: "folders",
		label: "Folder roles",
		icon: <FolderTree className="size-4" />,
	},
	{
		id: "filters",
		label: "Filters",
		icon: <Filter className="size-4" />,
	},
	{
		id: "labels",
		label: "Labels",
		icon: <Tag className="size-4" />,
	},
	{
		id: "calendars",
		label: "Calendars",
		icon: <CalendarDays className="size-4" />,
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: <Palette className="size-4" />,
	},
	{
		id: "warnings",
		label: "Warnings",
		icon: <WarningsNavIcon />,
	},
	{ id: "advanced", label: "Advanced", icon: <AdvancedNavIcon /> },
];

export const SETTINGS_ID_TO_PATH: Record<string, string> = {
	accounts: "/settings/accounts",
	security: "/settings/security",
	senders: "/settings/senders",
	folders: "/settings/folders",
	filters: "/settings/filters",
	labels: "/settings/labels",
	calendars: "/settings/calendars",
	appearance: "/settings/appearance",
	warnings: "/settings/warnings",
	people: "/settings/people",
	advanced: "/settings/advanced",
};

const PEOPLE_NAV_ITEM: SettingsNavItem = {
	id: "people",
	label: "People",
	icon: <UserCog className="size-4" />,
};

/**
 * The nav every settings page renders. People shows only once the server lists
 * people: it answers 404 while self sign-up is open or off self-host.
 */
export const useSettingsNavItems = (): SettingsNavItem[] => {
	const people = usePeople();
	if (!people.isSuccess) return SETTINGS_NAV_ITEMS;
	const advanced = SETTINGS_NAV_ITEMS.findIndex(
		(item) => item.id === "advanced",
	);
	return [
		...SETTINGS_NAV_ITEMS.slice(0, advanced),
		PEOPLE_NAV_ITEM,
		...SETTINGS_NAV_ITEMS.slice(advanced),
	];
};

/* ------------------------------------------------------------------ */
/* Route — pass-through                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/settings")({
	component: () => <Outlet />,
});
