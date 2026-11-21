import{h as n,g as p}from"./OnboardingWizard-C3cIs8ch.js";import"./iframe-DUn0T08W.js";import"./preload-helper-PPVm8Dsz.js";import"./react-query.gen-B4habc-D.js";import"./account-service-choice-BLd-r7C6.js";import"./banner-CekMrGzb.js";import"./cn-IyxL_b2c.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";import"./checkbox-DFAZ3ZDJ.js";import"./check-D47ZSDJv.js";import"./minus-CDlI3PPe.js";import"./field-label-C_T9yPZP.js";import"./input-hGJM2SV8.js";import"./kbd-BLDlHYS1.js";import"./security-select-CBxiomWH.js";import"./select-CiV3kovV.js";import"./chevron-down-Cg1fb-Gx.js";import"./wizard-D9kOFtUw.js";import"./badge-DVSnq8Ns.js";import"./card-DiRo3N8k.js";import"./useMutation-BSnD0KLu.js";import"./app-password-hint-wzf_82al.js";import"./password-input-CpfApATZ.js";import"./eye-off-C6a5zjsv.js";import"./mail-DoYzsxpw.js";import"./loader-circle-RDj8FSNn.js";import"./inbox-CjrXUxPh.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,o=p("gmail");if(!o)throw new Error("the gmail preset is missing");const K={title:"Playground/Shipped/Onboarding/Servers",component:n,parameters:{layout:"fullscreen"},args:{email:"alice@gmail.com",imapConfig:o.imap,smtpConfig:o.smtp,discovered:!0,onContinue:()=>{},onBack:()=>{},onChange:()=>{}}},a={play:async({canvasElement:r})=>{const e=m(r);await t(e.getByLabelText("Provider")).toHaveValue("gmail"),await t(e.getByDisplayValue("imap.gmail.com")).toHaveAttribute("readonly"),await t(e.getByDisplayValue("smtp.gmail.com")).toHaveAttribute("readonly");for(const s of e.getAllByLabelText("Security"))await t(s).toBeDisabled();await t(e.getByText(/2-Step Verification/)).toBeVisible(),await t(e.getByRole("link",{name:"Get an app password"})).toHaveAttribute("href",o.passwordHelp.url)}},i={globals:{viewport:{value:"mobile"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
