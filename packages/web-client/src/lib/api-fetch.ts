import { taggedFetch } from "./network-error";
import { getOfflineRuntime } from "./offline-runtime";
import { fetchInPartition } from "./offline-store";

/** The mail API boundary, independent of API origin and authentication transport. */
export const apiFetch: typeof fetch = async (input, init) => {
	const runtime = getOfflineRuntime();
	const partition = runtime
		? await runtime.authorizeNetwork(
				init?.method ?? (input instanceof Request ? input.method : "GET"),
			)
		: undefined;
	return partition
		? fetchInPartition(partition, input, init)
		: taggedFetch(input, init);
};
