import type { ReactNode } from "react";

export interface AppChromeProps {
	topBar?: ReactNode;
	appBar?: ReactNode;
	children: ReactNode;
}

export function AppChrome({ topBar, appBar, children }: AppChromeProps) {
	return (
		<>
			{topBar}
			<div className="flex min-h-0 flex-1">
				{appBar}
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
			</div>
		</>
	);
}
