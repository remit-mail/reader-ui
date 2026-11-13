import{j as e}from"./iframe-fYsS-Mr7.js";import{B as i}from"./button-S2h7_ODQ.js";import{P as m}from"./pane-header--3TImZzz.js";import{A as d}from"./arrow-left-D4dy6b0r.js";import{M as u}from"./menu-DUwnioRQ.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./createLucideIcon-B5J0h_XM.js";const{expect:l,within:c}=__STORYBOOK_MODULE_TEST__,p=a=>e.jsx("div",{className:"overflow-hidden rounded-lg border border-line bg-canvas",style:{width:360},children:e.jsx(a,{})}),w={title:"Design System/Mail/PaneHeader",component:m,parameters:{layout:"centered"},decorators:[p],args:{title:"Outbox"}},s={play:async({canvasElement:a})=>{await l(c(a).getByRole("heading",{level:1,name:"Outbox"})).toBeVisible()}},t={args:{leading:e.jsx(i,{variant:"ghost",size:"sm","aria-label":"Menu",icon:e.jsx(u,{className:"size-4"})}),children:e.jsx("span",{className:"shrink-0 text-2xs text-fg-subtle",children:"3 messages"})}},n={args:{title:void 0,leading:e.jsx(i,{variant:"ghost",size:"sm",icon:e.jsx(d,{className:"size-3.5"}),children:"Back to Inbox"})},play:async({canvasElement:a})=>{await l(c(a).queryByRole("heading")).toBeNull()}},r={args:{title:void 0}},o={args:{title:"Consolidated quarterly reconciliation of the shared drive migration"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("heading", {
      level: 1,
      name: "Outbox"
    })).toBeVisible();
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    leading: <Button variant="ghost" size="sm" aria-label="Menu" icon={<Menu className="size-4" />} />,
    children: <span className="shrink-0 text-2xs text-fg-subtle">3 messages</span>
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    title: undefined,
    leading: <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-3.5" />}>
                Back to Inbox
            </Button>
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole("heading")).toBeNull();
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: undefined
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Consolidated quarterly reconciliation of the shared drive migration"
  }
}`,...o.parameters?.docs?.source}}};const O=["Title","WithMenuAndCount","BackOnly","Blank","LongTitle"];export{n as BackOnly,r as Blank,o as LongTitle,s as Title,t as WithMenuAndCount,O as __namedExportsOrder,w as default};
