import{j as c}from"./iframe-fYsS-Mr7.js";import{C as p,c as m}from"./card-D_7pcfRT.js";import{C as l}from"./CalendarSubscriptionStatus-_8F1Ixep.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./badge-CZgi-7XL.js";import"./banner-2MU9qEbR.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./format-CIELvwEW.js";import"./enums-CyACTv6m.js";import"./schemas-KRodOHJj.js";const{expect:d,fn:u,within:i}=__STORYBOOK_MODULE_TEST__,_={title:"Playground/Shipped/Settings/Calendars/Subscribed calendar",component:l,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: a calendar subscribed to a feed (#1261). The address is
never drawn in full, since for Google it is the whole credential; its host
is enough to recognise it.`}}},decorators:[e=>c.jsx(p,{className:"max-w-xl",children:c.jsx(m,{children:c.jsx(e,{})})})],args:{calendarName:"Harbour rota",subscriptionUrl:"https://calendar.google.com/calendar/ical/harbour%40example.com/private-5f1c0ffee/basic.ics",enabled:!0,fetchedAt:Date.parse("2026-09-25T08:15:00Z"),error:"",isBusy:!1,actionError:void 0,onSetEnabled:u()}},a={play:async({canvasElement:e})=>{const o=i(e);await d(o.getByText(/Read-only, from calendar\.google\.com/)).toBeVisible(),await d(e.textContent).not.toContain("private-5f1c0ffee")}},r={args:{error:"the feed answered HTTP 404"},play:async({canvasElement:e})=>{const o=i(e);await d(o.getByRole("alert")).toHaveTextContent("the feed answered HTTP 404")}},t={args:{enabled:!1}},s={name:"Paused (dark)",parameters:{theme:"dark"},args:{enabled:!1,error:"the feed answered HTTP 410"}},n={args:{fetchedAt:0}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Read-only, from calendar\\.google\\.com/)).toBeVisible();
    await expect(canvasElement.textContent).not.toContain("private-5f1c0ffee");
  }
}`,...a.parameters?.docs?.source},description:{story:"Refreshing on schedule. Only the host is named.",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    error: "the feed answered HTTP 404"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("the feed answered HTTP 404");
  }
}`,...r.parameters?.docs?.source},description:{story:"The last refresh failed. The events already stored stay.",...r.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: false
  }
}`,...t.parameters?.docs?.source},description:{story:"Updates paused. Nothing was removed.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Paused (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    enabled: false,
    error: "the feed answered HTTP 410"
  }
}`,...s.parameters?.docs?.source},description:{story:"Paused, on the dark theme.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    fetchedAt: 0
  }
}`,...n.parameters?.docs?.source},description:{story:"Never fetched successfully yet.",...n.parameters?.docs?.description}}};const k=["Live","Failing","Paused","PausedDark","NeverFetched"];export{r as Failing,a as Live,n as NeverFetched,t as Paused,s as PausedDark,k as __namedExportsOrder,_ as default};
