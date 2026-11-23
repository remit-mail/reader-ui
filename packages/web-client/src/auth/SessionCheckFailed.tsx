import {
	AuthCard,
	AuthHero,
	Banner,
	Button,
	formatErrorMessage,
} from "@remit/ui";
export const SessionCheckFailed = ({
	error,
	onRetry,
}: {
	error: unknown;
	onRetry: () => void;
}) => (
	<AuthCard>
		<AuthHero />
		<Banner tone="danger">
			<p>Could not check your session</p>
			<p>{formatErrorMessage(error)}</p>
		</Banner>
		<Button onClick={onRetry}>Retry</Button>
	</AuthCard>
);
