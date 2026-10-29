import{j as e}from"./iframe-Dz9ev7_1.js";import{b as v}from"./account-service-status-B8MISXtN.js";import{A as m}from"./account-service-toggles-BQ6nRWzA.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./badge-Dsqh0My3.js";import"./banner-CcGBhVUA.js";import"./button-CLbVgqC1.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./account-service-choice-C2zik8EN.js";import"./checkbox-CRAJJObE.js";import"./check-D-jt1aUx.js";import"./minus-rkSVdKQS.js";const{expect:h,userEvent:b,within:g}=__STORYBOOK_MODULE_TEST__,j={title:"Playground/Shipped/Settings/Accounts/AccountServiceToggles",component:m,parameters:{layout:"padded",docs:{description:{component:`What an account syncs, on its settings screen (#1179). The switch asks; the
host confirms and commits.`}}},decorators:[s=>e.jsx("div",{className:"mx-auto max-w-sm rounded-xl border border-line bg-surface p-4",children:e.jsx(s,{})})]},n=["Mail","Calendar"];function p({enabled:s,consented:a=n,offered:l=n,onRequestChange:u=()=>{}}){return e.jsx(m,{providerName:"Microsoft",offered:l,enabled:s,consented:a,onRequestChange:u})}const t={render:()=>e.jsx(p,{enabled:n})},r={render:()=>e.jsx(p,{enabled:["Calendar"]})},o={render:()=>e.jsx(p,{enabled:["Mail"],consented:["Mail"]}),play:async({canvasElement:s})=>{const a=g(s);await h(a.getByText(/signing in with Microsoft again/)).toBeVisible()}},c={render:()=>e.jsx(p,{enabled:n}),play:async({canvasElement:s})=>{const l=g(s).getByRole("switch",{name:"Sync mail"});await b.click(l),await h(l).toBeChecked()}},i={render:()=>e.jsxs(e.Fragment,{children:[e.jsx(m,{providerName:"Fastmail",offered:["Mail"],enabled:["Mail"],consented:["Mail"],onRequestChange:()=>{}}),e.jsx("p",{className:"border-t border-line pt-2 text-2xs text-fg-subtle",children:v})]})},d={render:()=>e.jsx(m,{providerName:"Microsoft",offered:n,enabled:n,consented:n,disabled:!0,onRequestChange:()=>{}}),play:async({canvasElement:s})=>{const a=g(s);await h(a.getByRole("switch",{name:"Sync mail"})).toBeDisabled()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Toggles enabled={bothServices} />
}`,...t.parameters?.docs?.source},description:{story:"Both services on: the state an Outlook account arrives in from onboarding.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Toggles enabled={["Calendar"]} />
}`,...r.parameters?.docs?.source},description:{story:`Mail off. The switch is the only thing that changed — the account keeps its
place and its stored mail, which the other surfaces say for themselves.`,...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Toggles enabled={["Mail"]} consented={["Mail"]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/signing in with Microsoft again/)).toBeVisible();
  }
}`,...o.parameters?.docs?.source},description:{story:`Calendar was never consented to. The row says what turning it on costs before
it is pressed, because no saved setting can grant a scope.`,...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Toggles enabled={bothServices} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const mail = canvas.getByRole("switch", {
      name: "Sync mail"
    });
    await userEvent.click(mail);
    await expect(mail).toBeChecked();
  }
}`,...c.parameters?.docs?.source},description:{story:`Pressing a running service asks to switch it off. Nothing moves on screen:
the host raises the confirmation and owns the change.`,...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <>
            <AccountServiceToggles providerName="Fastmail" offered={["Mail"]} enabled={["Mail"]} consented={["Mail"]} onRequestChange={() => {}} />
            <p className="border-t border-line pt-2 text-2xs text-fg-subtle">
                {ACCOUNT_NO_SERVICE_TOGGLES_MESSAGE}
            </p>
        </>
}`,...i.parameters?.docs?.source},description:{story:`An IMAP account. It syncs mail and nothing else, so there is nothing to
switch — the border below is the whole render.`,...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <AccountServiceToggles providerName="Microsoft" offered={bothServices} enabled={bothServices} consented={bothServices} disabled onRequestChange={() => {}} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch", {
      name: "Sync mail"
    })).toBeDisabled();
  }
}`,...d.parameters?.docs?.source},description:{story:"A change is in flight: neither switch takes a press until it lands.",...d.parameters?.docs?.description}}};const R=["BothOn","MailOff","CalendarNeedsConsent","AsksBeforeItMoves","ImapAccount","Saving"];export{c as AsksBeforeItMoves,t as BothOn,o as CalendarNeedsConsent,i as ImapAccount,r as MailOff,d as Saving,R as __namedExportsOrder,j as default};
