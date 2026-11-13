import { useState } from "react";
import { Search } from "../icons.js";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { SenderGroupSwitch } from "./sender-group-switch.js";
import {
	SenderFlagRow,
	type SettingsNavItem,
	SettingsShell,
} from "./settings-screen.js";

export type SpamSenderGroup = "vip" | "muted" | "blocked" | "neverSpam";

export interface NeverInSpamSender {
	name: string;
	email: string;
	since: string;
}

export interface SpamSendersPageProps {
	navItems: SettingsNavItem[];
	senders: NeverInSpamSender[];
	onRemove: (email: string) => void;
	onBackToMail: () => void;
}

const GROUP_LABELS: Record<SpamSenderGroup, string> = {
	vip: "VIPs",
	muted: "Muted",
	blocked: "Blocked (reported)",
	neverSpam: "Never in Spam",
};

/**
 * Senders & Rules with its fourth group, Never in Spam. Remove puts a sender
 * back through the spam check from their next message.
 */
export function SpamSendersPage({
	navItems,
	senders,
	onRemove,
	onBackToMail,
}: SpamSendersPageProps) {
	const [query, setQuery] = useState("");
	const needle = query.trim().toLowerCase();
	const shown = senders.filter(
		(sender) =>
			needle === "" ||
			sender.name.toLowerCase().includes(needle) ||
			sender.email.toLowerCase().includes(needle),
	);

	return (
		<SettingsShell
			items={navItems}
			activeId="senders"
			title="Senders & Rules"
			description="Per-sender preferences, set with one key from any message, managed here."
			flush
			onBackToMail={onBackToMail}
		>
			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				<SenderGroupSwitch<SpamSenderGroup>
					active="neverSpam"
					onSelect={() => undefined}
					options={(Object.keys(GROUP_LABELS) as SpamSenderGroup[]).map(
						(id) => ({
							id,
							label: GROUP_LABELS[id],
							count: id === "neverSpam" ? senders.length : null,
						}),
					)}
				/>
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="border-b border-line px-row-inset py-2">
						<Input
							icon={<Search className="size-4" />}
							placeholder="Search never-in-spam senders"
							aria-label="Search never-in-spam senders"
							className="h-8 max-w-sm"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>
					<div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
						{shown.map((sender) => (
							<SenderFlagRow
								key={sender.email}
								name={sender.name}
								email={sender.email}
								meta={`since ${sender.since}`}
								trailing={
									<Button
										variant="ghost"
										size="sm"
										aria-label={`Remove ${sender.name} from Never in Spam`}
										onClick={() => onRemove(sender.email)}
									>
										Remove
									</Button>
								}
							/>
						))}
					</div>
					<footer className="border-t border-line px-row-inset py-1 text-2xs text-fg-subtle">
						Remove puts the sender back through the spam check from their next
						message.
					</footer>
				</div>
			</div>
		</SettingsShell>
	);
}
