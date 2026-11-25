import"./i18n-BLLgTVve.js";import{a as d}from"./OfflineStorageSettings-BiSaREkr.js";import"./useTranslation-DNmopoz8.js";import"./iframe-4Y_dM_UU.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BNcng5Oi.js";import"./cn-IyxL_b2c.js";import"./app-info-BsoZZlWQ.js";const{expect:e,fn:c,userEvent:i,within:l}=__STORYBOOK_MODULE_TEST__,y={title:"Playground/Shipped/Settings/Advanced/Downloads",component:d,args:{usage:12582912,onRemove:c()}},n={play:async({canvasElement:t,args:a})=>{const r=l(t);await e(r.getByText("Downloaded mail: 12.0 MiB used")).toBeVisible(),await e(a.onRemove).not.toHaveBeenCalled(),await i.click(r.getByRole("button",{name:"Remove downloads"})),await e(a.onRemove).toHaveBeenCalledOnce(),await e(r.queryByText(/Session verified|may be removed|Keep downloads/)).toBeNull()}},o={args:{refreshOff:!1,onDisableRefresh:c()},play:async({canvasElement:t,args:a})=>{await i.click(l(t).getByRole("button",{name:"Turn off background refresh"})),await e(a.onDisableRefresh).toHaveBeenCalledOnce()}},s={args:{refreshOff:!0}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Downloaded mail: 12.0 MiB used")).toBeVisible();
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove downloads"
    }));
    await expect(args.onRemove).toHaveBeenCalledOnce();
    await expect(canvas.queryByText(/Session verified|may be removed|Keep downloads/)).toBeNull();
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    refreshOff: false,
    onDisableRefresh: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "Turn off background refresh"
    }));
    await expect(args.onDisableRefresh).toHaveBeenCalledOnce();
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    refreshOff: true
  }
}`,...s.parameters?.docs?.source}}};const R=["Downloads","BackgroundRefresh","BackgroundRefreshOff"];export{o as BackgroundRefresh,s as BackgroundRefreshOff,n as Downloads,R as __namedExportsOrder,y as default};
