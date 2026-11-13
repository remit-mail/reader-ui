import type { Ref } from "react";
import { Banner } from "./banner.js";
import { Button } from "./button.js";

export interface FailureBannerProps {
	title: string;
	message: string;
	reportHref: string;
	onRetry?: () => void;
	retryLabel?: string;
	retryRef?: Ref<HTMLButtonElement>;
}

/** A settings section's failure: what failed, the error, a retry and a report link. */
export function FailureBanner({
	title,
	message,
	reportHref,
	onRetry,
	retryLabel = "Retry",
	retryRef,
}: FailureBannerProps) {
	return (
		<Banner tone="danger" variant="soft">
			<p className="font-medium">{title}</p>
			<p className="mt-0.5 break-words text-fg-muted">{message}</p>
			<p className="flex flex-wrap items-center gap-x-4">
				{onRetry && (
					<Button
						ref={retryRef}
						variant="secondary"
						className="min-h-11"
						onClick={onRetry}
					>
						{retryLabel}
					</Button>
				)}
				<a
					href={reportHref}
					target="_blank"
					rel="noreferrer"
					className="inline-flex min-h-11 items-center font-medium text-accent hover:underline"
				>
					Report an issue
				</a>
			</p>
		</Banner>
	);
}
