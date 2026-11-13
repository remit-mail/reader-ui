/**
 * Senders & Rules — 2-pane page: rule groups left, dense filterable
 * sender table right. Built to scale to hundreds of flagged senders.
 *
 * Backend gap (#427): there is no "list all addresses with flag X" endpoint.
 * VIP group: served from GET /me/vip-suggestions (suggested-to-promote list).
 * Muted / Blocked / Never in Spam groups: users search by name/email to find
 * flagged senders via GET /addresses/search; results are filtered client-side
 * on the flag, because the search takes no flag filter (spam spec gap 1).
 * The real flagged-address query endpoint is tracked as a backend issue.
 */
import {
	addressDetailOperationsUpdateAddressMutation,
	addressOperationsSearchAddressesOptions,
	meOperationsListVipSuggestionsOptions,
	meOperationsListVipSuggestionsQueryKey,
} from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type {
	RemitImapAddressResponse,
	RemitImapVipSuggestionEntry,
} from "@remit/api-http-client/types.gen.ts";
import {
	Button,
	ErrorState,
	Input,
	Kbd,
	SenderFlagRow,
	SenderGroupSwitch,
	SettingsShell,
} from "@remit/ui";
import { Search, Star, X } from "@remit/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { formatDate } from "../../lib/format";
import { useOpenSettingsSection } from "../../routing/sections";
import { useSettingsNavItems } from "../settings";
import { sendersHelp } from "./-shared/help-copy";

export const Route = createFileRoute("/settings/senders")({
	component: SendersSettings,
});

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type SenderGroup = "vip" | "muted" | "blocked" | "neverSpam";

type SearchGroup = Exclude<SenderGroup, "vip">;

const groupLabels: Record<SenderGroup, string> = {
	vip: "VIPs",
	muted: "Muted",
	blocked: "Blocked (reported)",
	neverSpam: "Never in Spam",
};

const groupNouns: Record<SearchGroup, string> = {
	muted: "muted",
	blocked: "blocked",
	neverSpam: "never-in-spam",
};

const flagOf = (address: RemitImapAddressResponse, group: SearchGroup) =>
	address.flags?.[group];

/* ------------------------------------------------------------------ */
/* VIP group: served from suggestions endpoint                        */
/* ------------------------------------------------------------------ */

function VipGroupPane({
	query,
	onCount,
}: {
	query: string;
	onCount?: (matched: number, total: number) => void;
}) {
	const { data, isPending, isError, error } = useQuery(
		meOperationsListVipSuggestionsOptions(),
	);
	const queryClient = useQueryClient();

	const addMutation = useMutation({
		...addressDetailOperationsUpdateAddressMutation(),
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: meOperationsListVipSuggestionsQueryKey(),
			});
		},
	});

	const suggestions = data?.suggestions ?? [];
	const q = query.trim().toLowerCase();
	const filtered = q
		? suggestions.filter(
				(s) =>
					(s.displayName ?? "").toLowerCase().includes(q) ||
					s.normalizedEmail.toLowerCase().includes(q),
			)
		: suggestions;

	useEffect(() => {
		onCount?.(filtered.length, suggestions.length);
	}, [onCount, filtered.length, suggestions.length]);

	if (isPending) {
		return (
			<div className="px-row-inset py-3 text-sm text-fg-subtle animate-pulse">
				Loading VIP suggestions…
			</div>
		);
	}

	if (isError) {
		return (
			<div className="px-row-inset py-3">
				<ErrorState
					variant="inline"
					title="Couldn't load VIP suggestions"
					error={error}
				/>
			</div>
		);
	}

	if (suggestions.length === 0) {
		return (
			<div className="px-row-inset py-5 text-sm text-fg-subtle">
				No VIP suggestions yet. As you reply to senders, they&apos;ll appear
				here. Press <Kbd>v</Kbd> on any message to promote a sender to VIP.
			</div>
		);
	}

	if (filtered.length === 0) {
		return (
			<p className="px-row-inset py-5 text-sm text-fg-subtle">
				No VIPs match &ldquo;{query}&rdquo;.
			</p>
		);
	}

	return (
		<>
			<div className="px-row-inset py-1 text-2xs font-semibold uppercase tracking-wider text-fg-subtle">
				Suggested — promote to VIP
			</div>
			{filtered.map((s: RemitImapVipSuggestionEntry) => (
				<SenderFlagRow
					key={s.addressId}
					name={s.displayName ?? s.normalizedEmail}
					email={s.normalizedEmail}
					meta={
						s.replyCount > 0
							? `${s.inboundCount} received · you replied ${s.replyCount}×`
							: `${s.inboundCount} received · you've never replied`
					}
					trailing={
						<Button
							variant="ghost"
							size="sm"
							icon={<Star className="size-3.5" />}
							aria-busy={addMutation.isPending}
							onClick={() => {
								if (addMutation.isPending) return;
								addMutation.mutate({
									path: { addressId: s.addressId },
									body: {
										flags: {
											vip: { value: true, setAt: Date.now(), setBy: "user" },
										},
									},
								});
							}}
						>
							Add VIP
						</Button>
					}
				/>
			))}
		</>
	);
}

/* ------------------------------------------------------------------ */
/* Muted / Blocked groups: search-based (backend gap noted)           */
/* ------------------------------------------------------------------ */

export function SearchGroupPane({
	group,
	query,
	onCount,
}: {
	group: SearchGroup;
	query: string;
	onCount?: (matched: number, total: number | null) => void;
}) {
	const debouncedQ = useDebouncedValue(query.trim(), 300);
	const queryClient = useQueryClient();
	const [retryId, setRetryId] = useState<string | null>(null);

	const enabled = debouncedQ.length >= 2;

	const searchOptions = addressOperationsSearchAddressesOptions({
		query: { q: debouncedQ, limit: 50 },
	});

	const { data, isPending, isError, error } = useQuery({
		...searchOptions,
		enabled,
	});

	const removeMutation = useMutation({
		...addressDetailOperationsUpdateAddressMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: searchOptions.queryKey });
		},
	});

	const items = (data?.items ?? []).filter(
		(a: RemitImapAddressResponse) => flagOf(a, group)?.value ?? false,
	);

	useEffect(() => {
		// Total flagged count is unknown (no list-all-flagged endpoint), so the
		// group rail shows the live matched-row count while a search is active.
		onCount?.(enabled ? items.length : 0, null);
	}, [onCount, enabled, items.length]);

	if (!enabled) {
		// Backend gap: no list-all-flagged endpoint; prompt user to search.
		return (
			<div className="px-row-inset py-5 text-sm text-fg-subtle space-y-2">
				<p>
					Type 2+ characters to search {groupNouns[group]} senders by name or
					address.
				</p>
				<p className="text-2xs text-fg-subtle">
					Note: a dedicated flagged-address list endpoint is in the backlog.
					Press <Kbd>m</Kbd> on any message to mute its sender; <Kbd>b</Kbd> to
					block.
				</p>
			</div>
		);
	}

	if (isPending) {
		return (
			<div className="px-row-inset py-3 text-sm text-fg-subtle animate-pulse">
				Searching…
			</div>
		);
	}

	if (isError) {
		return (
			<div className="px-row-inset py-3">
				<ErrorState variant="inline" title="Search failed" error={error} />
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<p className="px-row-inset py-5 text-sm text-fg-subtle">
				No {groupNouns[group]} senders matching &ldquo;
				{debouncedQ}&rdquo;.
			</p>
		);
	}

	return (
		<>
			{items.map((a: RemitImapAddressResponse) => {
				const flag = flagOf(a, group);
				// The search response carries no engagement counts, so the row's
				// info line is the flag provenance (when/why it was flagged)
				// rather than echoing the email already in the header.
				const meta = flag
					? [
							groupNouns[group],
							flag.setAt
								? formatDate(flag.setAt, {
										month: "short",
										year: "numeric",
									}) || null
								: null,
							flag.reason ? `— ${flag.reason}` : null,
						]
							.filter(Boolean)
							.join(" ")
					: groupNouns[group];

				const isPendingRemove =
					removeMutation.isPending &&
					removeMutation.variables?.path.addressId === a.addressId;
				const isFailedRemove =
					removeMutation.isError && retryId === a.addressId;

				return (
					<SenderFlagRow
						key={a.addressId}
						name={a.displayName ?? a.normalizedEmail}
						email={a.normalizedEmail}
						danger={group === "blocked"}
						meta={meta}
						trailing={
							isFailedRemove ? (
								<Button
									variant="secondary"
									size="sm"
									onClick={() => {
										setRetryId(a.addressId);
										removeMutation.mutate({
											path: { addressId: a.addressId },
											body: {
												flags: { [group]: { value: false, setAt: Date.now() } },
											},
										});
									}}
								>
									Retry
								</Button>
							) : (
								<Button
									variant="ghost"
									size="sm"
									icon={<X className="size-3.5" />}
									aria-busy={isPendingRemove}
									aria-label={`Remove ${groupNouns[group]} flag`}
									onClick={() => {
										if (isPendingRemove) return;
										setRetryId(a.addressId);
										removeMutation.mutate({
											path: { addressId: a.addressId },
											body: {
												flags: { [group]: { value: false, setAt: Date.now() } },
											},
										});
									}}
								/>
							)
						}
					/>
				);
			})}
		</>
	);
}

/* ------------------------------------------------------------------ */
/* Page component                                                     */
/* ------------------------------------------------------------------ */

function SendersSettings() {
	const navigate = useNavigate();
	const navItems = useSettingsNavItems();
	const openSettingsSection = useOpenSettingsSection();
	const [group, setGroup] = useState<SenderGroup>("vip");
	const [query, setQuery] = useState("");
	const [helpOpen, setHelpOpen] = useState(true);

	// Per-group counts for the rail + footer. VIP total is the suggestions
	// list size; muted/blocked have no list endpoint, so their total is null
	// (the rail shows the live matched-row count instead of a stale total).
	const [matched, setMatched] = useState(0);
	const [groupCounts, setGroupCounts] = useState<
		Record<SenderGroup, number | null>
	>({ vip: 0, muted: null, blocked: null, neverSpam: null });

	const handleVipCount = useCallback((m: number, total: number) => {
		setMatched(m);
		setGroupCounts((prev) => ({ ...prev, vip: total }));
	}, []);

	const handleSearchCount = useCallback(
		(m: number, _total: number | null) => {
			setMatched(m);
			setGroupCounts((prev) => ({ ...prev, [group]: m }));
		},
		[group],
	);

	const total = groupCounts[group];

	return (
		<SettingsShell
			items={navItems}
			activeId="senders"
			title="Senders & Rules"
			description="Per-sender preferences — set with one key from any message, managed here."
			flush
			help={sendersHelp}
			helpOpen={helpOpen}
			onToggleHelp={() => setHelpOpen((v) => !v)}
			onSelect={openSettingsSection}
			onBackToMail={() => void navigate({ to: "/mail" })}
		>
			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				<SenderGroupSwitch<SenderGroup>
					active={group}
					onSelect={(g) => {
						setGroup(g);
						setQuery("");
					}}
					options={(
						["vip", "muted", "blocked", "neverSpam"] as SenderGroup[]
					).map((g) => ({
						id: g,
						label: groupLabels[g],
						count: groupCounts[g],
					}))}
				/>

				{/* Dense filterable sender table */}
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="border-b border-line px-row-inset py-2">
						<Input
							icon={<Search className="size-4" />}
							placeholder={`Filter ${groupLabels[group].toLowerCase()} by name or address`}
							className="h-8 max-w-sm"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>

					<div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
						{group === "vip" ? (
							<VipGroupPane query={query} onCount={handleVipCount} />
						) : (
							<SearchGroupPane
								group={group}
								query={query}
								onCount={handleSearchCount}
							/>
						)}
					</div>

					<footer className="flex items-center justify-between border-t border-line px-row-inset py-1 text-2xs text-fg-subtle">
						<span>
							{total != null
								? `${matched} of ${total} flagged senders`
								: `${matched} flagged senders`}
						</span>
						<span>
							<Kbd>j</Kbd> <Kbd>k</Kbd> navigate · <Kbd>⌫</Kbd> remove flag
						</span>
					</footer>
				</div>
			</div>
		</SettingsShell>
	);
}
