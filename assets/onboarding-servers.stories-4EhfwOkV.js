import{h as n,g as p}from"./OnboardingWizard-M2qE-5jk.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./react-query.gen-B1_4DilO.js";import"./account-service-choice-DJhrOwR3.js";import"./banner-2MU9qEbR.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./checkbox-BScpY53m.js";import"./check-ClpQiEYg.js";import"./minus-DMpYC7y2.js";import"./field-label-CxW6NJ7W.js";import"./input-Ejju9bJ0.js";import"./kbd-Ci_wHBAT.js";import"./security-select-DATIil8G.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./wizard-C5YhXmrz.js";import"./badge-CZgi-7XL.js";import"./card-D_7pcfRT.js";import"./useMutation-BWoFIWmj.js";import"./app-password-hint-QFy_kikF.js";import"./password-input-Dx6oMj2f.js";import"./eye-off-gih9PFNb.js";import"./mail-CSMuoKF3.js";import"./loader-circle-CNn9G_XI.js";import"./inbox-vF0NtWrK.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,o=p("gmail");if(!o)throw new Error("the gmail preset is missing");const K={title:"Playground/Shipped/Onboarding/Servers",component:n,parameters:{layout:"fullscreen"},args:{email:"alice@gmail.com",imapConfig:o.imap,smtpConfig:o.smtp,discovered:!0,onContinue:()=>{},onBack:()=>{},onChange:()=>{}}},a={play:async({canvasElement:r})=>{const e=m(r);await t(e.getByLabelText("Provider")).toHaveValue("gmail"),await t(e.getByDisplayValue("imap.gmail.com")).toHaveAttribute("readonly"),await t(e.getByDisplayValue("smtp.gmail.com")).toHaveAttribute("readonly");for(const s of e.getAllByLabelText("Security"))await t(s).toBeDisabled();await t(e.getByText(/2-Step Verification/)).toBeVisible(),await t(e.getByRole("link",{name:"Get an app password"})).toHaveAttribute("href",o.passwordHelp.url)}},i={globals:{viewport:{value:"mobile"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const M=["GmailPreset","GmailPresetPhone"];export{a as GmailPreset,i as GmailPresetPhone,M as __namedExportsOrder,K as default};
