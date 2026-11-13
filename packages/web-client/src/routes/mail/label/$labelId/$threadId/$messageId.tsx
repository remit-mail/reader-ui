/**
 * /mail/label/$labelId/$threadId/$messageId — the same conversation, with one
 * of its messages expanded and scrolled to. It mounts the pane rather than
 * delegating to an index route, because the reply is a segment under it.
 */
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPane } from "../../../../../components/mail/CollectionPane";

function LabelMessagePane() {
	return <CollectionPane.Reading />;
}

export const Route = createFileRoute(
	"/mail/label/$labelId/$threadId/$messageId",
)({
	component: LabelMessagePane,
});
