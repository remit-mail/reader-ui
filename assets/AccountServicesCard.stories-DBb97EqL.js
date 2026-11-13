import{A as d}from"./AccountServicesCard-CwWeWyTS.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./account-service-toggles-D73GDtNp.js";import"./account-service-choice-DJhrOwR3.js";import"./banner-2MU9qEbR.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./checkbox-BScpY53m.js";import"./check-ClpQiEYg.js";import"./minus-DMpYC7y2.js";import"./switch-B15vKG1a.js";import"./bug-report-vYCUKYUD.js";import"./runtime-config-aIiziXlW.js";import"./app-info-BsoZZlWQ.js";import"./request-breadcrumbs-OUZqy9mi.js";const{expect:t,within:l}=__STORYBOOK_MODULE_TEST__,O={title:"Playground/Shipped/Settings/Accounts/What this account syncs",component:d,parameters:{layout:"padded"},args:{providerName:"Microsoft",offered:["Mail","Calendar"],enabled:["Mail"],consented:["Mail","Calendar"],disabled:!1,refusal:null,onRequestChange:()=>{}}},s={},r={args:{enabled:["Mail","Calendar"]}},o={args:{consented:["Mail"]},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByText(/signing in with Microsoft again/)).toBeVisible()}},i={args:{enabled:["Mail","Calendar"],disabled:!0},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByRole("switch",{name:"Sync calendar"})).toBeDisabled()}},n={args:{refusal:{service:"Calendar",intent:"on",message:"Couldn't open Microsoft's sign-in page. Check your connection, and anything blocking redirects, then try again."}},play:async({canvasElement:a})=>{const e=l(a);await t(e.getByRole("switch",{name:"Sync calendar"})).not.toBeChecked(),await t(e.getByText("Couldn't turn calendar on")).toBeVisible(),await t(e.getByRole("link",{name:"Report an issue"})).toBeVisible()}},c={...n,parameters:{theme:"dark"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    enabled: ["Mail", "Calendar"]
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    consented: ["Mail"]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/signing in with Microsoft again/)).toBeVisible();
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  ...CalendarRefused,
  parameters: {
    theme: "dark"
  }
}`,...c.parameters?.docs?.source}}};const _=["MailOnly","BothOn","CalendarNeedsSignIn","Saving","CalendarRefused","Dark"];export{r as BothOn,o as CalendarNeedsSignIn,n as CalendarRefused,c as Dark,s as MailOnly,i as Saving,_ as __namedExportsOrder,O as default};
