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
import { useLabelList } from "../../../hooks/useLabels";
import type { ThreadCollection } from "../../../lib/collection-criteria";
import { useMailContext } from "../../../lib/mail-context";
import { labelSearchSchema } from "../../../lib/mail-search";
import { useOpenThreadPath, useSearchMirror } from "../../../routing";

function LabelLayout() {
	const { labelId } = Route.useParams();
	const { accounts } = useMailContext();
	const thread = useOpenThreadPath();
	const { labels } = useLabelList(accounts[0]?.accountId);
	const name = labels.find((label) => label.labelId === labelId)?.name ?? "";
	useSearchMirror({ to: "/mail/label/$labelId", params: { labelId } });
	const collection = useMemo<ThreadCollection>(() => ({ labelId }), [labelId]);

	return (
		<CollectionPane collection={collection} title={name} thread={thread}>
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
