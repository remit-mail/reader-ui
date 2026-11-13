import {
	formatErrorMessage,
	FailureBanner as SectionFailureBanner,
} from "@remit/ui";
import { classificationReportHref } from "../../../lib/classification";

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
		<SectionFailureBanner
			title={failure.title}
			message={message}
			reportHref={classificationReportHref(failure.title, message)}
			onRetry={onRetry}
		/>
	);
}
