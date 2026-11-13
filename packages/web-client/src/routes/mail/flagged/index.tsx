import { createFileRoute } from "@tanstack/react-router";
import { CollectionPane } from "../../../components/mail/CollectionPane";

function FlaggedReadingPane() {
	return <CollectionPane.Reading />;
}

export const Route = createFileRoute("/mail/flagged/")({
	component: FlaggedReadingPane,
});
