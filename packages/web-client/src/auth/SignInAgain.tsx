import { useAuthProvider } from "./provider";

export function SignInAgain() {
	const { reauthenticate } = useAuthProvider();
	return (
		<button
			type="button"
			onClick={() => void reauthenticate()}
			className="rounded-md border border-line px-2.5 py-1 text-sm font-medium text-fg outline-none hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-ring"
		>
			Sign in again
		</button>
	);
}
