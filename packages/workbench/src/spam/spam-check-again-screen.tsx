import {
	Button,
	type CheckAgainOutcome,
	CheckAgainPanel,
	type CheckAgainPanelProps,
	CheckAgainResultTag,
	ComfortableRowBody,
	comfortableRowClass,
	type LabelChipData,
	PaneHeader,
	PopoverMenu,
	SpamRowMarker,
	type ThreadRowData,
} from "@remit/ui";
import {
	FolderInput,
	Mail,
	RefreshCw,
	ShieldAlert,
	ShieldCheck,
	Trash,
} from "@remit/ui/icons";
import { useState } from "react";

export interface SpamListRow {
	thread: ThreadRowData;
	label: LabelChipData;
	action: "Warn" | "Junk";
	result?: { outcome: CheckAgainOutcome; score: number };
}

export interface SpamCheckAgainScreenProps {
	title: string;
	rows: SpamListRow[];
	panel?: CheckAgainPanelProps;
	settingsHref: string;
	onNotSpam: (ids: string[]) => void;
	onCheckAgain: (ids: string[]) => void;
	onDelete: (ids: string[]) => void;
}

function EmptyList({
	title,
	settingsHref,
}: {
	title: string;
	settingsHref: string;
}) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-1 p-8 text-center">
			<p className="font-medium text-fg">{`No messages in ${title}`}</p>
			<p className="text-sm text-fg-muted">
				Remit adds this label to mail it suspects.
			</p>
			<a
				href={settingsHref}
				className="mt-2 text-sm text-accent-2 hover:underline"
			>
				Spam &amp; phishing settings
			</a>
		</div>
	);
}

/**
 * A Spam label list with the bulk bar's Not spam, Check again and Delete, and
 * the Check again panel over the list while a run is up.
 */
export function SpamCheckAgainScreen({
	title,
	rows,
	panel,
	settingsHref,
	onNotSpam,
	onCheckAgain,
	onDelete,
}: SpamCheckAgainScreenProps) {
	const [selected, setSelected] = useState<string[]>([]);
	const toggle = (id: string) =>
		setSelected((current) =>
			current.includes(id)
				? current.filter((other) => other !== id)
				: [...current, id],
		);

	return (
		<div className="flex h-[640px] w-full overflow-hidden rounded-lg border border-line bg-canvas font-sans">
			<div className="relative flex w-[420px] shrink-0 flex-col border-r border-line">
				{selected.length > 0 ? (
					<PaneHeader title={`${selected.length} selected`}>
						<Button
							variant="ghost"
							size="sm"
							icon={<ShieldCheck className="size-4" />}
							onClick={() => onNotSpam(selected)}
						>
							Not spam
						</Button>
						<Button
							variant="ghost"
							size="sm"
							icon={<RefreshCw className="size-4" />}
							onClick={() => onCheckAgain(selected)}
						>
							Check again
						</Button>
						<Button
							variant="ghost"
							size="sm"
							icon={<Trash className="size-4" />}
							onClick={() => onDelete(selected)}
						>
							Delete
						</Button>
					</PaneHeader>
				) : (
					<PaneHeader title={title} />
				)}
				{rows.length === 0 ? (
					<EmptyList title={title} settingsHref={settingsHref} />
				) : (
					<ul className="min-h-0 flex-1 list-none divide-y divide-line overflow-y-auto">
						{rows.map((row) => (
							<li key={row.thread.id} className={comfortableRowClass({})}>
								<ComfortableRowBody
									thread={row.thread}
									selection={{
										checked: selected.includes(row.thread.id),
										alwaysVisible: true,
										onToggle: () => toggle(row.thread.id),
									}}
									badge={
										<>
											{row.result && (
												<CheckAgainResultTag
													outcome={row.result.outcome}
													score={row.result.score}
												/>
											)}
											<SpamRowMarker label={row.label} action={row.action} />
										</>
									}
								/>
							</li>
						))}
					</ul>
				)}
				{panel && (
					<div className="absolute inset-x-3 bottom-3 flex justify-center">
						<CheckAgainPanel {...panel} />
					</div>
				)}
			</div>
			<div className="flex flex-1 items-center justify-center text-sm text-fg-subtle">
				Select a conversation
			</div>
		</div>
	);
}

/** The open message's action menu, with Check again for this one message. */
export function SpamMessageMenuPreview({
	onCheckAgain,
}: {
	onCheckAgain: () => void;
}) {
	const noop = () => undefined;
	return (
		<div className="h-[420px] w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-canvas font-sans">
			<PaneHeader title="Subject line">
				<PopoverMenu
					triggerLabel="More actions"
					items={[
						{
							key: "unread",
							label: "Mark as unread",
							icon: <Mail className="size-4" />,
							onSelect: noop,
						},
						{
							key: "move",
							label: "Move to...",
							icon: <FolderInput className="size-4" />,
							onSelect: noop,
						},
						{
							key: "report",
							label: "Report spam",
							icon: <ShieldAlert className="size-4" />,
							onSelect: noop,
						},
						{
							key: "check-again",
							label: "Check again",
							icon: <RefreshCw className="size-4" />,
							onSelect: onCheckAgain,
						},
					]}
				/>
			</PaneHeader>
			<article className="px-5 py-4 text-sm text-fg">
				The body of the message starts here.
			</article>
		</div>
	);
}
