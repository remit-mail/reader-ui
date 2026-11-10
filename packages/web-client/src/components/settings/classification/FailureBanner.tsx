import { Banner, Button, formatErrorMessage } from "@remit/ui";
import { classificationReportHref } from "../../../lib/classification";
import { ReportLink } from "../ReportLink";

export interface ClassificationFailure {
	title: string;
	error: unknown;
}

export function FailureBanner({
	failure,
	onRetry,
}: {
	failure: ClassificationFailure;
	onRetry?: () => void;
}) {
	const message = formatErrorMessage(failure.error);
	return (
		<Banner tone="danger" variant="soft">
			<p className="font-medium">{failure.title}</p>
			<p className="mt-0.5 break-words text-fg-muted">{message}</p>
			<p className="flex flex-wrap items-center gap-x-4">
				{onRetry && (
					<Button variant="secondary" className="min-h-11" onClick={onRetry}>
						Retry
					</Button>
				)}
				<ReportLink href={classificationReportHref(failure.title, message)} />
			</p>
		</Banner>
	);
}
