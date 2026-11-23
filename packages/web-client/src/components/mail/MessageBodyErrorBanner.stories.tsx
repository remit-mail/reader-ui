import type { Meta, StoryObj } from "@storybook/react-vite";
import { BodyFetchError } from "../../hooks/useMessageBodyContent";
import { MessageBodyErrorBanner } from "./MessageBodyErrorBanner";

const meta: Meta<typeof MessageBodyErrorBanner> = {
	title: "Playground/Shipped/Mail/Message body failure",
	component: MessageBodyErrorBanner,
	args: {
		error: new BodyFetchError(
			"generic",
			"Content refused (403: tenant-mismatch)",
			403,
		),
		onRetry: () => undefined,
	},
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Refused: Story = {};
export const LinkExpired: Story = {
	args: {
		error: new BodyFetchError(
			"link-expired",
			"Content refused (403: expired)",
			403,
		),
	},
};
export const AuthenticationRequired: Story = {
	args: { error: new BodyFetchError("auth", "Authentication required", 401) },
};
