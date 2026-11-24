import type { RemitImapDescribeMessageResponse } from "@remit/api-http-client/types.gen.ts";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { getResponse, HttpResponse, http } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppStory } from "../../mocks/story-frame/AppStory";
import {
	composeWorld,
	LUNCH_SUBJECT,
	messageUrl,
} from "../../mocks/story-frame/compose-world";
import { mailHandlers } from "../../mocks/story-frame/mail-handlers";
import { withRuntimeConfig } from "../../mocks/story-frame/session";

const remote = "https://images.example/newsletter.png?edition=42";
const routeLoad = { timeout: 5000 };
const handlers = mailHandlers(composeWorld());
let destinationRequests = 0;
const rejectedImageSet =
	"<div style='background-image:image-set(/**/\"https://tracker.example/pixel\" 1x)'></div>";
const meta = {
	title: "Playground/Shipped/Mail/Reading/Proxied image",
	component: AppStory,
	args: { url: messageUrl("lunch") },
	beforeEach: () => {
		destinationRequests = 0;
		return withRuntimeConfig({ externalImageProxyUrl: "/api/image-proxy" })();
	},
	parameters: {
		layout: "fullscreen",
		msw: {
			handlers: [
				http.get("https://tracker.example/pixel", () => {
					destinationRequests++;
					return HttpResponse.error();
				}),
				http.get("https://images.example/newsletter.png", () => {
					destinationRequests++;
					return HttpResponse.error();
				}),
				http.get("/api/messages/:messageId", async ({ request }) => {
					const response = await getResponse(handlers, request);
					const data =
						(await response!.json()) as RemitImapDescribeMessageResponse;
					return HttpResponse.json({
						...data,
						bodyParts: data.bodyParts?.map((part) => ({
							...part,
							mediaSubtype: "html",
						})),
					});
				}),
				http.get(
					"/content/accounts/:accountConfigId/:accountId/messages/:messageId/parts/*",
					() =>
						HttpResponse.html(
							`<p>A newsletter image, loaded only with permission.</p><img src="${remote}" alt="Newsletter image" width="120" height="120">${rejectedImageSet}`,
						),
				),
				http.post("/api/image-proxy", async ({ request }) => {
					expect(await request.text()).toBe(remote);
					expect(request.headers.get("content-type")).toBe(
						"text/plain;charset=UTF-8",
					);
					const bytes = Uint8Array.from(
						atob(
							"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=",
						),
						(char) => char.charCodeAt(0),
					);
					return new HttpResponse(bytes, {
						headers: {
							"Content-Type": "image/png",
							"X-Remit-Partition": "story-tenant",
						},
					});
				}),
				...handlers,
			],
		},
	},
} satisfies Meta<typeof AppStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LoadOnce: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole(
			"heading",
			{ level: 1, name: LUNCH_SUBJECT },
			routeLoad,
		);
		const load = await canvas.findByRole(
			"button",
			{ name: "Load once" },
			routeLoad,
		);
		expect(destinationRequests).toBe(0);
		await userEvent.click(load);
		await waitFor(() => {
			const frame = canvasElement.querySelector<HTMLIFrameElement>("iframe");
			expect(frame?.getAttribute("srcdoc")).toContain('src="blob:');
			expect(frame?.getAttribute("srcdoc")).not.toContain(remote);
			expect(destinationRequests).toBe(0);
			expect(frame?.contentDocument?.querySelector("img")?.naturalWidth).toBe(
				1,
			);
		});
		expect(destinationRequests).toBe(0);
	},
};

export const CssOnly: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get(
					"/content/accounts/:accountConfigId/:accountId/messages/:messageId/parts/*",
					() =>
						HttpResponse.html(
							`<div style="width:120px;height:120px;background-image:url('${remote}')">Newsletter image</div>${rejectedImageSet}`,
						),
				),
				...meta.parameters.msw.handlers,
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole(
			"heading",
			{ level: 1, name: LUNCH_SUBJECT },
			routeLoad,
		);
		expect(destinationRequests).toBe(0);
		const load = await canvas.findByRole(
			"button",
			{
				name: "Load once",
			},
			routeLoad,
		);
		expect(
			canvasElement.querySelector("iframe")?.getAttribute("srcdoc"),
		).not.toContain(remote);
		await userEvent.click(load);
		await waitFor(() =>
			expect(
				canvasElement.querySelector("iframe")?.getAttribute("srcdoc"),
			).toContain("blob:"),
		);
	},
};
