import type {
	RemitImapClassificationConfigured,
	RemitImapClassificationPreset,
	RemitImapClassificationSettings,
	RemitImapClassificationSources,
	RemitImapClassificationTestResponse,
	RemitImapClassificationUsage,
	RemitImapUpdateUserSettingsInput,
	RemitImapUserSettingsResponse,
} from "@remit/api-http-client/types.gen.ts";
import {
	ClassificationUnrunnableReason,
	ClassificationValueSource,
} from "@remit/domain-enums";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type HttpHandler, HttpResponse, http } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import {
	DAY,
	mailWorld,
	NOW,
	PERSONAL,
	WORK,
} from "../../mocks/story-frame/mail-world";

const PRESETS: RemitImapClassificationPreset[] = [
	{
		presetId: "Jev",
		label: "Jev",
		group: "Hosted",
		adapterShape: "DecisionApi",
		defaultBaseUrl: "https://api.jev.dev/v1",
		defaultModel: "jev-mail-1",
		needsKey: true,
		price: { state: "Priced", currency: "USD", perMillionInputTokens: 0.05 },
	},
	{
		presetId: "Mistral",
		label: "Mistral",
		group: "Hosted",
		adapterShape: "ChatJsonSchema",
		defaultBaseUrl: "https://api.mistral.ai/v1",
		defaultModel: "mistral-small-latest",
		needsKey: true,
		price: { state: "Priced", currency: "USD", perMillionInputTokens: 0.1 },
	},
	{
		presetId: "OpenAiCompatible",
		label: "OpenAI-compatible",
		group: "Custom",
		adapterShape: "ChatJsonSchema",
		defaultModel: "gpt-4o-mini",
		needsKey: true,
		price: { state: "NoPrice" },
	},
	{
		presetId: "Local",
		label: "Local",
		group: "Local",
		adapterShape: "ChatJsonSchema",
		defaultBaseUrl: "http://localhost:8080",
		defaultModel: "llama3.1:8b",
		needsKey: false,
		price: { state: "NoPrice" },
	},
];

const RESETS_AT = new Date(NOW + DAY)
	.toISOString()
	.replace(/T.*$/, "T00:00:00.000Z");

const pricedUsage = (
	accountId: string,
	calls: number,
	dailyLimit = 500,
): RemitImapClassificationUsage => ({
	accountId,
	calls,
	dailyLimit,
	resetsAt: RESETS_AT,
	cost: {
		state: "Priced",
		currency: "USD",
		amount: (calls * 1500 * 0.1) / 1_000_000,
	},
});

const localUsage = (
	accountId: string,
	calls: number,
): RemitImapClassificationUsage => ({
	accountId,
	calls,
	dailyLimit: 500,
	resetsAt: RESETS_AT,
	cost: { state: "NoPrice" },
});

const allSaved: RemitImapClassificationSources = {
	presetId: ClassificationValueSource.Saved,
	model: ClassificationValueSource.Saved,
	baseUrl: ClassificationValueSource.Saved,
	apiKey: ClassificationValueSource.Saved,
	enabled: ClassificationValueSource.Saved,
	dailyLimit: ClassificationValueSource.Saved,
};

const allDeployment: RemitImapClassificationSources = {
	presetId: ClassificationValueSource.Deployment,
	model: ClassificationValueSource.Deployment,
	baseUrl: ClassificationValueSource.Deployment,
	apiKey: ClassificationValueSource.Deployment,
	enabled: ClassificationValueSource.Deployment,
	dailyLimit: ClassificationValueSource.Deployment,
};

const mixedSources: RemitImapClassificationSources = {
	presetId: ClassificationValueSource.Saved,
	model: ClassificationValueSource.Saved,
	baseUrl: ClassificationValueSource.Deployment,
	apiKey: ClassificationValueSource.Deployment,
	enabled: ClassificationValueSource.Default,
	dailyLimit: ClassificationValueSource.Default,
};

const mistral: RemitImapClassificationConfigured = {
	state: "Configured",
	presetId: "Mistral",
	model: "mistral-small-latest",
	baseUrl: "",
	apiKeySaved: true,
	enabled: false,
	dailyLimit: 500,
	sources: allSaved,
	usage: [pricedUsage(PERSONAL, 0), pricedUsage(WORK, 0)],
};

const mistralOn: RemitImapClassificationConfigured = {
	...mistral,
	enabled: true,
	usage: [pricedUsage(PERSONAL, 142), pricedUsage(WORK, 246)],
};

const mistralCapped: RemitImapClassificationConfigured = {
	...mistral,
	enabled: true,
	usage: [pricedUsage(PERSONAL, 212), pricedUsage(WORK, 500)],
};

const local: RemitImapClassificationConfigured = {
	state: "Configured",
	presetId: "Local",
	model: "llama3.1:8b",
	baseUrl: "http://gpu-box.lan:11434/v1",
	apiKeySaved: false,
	enabled: true,
	dailyLimit: 500,
	sources: {
		...allSaved,
		apiKey: ClassificationValueSource.Default,
	},
	usage: [localUsage(PERSONAL, 31), localUsage(WORK, 12)],
};

const mistralDeployment: RemitImapClassificationConfigured = {
	...mistral,
	sources: allDeployment,
};

const mistralMixed: RemitImapClassificationConfigured = {
	...mistral,
	sources: mixedSources,
};

const unrunnableNoApiKey: RemitImapClassificationSettings = {
	state: "Unrunnable",
	presetId: "Mistral",
	reason: ClassificationUnrunnableReason.NoApiKey,
};

const passed: RemitImapClassificationTestResponse = {
	state: "Passed",
	latencyMs: 840,
	label: "Newsletter",
	confidence: 0.92,
};

const rejectedKey: RemitImapClassificationTestResponse = {
	state: "Failed",
	latencyMs: 312,
	status: 401,
	kind: "Unauthorized",
	field: "ApiKey",
	fix: "Mistral rejected the API key. Replace the key, save, and test again.",
};

type TestAnswer = RemitImapClassificationTestResponse | "hold";

const settingsHandlers = (
	initial: RemitImapClassificationSettings,
	answer: TestAnswer = passed,
): HttpHandler[] => {
	let classification = initial;
	const settings = (): RemitImapUserSettingsResponse => ({
		defaultInvitationSenderChosen: false,
		classificationPresets: PRESETS,
		classification,
	});
	return [
		http.get("/api/settings", () => HttpResponse.json(settings())),
		http.patch("/api/settings", async ({ request }) => {
			const body = (await request.json()) as RemitImapUpdateUserSettingsInput;
			const presetId =
				body.classificationPresetId ??
				(classification.state === "Configured"
					? classification.presetId
					: "Mistral");
			const previous =
				classification.state === "Configured" ? classification : mistral;
			classification = {
				...previous,
				presetId,
				model: body.classificationModel ?? previous.model,
				baseUrl: body.classificationBaseUrl ?? previous.baseUrl,
				apiKeySaved:
					body.classificationApiKey !== undefined ||
					(body.classificationPresetId === undefined && previous.apiKeySaved),
				sources: {
					...previous.sources,
					apiKey:
						body.classificationApiKey !== undefined
							? ClassificationValueSource.Saved
							: previous.sources.apiKey,
				},
				enabled: body.classificationEnabled ?? previous.enabled,
				dailyLimit: body.classificationDailyLimit ?? previous.dailyLimit,
				usage: previous.usage.map((usage) => ({
					...usage,
					dailyLimit: body.classificationDailyLimit ?? usage.dailyLimit,
				})),
			};
			return HttpResponse.json(settings());
		}),
		http.delete("/api/settings/classification-provider", () => {
			classification = { state: "NotConfigured" };
			return HttpResponse.json(settings());
		}),
		http.post("/api/settings/classification-test", () =>
			answer === "hold"
				? new Promise<never>(() => undefined)
				: HttpResponse.json(answer),
		),
		...mailHandlers(mailWorld()),
	];
};

const meta = {
	title: "Playground/Shipped/Settings/Mail classification",
	component: AppStory,
	args: { url: "/settings/classification" },
	parameters: {
		layout: "fullscreen",
		msw: { handlers: settingsHandlers({ state: "NotConfigured" }) },
	},
	globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta<typeof AppStory>;
export default meta;

type Story = StoryObj<typeof meta>;

const useTheModel = (canvasElement: HTMLElement) =>
	within(canvasElement).findByRole("switch", { name: "Use the model" });

export const NotConfigured: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = await useTheModel(canvasElement);
		await expect(toggle).toHaveAttribute("aria-disabled", "true");
		await expect(toggle).toHaveAttribute("aria-checked", "false");
		await expect(canvas.getByText(/Save a provider below first/)).toBeVisible();
		await userEvent.selectOptions(canvas.getByLabelText("Provider"), "Mistral");
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(canvas.getByLabelText("API key")).toHaveFocus();
		await expect(canvas.getByText("Paste an API key")).toBeVisible();
	},
};

export const KeySavedDisabled: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistral) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("set")).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Replace" })).toBeVisible();
		await expect(canvas.getByRole("button", { name: "Clear" })).toBeVisible();
		await userEvent.click(
			canvas.getByRole("button", { name: "Test connection" }),
		);
		await expect(
			await canvas.findByText("Test passed in 840 ms"),
		).toBeVisible();
	},
};

export const AllInheritedFromDeployment: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistralDeployment) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("provided by the deployment"),
		).toBeVisible();
		await expect(canvas.queryByText("set")).toBeNull();
		await expect(canvas.queryByRole("button", { name: "Clear" })).toBeNull();
		await userEvent.clear(await canvas.findByLabelText("Base URL"));
		await userEvent.type(
			canvas.getByLabelText("Base URL"),
			"https://proxy.example.com/v1",
		);
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(
			await canvas.findByText("Paste an API key for this base URL"),
		).toBeVisible();
	},
};

export const AllSavedByYou: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistral) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("set")).toBeVisible();
		await expect(canvas.queryByText("provided by the deployment")).toBeNull();
	},
};

export const MixedSources: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistralMixed) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("provided by the deployment"),
		).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: "Use your own key" }),
		).toBeVisible();
	},
};

export const UnrunnableNoApiKey: Story = {
	parameters: { msw: { handlers: settingsHandlers(unrunnableNoApiKey) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText("Classification cannot run without an API key"),
		).toBeVisible();
		await expect(await useTheModel(canvasElement)).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		await expect(canvas.getByLabelText("Provider")).toHaveValue("Mistral");
	},
};

export const TestRunning: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistral, "hold") } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Test connection" }),
		);
		const button = await canvas.findByRole("button", { name: "Testing…" });
		await expect(button).toHaveAttribute("aria-busy", "true");
		await expect(
			canvas.getByText("Sending one sample message to Mistral"),
		).toBeVisible();
	},
};

export const TestConnectionError: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistral, rejectedKey) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Test connection" }),
		);
		const alert = await canvas.findByText("Test failed after 312 ms: 401");
		await expect(alert.closest("[role=alert]")).not.toBeNull();
		await expect(
			canvas.getByText(/Mistral rejected the API key/),
		).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: "Replace" }),
		).toHaveAttribute("aria-invalid", "true");
		await expect(
			canvas.getByRole("link", { name: "Report an issue" }),
		).toBeVisible();
	},
};

export const ReplacingKey: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistral) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			await canvas.findByRole("button", { name: "Replace" }),
		);
		await waitFor(() =>
			expect(canvas.getByLabelText("New API key")).toHaveFocus(),
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Replace" })).toHaveFocus(),
		);
		await userEvent.click(canvas.getByRole("button", { name: "Replace" }));
	},
};

export const ClearKeyConfirm: Story = {
	parameters: {
		msw: { handlers: settingsHandlers({ ...mistral, enabled: true }) },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(await canvas.findByRole("button", { name: "Clear" }));
		const dialog = within(await canvas.findByRole("dialog"));
		await expect(dialog.getByText("Clear the Mistral key?")).toBeVisible();
		await expect(dialog.getByRole("button", { name: "Cancel" })).toHaveFocus();
		await userEvent.click(dialog.getByRole("button", { name: "Clear key" }));
		await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
		await expect(await useTheModel(canvasElement)).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		await expect(canvas.getByText(/Save a provider below first/)).toBeVisible();
	},
};

export const LocalProvider: Story = {
	parameters: { msw: { handlers: settingsHandlers(local) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByLabelText("Base URL")).toHaveValue(
			"http://gpu-box.lan:11434/v1",
		);
		await expect(canvas.queryByLabelText("API key")).toBeNull();
		await expect(canvas.queryByText("set")).toBeNull();
		await expect(canvas.getAllByText("no price, self-hosted")).toHaveLength(2);
	},
};

export const LocalProviderDefaultBaseUrl: Story = {
	parameters: {
		msw: { handlers: settingsHandlers({ state: "NotConfigured" }) },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.selectOptions(
			await canvas.findByLabelText("Provider"),
			"Local",
		);
		await expect(await canvas.findByLabelText("Base URL")).toHaveValue(
			"http://localhost:8080",
		);
	},
};

export const EnabledHealthy: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistralOn) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("142 / 500 calls")).toBeVisible();
		await expect(canvas.getByText("on")).toBeVisible();
		await expect(canvas.getByText("about $0.02")).toBeVisible();
		await expect(canvas.getByText("246 / 500 calls")).toBeVisible();
		await expect(canvas.getByText("about $0.04")).toBeVisible();
		await expect(
			canvas.getByLabelText("Calls per account per day"),
		).toHaveValue("500");
		await expect(canvas.queryByText("cap reached")).toBeNull();
	},
};

export const EnabledHealthyDesktop: Story = {
	...EnabledHealthy,
	globals: { viewport: { value: "desktop", isRotated: false } },
};

export const CapReached: Story = {
	parameters: { msw: { handlers: settingsHandlers(mistralCapped) } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText("cap reached")).toBeVisible();
		const banner = await canvas.findByText(
			"Work reached the daily limit of 500 calls",
		);
		await expect(banner.closest("[role=alert]")).not.toBeNull();
		await expect(canvas.getByText("500 / 500 calls")).toBeVisible();
		await expect(canvas.getByText(/limit reached/)).toBeVisible();
		await userEvent.click(
			canvas.getByRole("button", { name: "Raise the limit" }),
		);
		const limit = canvas.getByLabelText("Calls per account per day");
		await expect(limit).toHaveFocus();
		await userEvent.keyboard("0");
		await userEvent.click(canvas.getByRole("button", { name: "Save limit" }));
		await expect(
			canvas.getByText("Enter a whole number of 1 or more."),
		).toBeVisible();
		await userEvent.clear(limit);
		await userEvent.type(limit, "1000");
		await userEvent.click(canvas.getByRole("button", { name: "Save limit" }));
		await waitFor(() => expect(canvas.queryByText("cap reached")).toBeNull());
		await expect(canvas.getByText("500 / 1000 calls")).toBeVisible();
	},
};

export const SignedOut: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get("/api/settings", () =>
					HttpResponse.json(
						{ code: "forbidden", message: "Forbidden" },
						{ status: 403 },
					),
				),
				...mailHandlers(mailWorld()),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole("alertdialog", { name: "You're signed out" }),
		).toBeVisible();
		await expect(canvas.queryByLabelText("Provider")).toBeNull();
	},
};
