import{h as p}from"./index-lm5PuO84.js";import{R as l}from"./ResetPasswordPage-BhB6Kolm.js";import{H as m}from"./iframe-DUn0T08W.js";import"./auth-card-CSnHFyWj.js";import"./cn-IyxL_b2c.js";import"./auth-footer-5ZnQyxtA.js";import"./auth-hero-DH83tJS9.js";import"./banner-CekMrGzb.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";import"./password-input-CpfApATZ.js";import"./input-hGJM2SV8.js";import"./eye-off-C6a5zjsv.js";import"./bug-report-vYCUKYUD.js";import"./runtime-config-aIiziXlW.js";import"./app-info-BsoZZlWQ.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./error-classifier-C58Iuok9.js";import"./account-menu-mode-Dk2Dxdci.js";import"./fatal-error-D4ejsY3H.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,fn:d,userEvent:w,waitFor:u,within:i}=__STORYBOOK_MODULE_TEST__,g=p.post("/api/auth/reset-password",()=>m.json({status:!0})),F={title:"Playground/Shipped/Sign in/Reset link",component:l,args:{token:"q8Zr2w1kVb0x",onDone:d()},parameters:{layout:"fullscreen",msw:{handlers:[g]}}},c=async(e,a)=>{const t=i(e);await w.type(await t.findByLabelText("New password"),a),await w.click(t.getByRole("button",{name:"Set password"}))},n={play:async({args:e,canvasElement:a})=>{const t=i(a);await s(await t.findByText("Choose a new password")).toBeVisible(),await s(t.getByLabelText("New password")).toHaveFocus(),await c(a,"a long phrase to remember"),await u(()=>s(e.onDone).toHaveBeenCalled())}},o={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INVALID_TOKEN",message:"Invalid token"},{status:400}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText("This link no longer works. Ask for a new one.")).toBeVisible()}},r={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INTERNAL_SERVER_ERROR",message:"Internal error"},{status:500}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText(/Your password was not set/)).toBeVisible(),await s(a.getByRole("link",{name:"Report an issue"})).toBeVisible()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Choose a new password")).toBeVisible();
    await expect(canvas.getByLabelText("New password")).toHaveFocus();
    await setPassword(canvasElement, "a long phrase to remember");
    await waitFor(() => expect(args.onDone).toHaveBeenCalled());
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  parameters: {
    msw: {
      handlers: [http.post("/api/auth/reset-password", () => HttpResponse.json({
        code: "INVALID_TOKEN",
        message: "Invalid token"
      }, {
        status: 400
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await setPassword(canvasElement, "a long phrase to remember");
    await expect(await canvas.findByText("This link no longer works. Ask for a new one.")).toBeVisible();
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  parameters: {
    msw: {
      handlers: [http.post("/api/auth/reset-password", () => HttpResponse.json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal error"
      }, {
        status: 500
      }))]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await setPassword(canvasElement, "a long phrase to remember");
    await expect(await canvas.findByText(/Your password was not set/)).toBeVisible();
    await expect(canvas.getByRole("link", {
      name: "Report an issue"
    })).toBeVisible();
  }
}`,...r.parameters?.docs?.source}}};const j=["ResetPage","LinkNoLongerWorks","ServerFailed"];export{o as LinkNoLongerWorks,n as ResetPage,r as ServerFailed,j as __namedExportsOrder,F as default};
