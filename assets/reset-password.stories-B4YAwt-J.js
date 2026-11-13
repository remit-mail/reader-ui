import{h as p}from"./index-GapsuZA8.js";import{R as l}from"./ResetPasswordPage-DiqzMwX5.js";import{H as m}from"./iframe-fYsS-Mr7.js";import"./auth-card-Bnq0929f.js";import"./cn-IyxL_b2c.js";import"./auth-footer-BzmpxYxW.js";import"./auth-hero-fPtBd9DR.js";import"./banner-2MU9qEbR.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./password-input-Dx6oMj2f.js";import"./input-Ejju9bJ0.js";import"./eye-off-gih9PFNb.js";import"./bug-report-vYCUKYUD.js";import"./runtime-config-aIiziXlW.js";import"./app-info-BsoZZlWQ.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./error-classifier-C58Iuok9.js";import"./account-menu-mode-DTqMpoyE.js";import"./fatal-error-D4ejsY3H.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,fn:d,userEvent:w,waitFor:u,within:i}=__STORYBOOK_MODULE_TEST__,g=p.post("/api/auth/reset-password",()=>m.json({status:!0})),F={title:"Playground/Shipped/Sign in/Reset link",component:l,args:{token:"q8Zr2w1kVb0x",onDone:d()},parameters:{layout:"fullscreen",msw:{handlers:[g]}}},c=async(e,a)=>{const t=i(e);await w.type(await t.findByLabelText("New password"),a),await w.click(t.getByRole("button",{name:"Set password"}))},n={play:async({args:e,canvasElement:a})=>{const t=i(a);await s(await t.findByText("Choose a new password")).toBeVisible(),await s(t.getByLabelText("New password")).toHaveFocus(),await c(a,"a long phrase to remember"),await u(()=>s(e.onDone).toHaveBeenCalled())}},o={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INVALID_TOKEN",message:"Invalid token"},{status:400}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText("This link no longer works. Ask for a new one.")).toBeVisible()}},r={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INTERNAL_SERVER_ERROR",message:"Internal error"},{status:500}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText(/Your password was not set/)).toBeVisible(),await s(a.getByRole("link",{name:"Report an issue"})).toBeVisible()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
