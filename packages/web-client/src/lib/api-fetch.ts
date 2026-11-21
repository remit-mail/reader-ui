import { taggedFetch } from "./network-error";
import { getOfflineRuntime, validateNetworkPartition } from "./offline-runtime";

/** The mail API boundary, independent of API origin and authentication transport. */
export const apiFetch: typeof fetch = async (input, init) => {
	const runtime = getOfflineRuntime();
	const partition = runtime
		? await runtime.authorizeNetwork(
				init?.method ?? (input instanceof Request ? input.method : "GET"),
			)
		: undefined;
	const response = await taggedFetch(input, init);
	if (partition) await validateNetworkPartition(response, partition);
	return response;
};
