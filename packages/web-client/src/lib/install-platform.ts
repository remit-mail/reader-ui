type InstallPlatform =
	| "chromium-prompt"
	| "ios-safari"
	| "macos-safari"
	| "none";

export function installPlatform({
	userAgent,
	touchPoints,
	standalone,
	hasPrompt,
}: {
	userAgent: string;
	touchPoints: number;
	standalone: boolean;
	hasPrompt: boolean;
}): InstallPlatform {
	if (standalone) return "none";
	// The event is the capability check, including Chromium browsers on Mac.
	if (hasPrompt) return "chromium-prompt";
	const safari =
		/Version\/.*Safari\//.test(userAgent) &&
		!/Chrome|Chromium|CriOS|Edg|OPR|OPiOS|FxiOS|Firefox|Android/.test(
			userAgent,
		);
	if (!safari) return "none";
	if (/iPhone|iPad|iPod/.test(userAgent)) return "ios-safari";
	if (/Macintosh/.test(userAgent)) {
		if (touchPoints > 1) return "ios-safari";
		// Add to Dock arrived in Safari 17.
		return Number(/Version\/(\d+)/.exec(userAgent)?.[1]) >= 17
			? "macos-safari"
			: "none";
	}
	return "none";
}
