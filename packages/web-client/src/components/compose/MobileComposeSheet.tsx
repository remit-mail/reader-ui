import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import { ConfirmDialog, ErrorState, useOverlayScope } from "@remit/ui";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Drawer } from "vaul";
import {
	useAdoptComposeDraft,
	useCloseCompose,
	useComposeDraftId,
} from "../../routing";
import { ComposeForm } from "./ComposeForm";
import { composeSurfaceTitle } from "./compose-title";

export const MobileComposeSheet = () => {
	const outboxMessageId = useComposeDraftId();
	const adoptCreatedDraft = useAdoptComposeDraft();
	const closeCompose = useCloseCompose();
	const closeRequestRef = useRef<(() => Promise<boolean>) | null>(null);
	const closingRef = useRef(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const {
		isError: isConfigError,
		error: configError,
		refetch: refetchConfig,
	} = useQuery({
		...configOperationsGetConfigOptions(),
		staleTime: Infinity,
	});

	const handleOpenChange = useCallback(
		async (open: boolean) => {
			if (open || closingRef.current) return;
			closingRef.current = true;
			try {
				const saved = await closeRequestRef.current?.();
				if (saved !== false) closeCompose();
				else setShowConfirm(true);
			} finally {
				closingRef.current = false;
			}
		},
		[closeCompose],
	);

	const handleConfirmDiscard = useCallback(() => {
		setShowConfirm(false);
		closeCompose();
	}, [closeCompose]);

	const handleCancelDiscard = useCallback(() => {
		setShowConfirm(false);
	}, []);

	// vaul answers Escape itself; declaring the scope is what keeps the rest of
	// the keyboard off the list behind the sheet.
	useOverlayScope({ id: "mobile-compose", open: true });

	return (
		<Drawer.Root
			open
			onOpenChange={handleOpenChange}
			// Don't auto-dismiss on drag when dirty — we intercept via onOpenChange
		>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
				<Drawer.Content
					className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-lg bg-canvas pb-[env(safe-area-inset-bottom,0px)]"
					style={{ height: "95dvh" }}
				>
					<Drawer.Handle className="mx-auto mt-2 mb-1 h-1.5 w-12 rounded-full bg-fg-muted/30" />

					<Drawer.Title className="px-4 py-2 text-base font-semibold border-b border-line">
						{composeSurfaceTitle(outboxMessageId)}
					</Drawer.Title>

					{isConfigError ? (
						<div className="flex-1 flex items-center justify-center p-4">
							<ErrorState
								title="Couldn't load compose"
								error={configError}
								onRetry={() => {
									refetchConfig();
								}}
							/>
						</div>
					) : (
						<div className="flex-1 overflow-hidden">
							<ComposeForm
								mode="new"
								outboxMessageId={outboxMessageId}
								onDraftCreated={adoptCreatedDraft}
								closeRequestRef={closeRequestRef}
								onClose={closeCompose}
							/>
						</div>
					)}
				</Drawer.Content>
			</Drawer.Portal>

			<ConfirmDialog
				isOpen={showConfirm}
				title="Discard draft?"
				description="Your message has unsaved content. Are you sure you want to discard it?"
				confirmLabel="Discard"
				cancelLabel="Keep editing"
				destructive
				onConfirm={handleConfirmDiscard}
				onCancel={handleCancelDiscard}
			/>
		</Drawer.Root>
	);
};
