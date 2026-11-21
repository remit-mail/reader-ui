import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { configOperationsGetConfig } from "@remit/api-http-client/sdk.gen.ts";
import { queryOptions } from "@tanstack/react-query";

/**
 * The generated config query without the abort signal. Each read makes the
 * server queue a sync of every account, and React Query cancels a fetch that
 * read its signal once the last observer unmounts, so the next mount read the
 * config a second time.
 */
export const configQueryOptions = () =>
	queryOptions({
		...configOperationsGetConfigOptions(),
		queryFn: async () => {
			const { data } = await configOperationsGetConfig({ throwOnError: true });
			return data;
		},
	});
