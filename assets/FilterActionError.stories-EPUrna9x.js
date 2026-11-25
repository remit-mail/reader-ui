import{j as i}from"./iframe-4Y_dM_UU.js";import{A as o}from"./api-BX6GFMBA.js";import{F as a}from"./FilterActionError-NL55aZMt.js";import"./preload-helper-PPVm8Dsz.js";import"./app-info-BsoZZlWQ.js";import"./ErrorState-DI525bMD.js";import"./circle-alert-Z6J3DHRJ.js";import"./createLucideIcon-DkKJcbI9.js";import"./error-classifier-BtUaFX2r.js";const v={title:"Playground/Shipped/Settings/Filters/FilterActionError",component:a,parameters:{layout:"padded"},decorators:[s=>i.jsx("div",{className:"mx-auto max-w-md",children:i.jsx(s,{})})],args:{onRetry:()=>{},reportHref:()=>"https://github.com/remit-mail/reader/issues/new"}},r={args:{title:"Couldn't turn the filter on",error:new o("This filter has no folder to move mail into yet. Wait for its folder to be created on the mail server, or pick a folder in the rule, then turn it on.",400)}},e={args:{title:"Couldn't turn the filter off",error:new o("The server did not answer.",503)}},t={args:{title:"Couldn't run Invoices over the inbox",error:new o("This filter is turned off or has expired. Turn it on to run it over the inbox.",400)}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Couldn't turn the filter on",
    error: new ApiError("This filter has no folder to move mail into yet. Wait for its folder to be created on the mail server, or pick a folder in the rule, then turn it on.", 400)
  }
}`,...r.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Couldn't turn the filter off",
    error: new ApiError("The server did not answer.", 503)
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Couldn't run Invoices over the inbox",
    error: new ApiError("This filter is turned off or has expired. Turn it on to run it over the inbox.", 400)
  }
}`,...t.parameters?.docs?.source}}};const x=["RefusedWithoutFolder","ServerUnavailable","RunNowRefused"];export{r as RefusedWithoutFolder,t as RunNowRefused,e as ServerUnavailable,x as __namedExportsOrder,v as default};
