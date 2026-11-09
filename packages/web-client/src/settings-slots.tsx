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
	help?: ReactNode;
}

const SettingsSlotsContext = createContext<SettingsSlot[]>([]);

export const SettingsSlotsProvider = SettingsSlotsContext.Provider;

export const useSettingsSlots = (): SettingsSlot[] =>
	useContext(SettingsSlotsContext);

export const useSettingsSlot = (id: string): SettingsSlot | undefined =>
	useSettingsSlots().find((slot) => slot.id === id);
