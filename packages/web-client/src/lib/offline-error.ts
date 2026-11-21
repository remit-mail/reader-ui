/** An expected device/session limitation, rendered beside downloaded mail. */
export class OfflineUnavailableError extends Error {
	constructor(message: string, cause?: unknown) {
		super(message, { cause });
		this.name = "OfflineUnavailableError";
	}
}
