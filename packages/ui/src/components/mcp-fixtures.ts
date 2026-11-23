import type { McpPageError, McpPermission } from "./mcp-page.js";

export const mcpPermissionsFixture: readonly McpPermission[] = [
	{ scope: "mail:read", description: "Read your mail" },
	{ scope: "mail:rules", description: "Create and change folders and filters" },
	{
		scope: "offline_access",
		description: "Stay connected until you disconnect it",
	},
];

export const mcpErrorFixture: McpPageError = {
	message: "The authorization request is missing its client identifier.",
	fix: "Check the client configuration and try the authorization request again.",
	reportUrl: "https://github.com/remit-mail/reader/issues/new",
};
