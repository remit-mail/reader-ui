import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const NONE: ReadonlySet<string> = new Set();

/** Every account's appointed Spam folder, which decides moved from suspected. */
export const useJunkMailboxIds = (): ReadonlySet<string> => {
	const { data } = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: Infinity,
	});
	return useMemo(() => {
		const ids = (data?.accounts ?? []).flatMap((account) =>
			account.folderAppointments.flatMap((appointment) =>
				appointment.role === "Junk" && appointment.mailboxId
					? [appointment.mailboxId]
					: [],
			),
		);
		return ids.length === 0 ? NONE : new Set(ids);
	}, [data?.accounts]);
};
