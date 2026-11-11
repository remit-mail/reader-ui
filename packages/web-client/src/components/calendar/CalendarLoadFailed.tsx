import { formatErrorMessage } from "@remit/ui";
import { CircleAlert } from "@remit/ui/icons";
import { calendarEventReportHref } from "../../lib/calendar-report";

export interface CalendarLoadFailedProps {
	title: string;
	error: unknown;
	onRetry: () => void;
	compact?: boolean;
}

/** A read that failed, said where it was asked for, with Retry and a prefilled report. */
export function CalendarLoadFailed({
	title,
	error,
	onRetry,
	compact = false,
}: CalendarLoadFailedProps) {
	const message = formatErrorMessage(error);
	return (
		<div
			role="alert"
			className={
				compact
					? "flex flex-col gap-2 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm"
					: "flex h-full flex-col items-center justify-center gap-3 p-8 text-center"
			}
		>
			{!compact && (
				<CircleAlert className="size-8 text-danger" aria-hidden="true" />
			)}
			<div>
				<p className="font-medium text-danger">{title}</p>
				<p className="mt-1 break-words text-sm text-fg-muted">{message}</p>
			</div>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onRetry}
					className="inline-flex items-center rounded-md border border-line bg-canvas px-3 py-1.5 text-sm font-medium hover:bg-surface-raised"
				>
					Retry
				</button>
				<a
					href={calendarEventReportHref(`${title}: ${message}`)}
					target="_blank"
					rel="noreferrer"
					className="text-sm font-medium text-accent hover:underline"
				>
					Report an issue
				</a>
			</div>
		</div>
	);
}
