import{h as n,g as p}from"./OnboardingWizard-BrJf2qKd.js";import"./iframe-4Y_dM_UU.js";import"./preload-helper-PPVm8Dsz.js";import"./react-query.gen-C52jVGEN.js";import"./client.gen-84yaupxO.js";import"./account-service-choice-DCxlrFpF.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./checkbox-D2Z4W3-k.js";import"./check-DSdQDF54.js";import"./minus-DGSQI1I1.js";import"./field-label-UzlVOcad.js";import"./input-BVRvisgp.js";import"./kbd-C2eSrNUu.js";import"./security-select-DdTULCBE.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./wizard-f_t1X_lP.js";import"./badge-BALHcx9W.js";import"./card-CX8e6OH8.js";import"./useMutation-DOEmXLBu.js";import"./app-password-hint-BbBJDKaR.js";import"./password-input-Bn6nsU-7.js";import"./eye-off-9T6hOklU.js";import"./mail-1N_4GVps.js";import"./loader-circle-Bx4Yqfec.js";import"./inbox-CvUF9C2g.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,o=p("gmail");if(!o)throw new Error("the gmail preset is missing");const M={title:"Playground/Shipped/Onboarding/Servers",component:n,parameters:{layout:"fullscreen"},args:{email:"alice@gmail.com",imapConfig:o.imap,smtpConfig:o.smtp,discovered:!0,onContinue:()=>{},onBack:()=>{},onChange:()=>{}}},a={play:async({canvasElement:r})=>{const e=m(r);await t(e.getByLabelText("Provider")).toHaveValue("gmail"),await t(e.getByDisplayValue("imap.gmail.com")).toHaveAttribute("readonly"),await t(e.getByDisplayValue("smtp.gmail.com")).toHaveAttribute("readonly");for(const s of e.getAllByLabelText("Security"))await t(s).toBeDisabled();await t(e.getByText(/2-Step Verification/)).toBeVisible(),await t(e.getByRole("link",{name:"Get an app password"})).toHaveAttribute("href",o.passwordHelp.url)}},i={globals:{viewport:{value:"mobile"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Provider")).toHaveValue("gmail");
    await expect(canvas.getByDisplayValue("imap.gmail.com")).toHaveAttribute("readonly");
    await expect(canvas.getByDisplayValue("smtp.gmail.com")).toHaveAttribute("readonly");
    for (const security of canvas.getAllByLabelText("Security")) {
      await expect(security).toBeDisabled();
    }
    await expect(canvas.getByText(/2-Step Verification/)).toBeVisible();
    await expect(canvas.getByRole("link", {
      name: "Get an app password"
    })).toHaveAttribute("href", gmail.passwordHelp.url);
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "mobile"
    }
  }
}`,...i.parameters?.docs?.source}}};const U=["GmailPreset","GmailPresetPhone"];export{a as GmailPreset,i as GmailPresetPhone,U as __namedExportsOrder,M as default};
