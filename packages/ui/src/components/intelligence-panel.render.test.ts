import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { isThreadCategory } from "../category-presentation.js";
import type { IntelligenceCalendarActions } from "./intelligence-calendar.js";
import { inviteWithClash } from "./intelligence-calendar-fixtures.js";
import type {
	IntelligenceData,
	IntelligenceTabId,
} from "./intelligence-panel.js";
import { IntelligencePanel } from "./intelligence-panel.js";

const vipSender: IntelligenceData = {
	sender: {
		name: "Sabrina Basten",
		email: "sabrina@sabrinabasten.example",
		trust: "vip",
		firstSeenLabel: "Mar 2023",
		inboundCount: 214,
		replyCount: 188,
	},
	category: { value: "personal" },
	spamAction: "reportSpam",
	flags: { vip: true },
};

const inertCalendar: IntelligenceCalendarActions = {
	onAddInvite: () => undefined,
	onTentativeInvite: () => undefined,
	onDeclineInvite: () => undefined,
	onReopenInvite: () => undefined,
	onOfferOtherTimes: () => undefined,
	onRemoveInvite: () => undefined,
	onOpenNewerInvite: () => undefined,
	onToggleSlot: () => undefined,
	onAddSuggestion: () => undefined,
	onReviewSuggestion: () => undefined,
	onDismissSuggestion: () => undefined,
	onOpenThread: () => undefined,
	onSelectEvent: () => undefined,
};

function panel(tab: IntelligenceTabId): string {
	return renderToString(
		createElement(IntelligencePanel, {
			data: vipSender,
			calendar: { data: inviteWithClash, actions: inertCalendar },
			tab,
		}),
	);
}

describe("IntelligencePanel tab strip", () => {
	it("offers no strip to a host that wired no calendar", () => {
		const html = renderToString(
			createElement(IntelligencePanel, { data: vipSender }),
		);
		assert.doesNotMatch(html, /radiogroup/);
		assert.match(html, /Quick actions/);
	});

	it("swaps the stack for the calendar rather than stacking both", () => {
		const calendar = panel("calendar");
		assert.match(calendar, /Add to calendar/);
		assert.doesNotMatch(calendar, /Coming soon/);
		assert.doesNotMatch(calendar, /Quick actions/);
	});
});

describe("isThreadCategory", () => {
	it("rejects a category this build has no tone for", () => {
		assert.equal(isThreadCategory("invoice"), false);
		assert.equal(isThreadCategory("Personal"), false);
		assert.equal(isThreadCategory("toString"), false);
	});
});
