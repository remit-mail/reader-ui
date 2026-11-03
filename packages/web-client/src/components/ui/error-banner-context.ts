import type { ErrorBannerAction, ErrorBannerEntry } from "@remit/ui";
import { createContext, useContext } from "react";
import {
	buildBugReportContext,
	buildGitHubIssueUrl,
} from "../../lib/bug-report";
import type { PushErrorInput } from "./error-banners.js";

/*
 * The context lives apart from the provider component so a dev-server hot
 * update of the provider keeps one context object; a second one leaves every
 * consumer outside the provider until the page reloads.
 */
export interface ErrorBannerContextValue {
	errors: ErrorBannerEntry[];
	pushError: (input: PushErrorInput) => string;
	dismissError: (id: string) => void;
	clearAll: () => void;
}

export const ErrorBannerContext = createContext<ErrorBannerContextValue | undefined>(
	undefined,
);

/**
 * A way out of every failure banner. A soft failure is still a failure the
 * user could not prevent and cannot diagnose, and a banner offering only
 * "Dismiss" is a dead end — the fatal screen has carried a prefilled report
 * since issue #55 and the soft surface never did. The report is seeded from
 * the banner it belongs to, so it names the failure instead of asking the
 * user to describe it, and it carries the same breadcrumbs — failing request,
 * navigation, console — the fatal report does.
 *
 * A caller that already has a better way out keeps it, and a warning or an
 * informational banner gets none: those are not failures to report.
 */
export const bannerWayOut = (
	input: PushErrorInput,
): ErrorBannerAction | undefined => {
	if (input.action) return input.action;
	if ((input.severity ?? "error") !== "error") return undefined;
	return {
		label: "Report an issue",
		href: buildGitHubIssueUrl(
			buildBugReportContext({
				title: `Bug: ${input.title}`,
				errorMessage: input.detail
					? `${input.title} — ${input.detail}`
					: input.title,
				stack: input.error instanceof Error ? input.error.stack : undefined,
			}),
		),
	};
};

export const useErrorBanners = (): ErrorBannerContextValue => {
	const context = useContext(ErrorBannerContext);
	if (!context) {
		throw new Error(
			"useErrorBanners must be used within an ErrorBannerProvider",
		);
	}
	return context;
};
