import { createFileRoute } from "@tanstack/react-router";
import { CollectionPane } from "../../../../../components/mail/CollectionPane";

function LabelThreadPane() {
	return <CollectionPane.Reading />;
}

export const Route = createFileRoute("/mail/label/$labelId/$threadId/")({
	component: LabelThreadPane,
});
