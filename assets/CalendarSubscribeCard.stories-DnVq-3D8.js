import{C as p}from"./CalendarSubscribeCard-BJq0xUuO.js";import"./iframe-DUn0T08W.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-CekMrGzb.js";import"./cn-IyxL_b2c.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";import"./card-DiRo3N8k.js";import"./ErrorState-CY9CR2so.js";import"./circle-alert-Dup3Hpj3.js";import"./input-hGJM2SV8.js";const{expect:c,fn:m,userEvent:i,within:l}=__STORYBOOK_MODULE_TEST__,x={title:"Playground/Shipped/Settings/Calendars/Subscribe to a calendar",component:p,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: subscribing to another calendar's read-only iCal
address (#1261). The server reads the feed before creating anything, so a
refusal means nothing was added.`}}},args:{isBusy:!1,error:void 0,onSubscribe:m()}},r={play:async({canvasElement:e})=>{const a=l(e);await c(a.getByRole("button",{name:"Subscribe"})).toBeDisabled()}},n={play:async({canvasElement:e,args:a})=>{const d=l(e);await i.type(d.getByLabelText("Calendar name"),"Harbour rota"),await i.type(d.getByLabelText("Calendar address"),"webcal://calendar.example/harbour/basic.ics"),await i.click(d.getByRole("button",{name:"Subscribe"})),await c(a.onSubscribe).toHaveBeenCalledWith({displayName:"Harbour rota",url:"webcal://calendar.example/harbour/basic.ics"},c.any(Function))}},s={args:{isBusy:!0}},t={args:{error:{code:"subscription_unreachable",message:"the calendar was not created: the feed answered HTTP 404"}},play:async({canvasElement:e})=>{const a=l(e);await c(a.getByRole("alert")).toHaveTextContent("The calendar was not added.")}},o={name:"Refused (dark)",parameters:{theme:"dark"},args:{error:{code:"subscription_unreachable",message:"the calendar was not created: the feed could not be reached (ENOTFOUND)"}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Subscribe"
    })).toBeDisabled();
  }
}`,...r.parameters?.docs?.source},description:{story:"Empty: the button waits for a name and an address.",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Calendar name"), "Harbour rota");
    await userEvent.type(canvas.getByLabelText("Calendar address"), "webcal://calendar.example/harbour/basic.ics");
    await userEvent.click(canvas.getByRole("button", {
      name: "Subscribe"
    }));
    await expect(args.onSubscribe).toHaveBeenCalledWith({
      displayName: "Harbour rota",
      url: "webcal://calendar.example/harbour/basic.ics"
    }, expect.any(Function));
  }
}`,...n.parameters?.docs?.source},description:{story:"Filled in and sent.",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isBusy: true
  }
}`,...s.parameters?.docs?.source},description:{story:"The feed is being read.",...s.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    error: {
      code: "subscription_unreachable",
      message: "the calendar was not created: the feed answered HTTP 404"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("The calendar was not added.");
  }
}`,...t.parameters?.docs?.source},description:{story:"The feed could not be read, so no calendar was made.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Refused (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    error: {
      code: "subscription_unreachable",
      message: "the calendar was not created: the feed could not be reached (ENOTFOUND)"
    }
  }
}`,...o.parameters?.docs?.source},description:{story:"Refused, on the dark theme.",...o.parameters?.docs?.description}}};const C=["Empty","Filled","Subscribing","Refused","RefusedDark"];export{r as Empty,n as Filled,t as Refused,o as RefusedDark,s as Subscribing,C as __namedExportsOrder,x as default};
