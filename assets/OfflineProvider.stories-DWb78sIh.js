import"./i18n-BLLgTVve.js";import{r as v,j as l}from"./iframe-4Y_dM_UU.js";import{B as u}from"./banner-Dq9rhq1I.js";import{B as w}from"./button-BNcng5Oi.js";import{u as y}from"./useTranslation-DNmopoz8.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";function i({onRemove:a}){const[e,o]=v.useState(!1),p=async()=>{try{await a()}catch{o(!0)}},{t:s}=y("common",{useSuspense:!1});return l.jsxs("div",{className:"mx-auto max-w-lg space-y-4 p-6",children:[l.jsx(u,{tone:"danger",children:e?s("offlineStorage.removeFailed","Downloads could not be removed. Try again."):s("offlineStorage.startupFailed","Downloaded mail could not be opened. Remove downloads on this device to reopen the app.")}),l.jsx(w,{variant:"secondary",onClick:()=>{p()},children:s("offlineStorage.removeAndReload","Remove downloads and reload")})]})}i.__docgenInfo={description:"",methods:[],displayName:"OfflineStartupFailure"};const{expect:r,fn:c,userEvent:d,within:m}=__STORYBOOK_MODULE_TEST__,_={title:"Playground/Shipped/Downloads/Startup failure",component:i,args:{onRemove:c()}},n={play:async({canvasElement:a,args:e})=>{const o=m(a);await r(o.getByRole("alert")).toBeVisible(),await r(e.onRemove).not.toHaveBeenCalled(),await d.click(o.getByRole("button",{name:"Remove downloads and reload"})),await r(e.onRemove).toHaveBeenCalledOnce()}},t={args:{onRemove:c(async()=>{throw new Error("Storage unavailable")})},play:async({canvasElement:a})=>{const e=m(a);await d.click(e.getByRole("button",{name:"Remove downloads and reload"})),await r(await e.findByText("Downloads could not be removed. Try again.")).toBeVisible()}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toBeVisible();
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove downloads and reload"
    }));
    await expect(args.onRemove).toHaveBeenCalledOnce();
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    onRemove: fn(async () => {
      throw new Error("Storage unavailable");
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove downloads and reload"
    }));
    await expect(await canvas.findByText("Downloads could not be removed. Try again.")).toBeVisible();
  }
}`,...t.parameters?.docs?.source}}};const O=["IncompatibleDownloads","RemoveFailed"];export{n as IncompatibleDownloads,t as RemoveFailed,O as __namedExportsOrder,_ as default};
