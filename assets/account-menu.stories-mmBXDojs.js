import{j as s}from"./iframe-COEer--I.js";import{A as g}from"./account-menu-BZN3Iuct.js";import"./preload-helper-PPVm8Dsz.js";import"./avatar-D5JTcjxk.js";import"./cn-d2XQ1MEC.js";import"./popover-menu-DqRTBmMJ.js";import"./index-DmgW5JrR.js";import"./overlay-scope-DP4ejR8d.js";import"./keymap-dispatch-DTaqnLKC.js";import"./button-BKOwcnJQ.js";import"./createLucideIcon-BvDEQKSa.js";import"./shield-check-CKjYFdJe.js";const{expect:t,fn:x,userEvent:o,waitFor:w,within:r}=__STORYBOOK_MODULE_TEST__,v="info@example.com",N={title:"Design System/Auth/AccountMenu",component:g,parameters:{layout:"padded"},args:{email:v,onSignOut:()=>{}},render:e=>s.jsx("div",{className:"flex h-48 justify-end p-4",children:s.jsx(g,{...e})})},c={},i={play:async({canvasElement:e})=>{const a=r(e);await o.click(a.getByRole("button",{name:"Account"}));const n=r(e.ownerDocument.body);await t(n.getByTestId("account-menu-email")).toHaveTextContent(v),await t(n.getByRole("menuitem",{name:"Sign out"})).toBeVisible()}},u={args:{securityUrl:"https://login.example.com/security"},play:async({canvasElement:e})=>{const a=r(e);await o.click(a.getByRole("button",{name:"Account"}));const n=r(e.ownerDocument.body);await t(n.getByRole("menuitem",{name:"Security"})).toBeVisible()}},m={args:{email:null},play:async({canvasElement:e})=>{const a=r(e);await o.click(a.getByRole("button",{name:"Account"}));const n=r(e.ownerDocument.body);await t(n.queryByTestId("account-menu-email")).toBeNull(),await t(n.getByRole("menuitem",{name:"Sign out"})).toBeVisible()}},l={args:{onSignOut:x()},render:e=>s.jsxs("div",{className:"flex h-48 items-start justify-end gap-2 p-4",children:[s.jsx(g,{...e}),s.jsx("button",{type:"button",children:"After the menu"})]}),play:async({args:e,canvasElement:a})=>{const n=r(a),d=r(a.ownerDocument.body),y=n.getByRole("button",{name:"Account"});await o.tab(),await t(y).toHaveFocus(),await o.keyboard("{Enter}");const b=await d.findByRole("menuitem",{name:"Sign out"});await w(()=>t(b).toHaveFocus()),await o.keyboard("{Escape}"),await t(d.queryByRole("menuitem")).toBeNull(),await t(y).toHaveFocus(),await o.keyboard("{Enter}"),await w(()=>t(d.getByRole("menuitem",{name:"Sign out"})).toHaveFocus()),await o.keyboard("{Enter}"),await t(e.onSignOut).toHaveBeenCalledOnce(),await t(y).toHaveFocus()}},p={render:e=>s.jsxs("header",{className:"flex h-pane-header shrink-0 items-center gap-1 border-b border-line bg-surface px-3",children:[s.jsx("div",{className:"flex-1"}),s.jsx(g,{...e})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
    securityUrl: "https://login.example.com/security"
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
}`,...p.parameters?.docs?.source}}};const T=["Closed","Open","WithSecurityLink","NoEmail","KeyboardReachesSignOut","InTopBar"];export{c as Closed,p as InTopBar,l as KeyboardReachesSignOut,m as NoEmail,i as Open,u as WithSecurityLink,T as __namedExportsOrder,N as default};
