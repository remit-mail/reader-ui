import {
	type ComponentType,
	createContext,
	type ReactNode,
	useContext,
} from "react";

/**
 * A settings section the host registers. It routes at `/settings/<id>` and
 * joins the settings nav beside the built-in sections.
 */
export interface SettingsSlot {
	id: string;
	label: string;
	icon: ReactNode;
	Component: ComponentType;
	help: ReactNode;
}

interface SettingsComposition {
	settingsSlots: SettingsSlot[];
	peopleDestinationUrl?: string;
}

const SettingsContext = createContext<SettingsComposition>({
	settingsSlots: [],
});

export const SettingsProvider = SettingsContext.Provider;

export const useSettingsSlots = (): SettingsSlot[] =>
	useContext(SettingsContext).settingsSlots;

export const usePeopleDestinationUrl = (): string | undefined =>
	useContext(SettingsContext).peopleDestinationUrl;
