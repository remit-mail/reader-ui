import { createFileRoute } from "@tanstack/react-router";
import { CollectionPane } from "../../../../components/mail/CollectionPane";

function LabelReadingPane() {
	return <CollectionPane.Reading />;
}

export const Route = createFileRoute("/mail/label/$labelId/")({
	component: LabelReadingPane,
});
