/**
 * Shapes the spam UI needs that reader's API does not carry yet. Each names
 * the PRD 041 RFC gap that will supply it; the shape moves to
 * `spam-contract.ts` when the API publishes it.
 */

/** RFC gap 8: how many messages the reader marked Not spam on one day. */
export interface SpamNotSpamDay {
	date: string;
	count: number;
}
