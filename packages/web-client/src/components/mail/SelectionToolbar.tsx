import { MailOpen, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionToolbarProps {
	selectedCount: number;
	onDelete: () => void;
	onClearSelection: () => void;
	onMarkAsRead?: () => void;
	isDeleting?: boolean;
}

export const SelectionToolbar = ({
	selectedCount,
	onDelete,
	onClearSelection,
	onMarkAsRead,
	isDeleting = false,
}: SelectionToolbarProps) => {
	if (selectedCount === 0) return null;

	return (
		<div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onClearSelection}
					className="min-h-11 min-w-11 inline-flex items-center justify-center rounded hover:bg-accent transition-colors"
					aria-label="Clear selection"
				>
					<X className="size-4 text-muted-foreground" />
				</button>
				<span className="text-sm font-medium">
					{selectedCount} {selectedCount === 1 ? "message" : "messages"}{" "}
					selected
				</span>
			</div>
			<div className="flex items-center gap-1">
				{onMarkAsRead && (
					<button
						type="button"
						onClick={onMarkAsRead}
						disabled={isDeleting}
						className="min-h-11 min-w-11 inline-flex items-center justify-center rounded text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Mark as read"
					>
						<MailOpen className="size-4" />
					</button>
				)}
				<button
					type="button"
					onClick={onDelete}
					disabled={isDeleting}
					className={cn(
						"min-h-11 min-w-11 inline-flex items-center justify-center gap-1.5 px-3 rounded text-sm font-medium transition-colors",
						"bg-destructive text-destructive-foreground hover:bg-destructive/90",
						"disabled:opacity-50 disabled:cursor-not-allowed",
					)}
					aria-label="Delete selected messages"
				>
					<Trash2 className="size-4" />
					<span className="hidden sm:inline">
						{isDeleting ? "Deleting..." : "Delete"}
					</span>
				</button>
			</div>
		</div>
	);
};
