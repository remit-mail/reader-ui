export const OFFLINE_ERROR_EVENT = "remit:offline-error";

/** An expected device/session limitation, rendered beside downloaded mail. */
export class OfflineUnavailableError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, { cause });
		this.name = "OfflineUnavailableError";
	}
}
