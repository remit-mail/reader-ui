import{F as i}from"./FatalErrorOverlay-BHr1fTz9.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./bug-report-vYCUKYUD.js";import"./runtime-config-aIiziXlW.js";import"./app-info-BsoZZlWQ.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./fatal-error-D4ejsY3H.js";import"./error-classifier-C58Iuok9.js";import"./octagon-alert-DwiO4oVu.js";import"./createLucideIcon-B5J0h_XM.js";const{expect:r,within:o}=__STORYBOOK_MODULE_TEST__,w={title:"Playground/Shipped/App/FatalErrorOverlay",component:i,parameters:{layout:"fullscreen"}},s=e=>({error:new Error(e.message),message:"",correlationId:"a1b2c3d4-5678-90ab-cdef-1234567890ab",at:Date.UTC(2024,5,12,10,30),recoverable:!0,...e}),t={args:{fatal:s({message:"Request failed with status 500",recoverable:!0})},play:async({canvasElement:e})=>{const a=o(e);await r(a.getByRole("button",{name:"Retry"})).toBeVisible(),await r(a.queryByRole("link",{name:"Go to inbox"})).toBeNull()}},n={args:{fatal:s({message:"date value is not finite in DateTimeFormat format()",correlationId:"def45678-90ab-cdef-1234-567890abcdef",recoverable:!1})},play:async({canvasElement:e})=>{const a=o(e);await r(a.getByRole("link",{name:"Go to inbox"})).toBeVisible(),await r(a.queryByRole("button",{name:"Retry"})).toBeNull()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    fatal: fatal({
      message: "Request failed with status 500",
      recoverable: true
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Retry"
    })).toBeVisible();
    await expect(canvas.queryByRole("link", {
      name: "Go to inbox"
    })).toBeNull();
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    fatal: fatal({
      message: "date value is not finite in DateTimeFormat format()",
      correlationId: "def45678-90ab-cdef-1234-567890abcdef",
      recoverable: false
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", {
      name: "Go to inbox"
    })).toBeVisible();
    await expect(canvas.queryByRole("button", {
      name: "Retry"
    })).toBeNull();
  }
}`,...n.parameters?.docs?.source}}};const x=["RecoverableTransient","DeterministicFatal"];export{n as DeterministicFatal,t as RecoverableTransient,x as __namedExportsOrder,w as default};
