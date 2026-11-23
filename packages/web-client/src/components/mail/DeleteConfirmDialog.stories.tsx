import { configOperationsGetConfigOptions } from "@remit/api-http-client/@tanstack/react-query.gen.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { RoleAppointmentPromptProvider } from "./RoleAppointmentPromptProvider";

const meta: Meta<typeof DeleteConfirmDialog> = {
	title: "Playground/Shipped/Mail/Folder settings read failed",
	component: DeleteConfirmDialog,
	decorators: [
		(Story) => {
			const client = new QueryClient();
			const query = client.getQueryCache().build(client, {
				queryKey: [...configOperationsGetConfigOptions().queryKey],
			});
			query.setState({
				status: "error",
				error: new Error("Folder settings could not be reached"),
			});
			return (
				<QueryClientProvider client={client}>
					<RoleAppointmentPromptProvider>
						<Story />
					</RoleAppointmentPromptProvider>
				</QueryClientProvider>
			);
		},
	],
	args: {
		isOpen: true,
		messageIds: ["message-1"],
		outcome: "unavailable",
		onConfirm: () => undefined,
		onCancel: () => undefined,
	},
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ReadFailed: Story = {};
