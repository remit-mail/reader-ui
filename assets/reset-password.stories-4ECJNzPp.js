import{h as p}from"./index-yPRBoKxh.js";import{R as l}from"./ResetPasswordPage-CwAoccYI.js";import{H as m}from"./iframe-4Y_dM_UU.js";import"./auth-card-9_Hn5fmk.js";import"./cn-IyxL_b2c.js";import"./auth-footer-BZd0-HVM.js";import"./auth-hero-ti3lZauA.js";import"./banner-Dq9rhq1I.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./password-input-Bn6nsU-7.js";import"./input-BVRvisgp.js";import"./eye-off-9T6hOklU.js";import"./bug-report-Ca4X2TPn.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./app-info-BsoZZlWQ.js";import"./error-classifier-BtUaFX2r.js";import"./api-BX6GFMBA.js";import"./account-menu-mode-D54Yt6M8.js";import"./fatal-error-uyeiu8Zk.js";import"./network-error-tuI5IsFH.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,fn:d,userEvent:w,waitFor:u,within:i}=__STORYBOOK_MODULE_TEST__,g=p.post("/api/auth/reset-password",()=>m.json({status:!0})),j={title:"Playground/Shipped/Sign in/Reset link",component:l,args:{token:"q8Zr2w1kVb0x",onDone:d()},parameters:{layout:"fullscreen",msw:{handlers:[g]}}},c=async(e,a)=>{const t=i(e);await w.type(await t.findByLabelText("New password"),a),await w.click(t.getByRole("button",{name:"Set password"}))},n={play:async({args:e,canvasElement:a})=>{const t=i(a);await s(await t.findByText("Choose a new password")).toBeVisible(),await s(t.getByLabelText("New password")).toHaveFocus(),await c(a,"a long phrase to remember"),await u(()=>s(e.onDone).toHaveBeenCalled())}},o={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INVALID_TOKEN",message:"Invalid token"},{status:400}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText("This link no longer works. Ask for a new one.")).toBeVisible()}},r={parameters:{msw:{handlers:[p.post("/api/auth/reset-password",()=>m.json({code:"INTERNAL_SERVER_ERROR",message:"Internal error"},{status:500}))]}},play:async({canvasElement:e})=>{const a=i(e);await c(e,"a long phrase to remember"),await s(await a.findByText(/Your password was not set/)).toBeVisible(),await s(a.getByRole("link",{name:"Report an issue"})).toBeVisible()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const C=["ResetPage","LinkNoLongerWorks","ServerFailed"];export{o as LinkNoLongerWorks,n as ResetPage,r as ServerFailed,C as __namedExportsOrder,j as default};
