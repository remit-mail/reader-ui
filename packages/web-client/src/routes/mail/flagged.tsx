/**
 * /mail/flagged — the Flagged virtual mailbox, one of the four list layouts.
 *
 * A flat starred list across accounts; same slots as the brief, intelligence
 * rail included. The reading pane is the `Outlet`, so what it shows is whatever
 * route matched below this one, and the open thread and the message inside it
 * are the segments there rather than a selection read out of the query.
 */
import { ErrorState } from "@remit/ui";
import {
	createFileRoute,
	type ErrorComponentProps,
	Outlet,
} from "@tanstack/react-router";
import { MailShell } from "../../components/layout/MailShell";
import { CollectionPane } from "../../components/mail/CollectionPane";
import { STARRED } from "../../lib/collection-criteria";
import { flaggedSearchSchema } from "../../lib/mail-search";
import { useOpenThreadPath, useSearchMirror } from "../../routing";

const FlaggedError = ({ error, reset }: ErrorComponentProps) => (
	<div className="flex h-full items-center justify-center bg-canvas p-4">
		<ErrorState
			title="Couldn't load your starred mail"
			error={error}
			onRetry={reset}
		/>
	</div>
);

function FlaggedLayout() {
	const thread = useOpenThreadPath();
	useSearchMirror({ to: "/mail/flagged" });

	return (
		<CollectionPane collection={STARRED} title="Starred" thread={thread}>
			<MailShell
				phone={<CollectionPane.Phone />}
				list={<CollectionPane.List />}
				reading={<Outlet />}
				intelligence={<CollectionPane.Intelligence />}
				hasThread={Boolean(thread)}
			/>
		</CollectionPane>
	);
}

export const Route = createFileRoute("/mail/flagged")({
	component: FlaggedLayout,
	validateSearch: flaggedSearchSchema,
	errorComponent: FlaggedError,
});
