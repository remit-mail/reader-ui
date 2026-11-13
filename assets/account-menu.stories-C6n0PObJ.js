import{j as a}from"./iframe-fYsS-Mr7.js";import{A as g}from"./account-menu-p0ddYYaV.js";import{S as x}from"./shield-check-DrL7mG2j.js";import"./preload-helper-PPVm8Dsz.js";import"./avatar-aV0gIO8j.js";import"./cn-IyxL_b2c.js";import"./popover-menu-ehwPF20G.js";import"./index-DbNRduy1.js";import"./index-BNekr84Q.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./button-S2h7_ODQ.js";import"./createLucideIcon-B5J0h_XM.js";const{expect:n,fn:v,userEvent:s,waitFor:w,within:c}=__STORYBOOK_MODULE_TEST__,b="info@example.com",D={title:"Design System/Auth/AccountMenu",component:g,parameters:{layout:"padded"},args:{email:b,onSignOut:()=>{}},render:e=>a.jsx("div",{className:"flex h-48 justify-end p-4",children:a.jsx(g,{...e})})},r={},i={play:async({canvasElement:e})=>{const o=c(e);await s.click(o.getByRole("button",{name:"Account"}));const t=c(e.ownerDocument.body);await n(t.getByTestId("account-menu-email")).toHaveTextContent(b),await n(t.getByRole("menuitem",{name:"Sign out"})).toBeVisible()}},u={args:{sections:[{id:"security",label:"Security",icon:a.jsx(x,{className:"size-4"})}],onOpenSection:v()},play:async({canvasElement:e})=>{const o=c(e);await s.click(o.getByRole("button",{name:"Account"}));const t=c(e.ownerDocument.body);await n(t.getByRole("menuitem",{name:"Security"})).toBeVisible()}},m={args:{email:null},play:async({canvasElement:e})=>{const o=c(e);await s.click(o.getByRole("button",{name:"Account"}));const t=c(e.ownerDocument.body);await n(t.queryByTestId("account-menu-email")).toBeNull(),await n(t.getByRole("menuitem",{name:"Sign out"})).toBeVisible()}},l={args:{onSignOut:v()},render:e=>a.jsxs("div",{className:"flex h-48 items-start justify-end gap-2 p-4",children:[a.jsx(g,{...e}),a.jsx("button",{type:"button",children:"After the menu"})]}),play:async({args:e,canvasElement:o})=>{const t=c(o),d=c(o.ownerDocument.body),y=t.getByRole("button",{name:"Account"});await s.tab(),await n(y).toHaveFocus(),await s.keyboard("{Enter}");const B=await d.findByRole("menuitem",{name:"Sign out"});await w(()=>n(B).toHaveFocus()),await s.keyboard("{Escape}"),await n(d.queryByRole("menuitem")).toBeNull(),await n(y).toHaveFocus(),await s.keyboard("{Enter}"),await w(()=>n(d.getByRole("menuitem",{name:"Sign out"})).toHaveFocus()),await s.keyboard("{Enter}"),await n(e.onSignOut).toHaveBeenCalledOnce(),await n(y).toHaveFocus()}},p={render:e=>a.jsxs("header",{className:"flex h-pane-header shrink-0 items-center gap-1 border-b border-line bg-surface px-3",children:[a.jsx("div",{className:"flex-1"}),a.jsx(g,{...e})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Account"
    }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByTestId("account-menu-email")).toHaveTextContent(EMAIL);
    await expect(page.getByRole("menuitem", {
      name: "Sign out"
    })).toBeVisible();
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      id: "security",
      label: "Security",
      icon: <ShieldCheck className="size-4" />
    }],
    onOpenSection: fn()
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Account"
    }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole("menuitem", {
      name: "Security"
    })).toBeVisible();
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    email: null
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Account"
    }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(page.queryByTestId("account-menu-email")).toBeNull();
    await expect(page.getByRole("menuitem", {
      name: "Sign out"
    })).toBeVisible();
  }
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    onSignOut: fn()
  },
  render: args => <div className="flex h-48 items-start justify-end gap-2 p-4">
            <AccountMenu {...args} />
            <button type="button">After the menu</button>
        </div>,
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", {
      name: "Account"
    });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const signOut = await page.findByRole("menuitem", {
      name: "Sign out"
    });
    await waitFor(() => expect(signOut).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(page.queryByRole("menuitem")).toBeNull();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(page.getByRole("menuitem", {
      name: "Sign out"
    })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(args.onSignOut).toHaveBeenCalledOnce();
    await expect(trigger).toHaveFocus();
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <header className="flex h-pane-header shrink-0 items-center gap-1 border-b border-line bg-surface px-3">
            <div className="flex-1" />
            <AccountMenu {...args} />
        </header>
}`,...p.parameters?.docs?.source}}};const C=["Closed","Open","WithSection","NoEmail","KeyboardReachesSignOut","InTopBar"];export{r as Closed,p as InTopBar,l as KeyboardReachesSignOut,m as NoEmail,i as Open,u as WithSection,C as __namedExportsOrder,D as default};
