import{j as i}from"./iframe-fYsS-Mr7.js";import{A as o}from"./error-classifier-C58Iuok9.js";import{F as a}from"./FilterActionError-DR0t8fcL.js";import"./preload-helper-PPVm8Dsz.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./createLucideIcon-B5J0h_XM.js";const h={title:"Playground/Shipped/Settings/Filters/FilterActionError",component:a,parameters:{layout:"padded"},decorators:[s=>i.jsx("div",{className:"mx-auto max-w-md",children:i.jsx(s,{})})],args:{onRetry:()=>{},reportHref:()=>"https://github.com/remit-mail/reader/issues/new"}},r={args:{title:"Couldn't turn the filter on",error:new o("This filter has no folder to move mail into yet. Wait for its folder to be created on the mail server, or pick a folder in the rule, then turn it on.",400)}},e={args:{title:"Couldn't turn the filter off",error:new o("The server did not answer.",503)}},t={args:{title:"Couldn't run Invoices over the inbox",error:new o("This filter is turned off or has expired. Turn it on to run it over the inbox.",400)}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const v=["RefusedWithoutFolder","ServerUnavailable","RunNowRefused"];export{r as RefusedWithoutFolder,t as RunNowRefused,e as ServerUnavailable,v as __namedExportsOrder,h as default};
