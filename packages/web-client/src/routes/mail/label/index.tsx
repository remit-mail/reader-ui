/**
 * `/mail/label` names no label, so it is no list. Without this route the
 * segment would be read as a mailbox id; it goes on to the brief the way `/mail`
 * does.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { mailIndexSearchSchema } from "../../../lib/mail-search";

export const Route = createFileRoute("/mail/label/")({
	validateSearch: mailIndexSearchSchema,
	beforeLoad: ({ search, location }) => {
		throw redirect({
			to: "/mail/brief",
			search,
			hash: location.hash,
			replace: true,
		});
	},
});
