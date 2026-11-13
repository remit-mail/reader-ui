// biome-ignore lint/style/useFilenamingConvention: TanStack Router convention
/**
 * /mail/label/$labelId/compose — the compose surface, open over a label, and
 * /mail/label/$labelId/compose/<outboxMessageId> once it has a draft.
 */
import { createFileRoute } from "@tanstack/react-router";
import { FullCompose } from "../../../../components/compose/FullCompose";

export const Route = createFileRoute(
	"/mail/label/$labelId/compose/{-$outboxMessageId}",
)({
	component: FullCompose,
});
