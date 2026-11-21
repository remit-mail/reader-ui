export interface ListPage<T> {
	items: T[];
	continuationToken?: string;
}

/**
 * Follow a list endpoint's `continuationToken` and yield each page's items,
 * stopping at the last page, after `maxPages`, or once `signal` aborts.
 */
export async function* listPages<T>(
	fetchPage: (continuationToken: string | undefined) => Promise<ListPage<T>>,
	{ maxPages, signal }: { maxPages: number; signal: AbortSignal },
): AsyncGenerator<T[]> {
	let continuationToken: string | undefined;
	for (let page = 0; page < maxPages; page += 1) {
		if (signal.aborted) return;
		const data = await fetchPage(continuationToken);
		yield data.items;
		if (!data.continuationToken) return;
		continuationToken = data.continuationToken;
	}
}
