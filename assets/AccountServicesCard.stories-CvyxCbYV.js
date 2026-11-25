import{A as d}from"./AccountServicesCard-49BmC8Sa.js";import"./iframe-4Y_dM_UU.js";import"./preload-helper-PPVm8Dsz.js";import"./account-service-toggles-BcWHbfC4.js";import"./account-service-choice-DCxlrFpF.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./checkbox-D2Z4W3-k.js";import"./check-DSdQDF54.js";import"./minus-DGSQI1I1.js";import"./switch-Bb78-s9s.js";import"./bug-report-Ca4X2TPn.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./app-info-BsoZZlWQ.js";const{expect:t,within:l}=__STORYBOOK_MODULE_TEST__,E={title:"Playground/Shipped/Settings/Accounts/What this account syncs",component:d,parameters:{layout:"padded"},args:{providerName:"Microsoft",offered:["Mail","Calendar"],enabled:["Mail"],consented:["Mail","Calendar"],disabled:!1,refusal:null,onRequestChange:()=>{}}},r={},s={args:{enabled:["Mail","Calendar"]}},o={args:{consented:["Mail"]},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByRole("switch",{name:"Sign in with Microsoft to add calendar"})).toBeVisible()}},c={args:{enabled:["Mail","Calendar"],disabled:!0},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByRole("switch",{name:"Sync calendar"})).toBeDisabled()}},n={args:{refusal:{service:"Calendar",intent:"on",message:"Couldn't open Microsoft's sign-in page. Check your connection, and anything blocking redirects, then try again."}},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByRole("switch",{name:"Sync calendar"})).not.toBeChecked(),await t(e.getByText("Couldn't turn calendar on")).toBeVisible(),await t(e.getByRole("link",{name:"Report an issue"})).toBeVisible()}},i={...n,parameters:{theme:"dark"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: ["Mail", "Calendar"]
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    consented: ["Mail"]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch", {
      name: "Sign in with Microsoft to add calendar"
    })).toBeVisible();
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: ["Mail", "Calendar"],
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch", {
      name: "Sync calendar"
    })).toBeDisabled();
  }
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    refusal: {
      service: "Calendar",
      intent: "on",
      message: "Couldn't open Microsoft's sign-in page. Check your connection, and anything blocking redirects, then try again."
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch", {
      name: "Sync calendar"
    })).not.toBeChecked();
    await expect(canvas.getByText("Couldn't turn calendar on")).toBeVisible();
    await expect(canvas.getByRole("link", {
      name: "Report an issue"
    })).toBeVisible();
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  ...CalendarRefused,
  parameters: {
    theme: "dark"
  }
}`,...i.parameters?.docs?.source}}};const O=["MailOnly","BothOn","CalendarNeedsSignIn","Saving","CalendarRefused","Dark"];export{s as BothOn,o as CalendarNeedsSignIn,n as CalendarRefused,i as Dark,r as MailOnly,c as Saving,O as __namedExportsOrder,E as default};
