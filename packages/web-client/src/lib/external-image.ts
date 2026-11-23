import { admitContent, type Partition } from "./offline-store";

/** Read the complete stream before any bytes can be displayed or saved. */
export const externalImageBytes = async (
	response: Response,
	partition?: Partition,
): Promise<Blob> => {
	const mime = response.headers
		.get("content-type")
		?.split(";")[0]
		?.trim()
		.toLowerCase();
	if (
		!mime ||
		!/^image\/[a-z0-9.+-]+$/.test(mime) ||
		mime === "image/svg+xml" ||
		!(await admitContent(response, mime, partition))
	)
		throw new Error(
			"External image refused: unexpected status, MIME, redirect or tenant",
		);
	return await response.blob();
};

export const requestExternalImage = (
	proxyUrl: string,
	resolvedRemoteUrl: string,
): Promise<Response> =>
	fetch(proxyUrl, {
		method: "POST",
		credentials: "same-origin",
		redirect: "manual",
		headers: { "Content-Type": "text/plain;charset=UTF-8" },
		body: resolvedRemoteUrl,
	});
