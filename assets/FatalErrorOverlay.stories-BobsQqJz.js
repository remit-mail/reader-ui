import{F as o}from"./FatalErrorOverlay-CiAhh253.js";import"./iframe-4Y_dM_UU.js";import"./preload-helper-PPVm8Dsz.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./bug-report-Ca4X2TPn.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./app-info-BsoZZlWQ.js";import"./fatal-error-uyeiu8Zk.js";import"./octagon-alert-ChID51gq.js";import"./createLucideIcon-DkKJcbI9.js";const{expect:n,within:r}=__STORYBOOK_MODULE_TEST__,B={title:"Playground/Shipped/App/FatalErrorOverlay",component:o,parameters:{layout:"fullscreen"}},i=a=>({error:new Error(a.message),message:"",correlationId:"a1b2c3d4-5678-90ab-cdef-1234567890ab",at:Date.UTC(2024,5,12,10,30),...a}),e={args:{fatal:i({message:"date value is not finite in DateTimeFormat format()",correlationId:"def45678-90ab-cdef-1234-567890abcdef"})},play:async({canvasElement:a})=>{const t=r(a);await n(t.getByRole("link",{name:"Go to inbox"})).toBeVisible(),await n(t.queryByRole("button",{name:"Retry"})).toBeNull()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    fatal: fatal({
      message: "date value is not finite in DateTimeFormat format()",
      correlationId: "def45678-90ab-cdef-1234-567890abcdef"
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
}`,...e.parameters?.docs?.source}}};const v=["DeterministicFatal"];export{e as DeterministicFatal,v as __namedExportsOrder,B as default};
