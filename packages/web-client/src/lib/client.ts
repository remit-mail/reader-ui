import { client } from "@remit/api-http-client/client.gen.ts";
import { getRuntimeConfig } from "../runtime-config";
import { ApiError, wrapHttpFailure } from "./api";
import { apiFetch } from "./api-fetch";

// In production, the config.js apiUrl points at the deployed API Gateway.
// In local dev, the Vite proxy forwards /api -> localhost:4321 (see vite.config.ts).
const baseUrl = getRuntimeConfig().apiUrl;

client.setConfig({
	baseUrl,
	// Transport failures are tagged where they happen; see `network-error.ts`.
	fetch: apiFetch,
});

client.interceptors.error.use((error, response) => {
	if (error instanceof ApiError) return error;
	if (!response) return error;

	return wrapHttpFailure(error, response.status);
});

export { client };

export const installPwaBuildObservation = (): void => {
	const isConfigRequest = (request: Request): boolean =>
		request.method === "GET" &&
		new URL(request.url).pathname.endsWith("/config");
	client.interceptors.request.use((request) =>
		isConfigRequest(request)
			? new Request(request, { cache: "no-store" })
			: request,
	);

	// This interceptor only sees network responses, never persisted query data.
	client.interceptors.response.use(async (response, request) => {
		if (response.ok && isConfigRequest(request)) {
			const config = await response.clone().json();
			window.dispatchEvent(
				new CustomEvent("remit:server-build", { detail: config.buildCommit }),
			);
		}
		return response;
	});
};
