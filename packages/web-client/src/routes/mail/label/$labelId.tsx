/**
 * /mail/label/$labelId — one label across every account, a flat list of the
 * label's folder in each of them.
 *
 * The same layout as Starred: list, reading pane and intelligence rail, with
 * the open thread and the message inside it as the segments below.
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";
import { MailShell } from "../../../components/layout/MailShell";
import { CollectionPane } from "../../../components/mail/CollectionPane";
import { useCurrentMailboxName } from "../../../hooks/useCurrentMailboxName";
import type { ThreadCollection } from "../../../lib/collection-criteria";
import { useMailContext } from "../../../lib/mail-context";
import { labelSearchSchema } from "../../../lib/mail-search";
import { useOpenThreadPath, useSearchMirror } from "../../../routing";

function LabelLayout() {
	const { labelId } = Route.useParams();
	const { accounts } = useMailContext();
	const thread = useOpenThreadPath();
	const name = useCurrentMailboxName({ accounts });
	useSearchMirror({ to: "/mail/label/$labelId", params: { labelId } });
	const collection = useMemo<ThreadCollection>(
		() => ({ kind: "label", labelId }),
		[labelId],
	);

	return (
		<CollectionPane
			collection={collection}
			title={name ?? "Label"}
			thread={thread}
		>
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

export const Route = createFileRoute("/mail/label/$labelId")({
	component: LabelLayout,
	validateSearch: labelSearchSchema,
});
