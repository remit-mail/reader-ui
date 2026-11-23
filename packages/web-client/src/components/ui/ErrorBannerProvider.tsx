import { type ErrorBannerEntry, ErrorBannerStack } from "@remit/ui";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { OFFLINE_ERROR_EVENT } from "../../lib/offline-error";
import { bannerWayOut, ErrorBannerContext } from "./error-banner-context";
import {
	appendBanner,
	buildEntry,
	dismissBanner,
	formatErrorDetail,
	type PushErrorInput,
} from "./error-banners.js";

const generateId = (): string => {
	if (
		typeof globalThis.crypto !== "undefined" &&
		typeof globalThis.crypto.randomUUID === "function"
	) {
		return globalThis.crypto.randomUUID();
	}
	return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const ErrorBannerProvider = ({ children }: { children: ReactNode }) => {
	const { t } = useTranslation("common", { useSuspense: false });
	const [errors, setErrors] = useState<ErrorBannerEntry[]>([]);

	const pushError = useCallback((input: PushErrorInput): string => {
		const entry = buildEntry(
			{ ...input, action: bannerWayOut(input) },
			generateId(),
			Date.now(),
		);
		setErrors((current) => appendBanner(current, entry));
		return entry.id;
	}, []);

	useEffect(() => {
		const report = (event: Event) => {
			const error = (event as CustomEvent<unknown>).detail;
			pushError({
				title: t("offlineStorage.failed", "Downloads could not be updated"),
				detail: formatErrorDetail(error),
				error,
			});
		};
		window.addEventListener(OFFLINE_ERROR_EVENT, report);
		return () => window.removeEventListener(OFFLINE_ERROR_EVENT, report);
	}, [pushError, t]);

	const dismissError = useCallback((id: string) => {
		setErrors((current) => dismissBanner(current, id));
	}, []);

	const clearAll = useCallback(() => {
		setErrors([]);
	}, []);

	const value = useMemo(
		() => ({ errors, pushError, dismissError, clearAll }),
		[errors, pushError, dismissError, clearAll],
	);

	return (
		<ErrorBannerContext.Provider value={value}>
			{children}
			<ErrorBannerStack errors={errors} onDismiss={dismissError} />
		</ErrorBannerContext.Provider>
	);
};
