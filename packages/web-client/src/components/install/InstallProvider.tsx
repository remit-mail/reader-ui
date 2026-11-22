import { Button, Dialog } from "@remit/ui";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { installPlatform } from "../../lib/install-platform";

export interface InstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "remit.installDismissed";
const InstallContext = createContext<{
	available: boolean;
	dismissed: boolean;
	install: () => void;
	dismiss: () => void;
	restore: () => void;
} | null>(null);

export const useInstall = () => useContext(InstallContext);

/** Hosts opt in through the preset; no listeners or storage reads otherwise. */
export function InstallProvider({
	enabled = typeof __REMIT_PWA_ENABLED__ !== "undefined" &&
		__REMIT_PWA_ENABLED__,
	children,
}: {
	enabled?: boolean;
	children?: ReactNode;
}) {
	return enabled ? <InstallController>{children}</InstallController> : children;
}

function InstallController({ children }: { children: ReactNode }) {
	const { t } = useTranslation("common", { useSuspense: false });
	const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
	const [installed, setInstalled] = useState(false);
	const [standalone, setStandalone] = useState(
		() =>
			window.matchMedia("(display-mode: standalone)").matches ||
			Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
	);
	const [dismissed, setDismissed] = useState(
		() => window.localStorage.getItem(DISMISSED_KEY) === "true",
	);
	const [hintOpen, setHintOpen] = useState(false);

	useEffect(() => {
		const media = window.matchMedia("(display-mode: standalone)");
		const capture = (event: Event) => {
			event.preventDefault();
			setPrompt(event as InstallPromptEvent);
		};
		const installed = () => {
			setInstalled(true);
			setPrompt(null);
		};
		const modeChanged = () =>
			setStandalone(
				media.matches ||
					Boolean(
						(navigator as Navigator & { standalone?: boolean }).standalone,
					),
			);
		window.addEventListener("beforeinstallprompt", capture);
		window.addEventListener("appinstalled", installed);
		media.addEventListener("change", modeChanged);
		return () => {
			window.removeEventListener("beforeinstallprompt", capture);
			window.removeEventListener("appinstalled", installed);
			media.removeEventListener("change", modeChanged);
		};
	}, []);

	const platform = installPlatform({
		userAgent: navigator.userAgent,
		touchPoints: navigator.maxTouchPoints,
		standalone: standalone || installed,
		hasPrompt: prompt !== null,
	});
	const dismiss = () => {
		window.localStorage.setItem(DISMISSED_KEY, "true");
		setDismissed(true);
		setHintOpen(false);
	};
	const install = async () => {
		if (!prompt) {
			setHintOpen(true);
			return;
		}
		// A deferred prompt can only be used once. Call it in the click gesture.
		const pending = prompt.prompt();
		setPrompt(null);
		await pending;
		const choice = await prompt.userChoice;
		if (choice.outcome === "dismissed") dismiss();
	};
	const title = t("install.title", "Install app");

	return (
		<InstallContext.Provider
			value={{
				available: platform !== "none",
				dismissed,
				install: () => void install(),
				dismiss,
				restore: () => {
					window.localStorage.removeItem(DISMISSED_KEY);
					setDismissed(false);
				},
			}}
		>
			{children}
			<Dialog
				open={hintOpen && platform !== "none" && !dismissed}
				onClose={() => setHintOpen(false)}
				title={title}
			>
				<div className="space-y-4 p-5">
					<h2 className="text-base font-semibold text-fg">{title}</h2>
					<ol className="list-decimal space-y-2 pl-5 text-sm text-fg-muted">
						<li>
							{platform === "ios-safari"
								? t("install.share", "Tap Share in Safari.")
								: t("install.file", "Open the File menu in Safari.")}
						</li>
						<li>
							{platform === "ios-safari"
								? t("install.homeScreen", "Choose Add to Home Screen.")
								: t("install.dock", "Choose Add to Dock.")}
						</li>
					</ol>
					<Button variant="secondary" onClick={() => setHintOpen(false)}>
						{t("install.close", "Got it")}
					</Button>
				</div>
			</Dialog>
		</InstallContext.Provider>
	);
}
