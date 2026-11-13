import{j as e}from"./iframe-fYsS-Mr7.js";import{B as u}from"./banner-2MU9qEbR.js";import{B as g}from"./button-S2h7_ODQ.js";import{M as x}from"./mcp-error-notice-dRUPHjWH.js";import{M as f}from"./mcp-page-eygUuE1a.js";import{M as y}from"./mcp-permission-list-DJN4ZAOX.js";import{c as h}from"./createLucideIcon-B5J0h_XM.js";import{m as j,a as d}from"./mcp-fixtures-ggOEzzmm.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./x-sSwTlOFF.js";import"./auth-card-Bnq0929f.js";import"./auth-hero-fPtBd9DR.js";import"./check-ClpQiEYg.js";const m={name:"unplug",size:24,node:[["path",{d:"m19 5 3-3",key:"yk6iyv"}],["path",{d:"m2 22 3-3",key:"19mgm9"}],["path",{d:"M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z",key:"goz73y"}],["path",{d:"M7.5 13.5 10 11",key:"7xgeeb"}],["path",{d:"M10.5 16.5 13 14",key:"10btkg"}],["path",{d:"m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z",key:"1snsnr"}]]};m.node;const C=h(m);function M({app:s}){return e.jsxs("li",{className:"flex flex-col gap-3 py-4 first:pt-0 last:pb-0",children:[e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"truncate font-medium text-fg",children:s.name}),e.jsxs("p",{className:"text-xs text-fg-muted",children:["Connected on ",s.connectedOn]})]}),e.jsxs("form",{method:"post",children:[e.jsx("input",{type:"hidden",name:"client_id",value:s.clientId}),e.jsx(g,{type:"submit",variant:"danger",size:"sm",icon:e.jsx(C,{className:"size-3.5","aria-hidden":"true"}),"aria-label":`Disconnect ${s.name}`,children:"Disconnect"})]})]}),e.jsx(y,{permissions:s.permissions})]})}function l({apps:s,disconnected:n,error:i}){return e.jsxs(f,{heading:"Connected apps",intro:"These apps can use your mail. Disconnecting one signs it out at once.",children:[i&&e.jsx(x,{error:i}),n&&e.jsxs(u,{tone:"success",variant:"soft",children:["Disconnected ",n,". It can no longer use your mail."]}),s.length===0?e.jsx("p",{className:"text-sm text-fg-muted",children:"No apps are connected. Add remit as a connector in Claude to connect one."}):e.jsx("ul",{className:"flex flex-col divide-y divide-line",children:s.map(p=>e.jsx(M,{app:p},p.clientId))})]})}l.__docgenInfo={description:"",methods:[],displayName:"McpConnectedAppsPage",props:{apps:{required:!0,tsType:{name:"unknown"},description:""},disconnected:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"McpPageError"},description:""}}};const{expect:D,within:v}=__STORYBOOK_MODULE_TEST__,U={title:"Playground/Proposed/MCP/McpConnectedAppsPage",tags:["proposed"],component:l,parameters:{layout:"fullscreen"}},c=[{clientId:"client-claude-ai",name:"Claude",permissions:d,connectedOn:"12 October 2026"},{clientId:"client-claude-code",name:"Claude Code",permissions:d.slice(0,1),connectedOn:"20 October 2026"}],a={args:{apps:c},play:async({canvasElement:s})=>{const n=v(s);await D(n.getByRole("button",{name:"Disconnect Claude Code"})).toBeVisible()}},t={args:{apps:c.slice(1),disconnected:"Claude"}},r={args:{apps:[]}},o={args:{apps:c,error:{message:"Disconnecting Claude failed.",fix:"Reload the page and try again.",reportUrl:j.reportUrl}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    apps
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Disconnect Claude Code"
    })).toBeVisible();
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    apps: apps.slice(1),
    disconnected: "Claude"
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    apps: []
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    apps,
    error: {
      message: "Disconnecting Claude failed.",
      fix: "Reload the page and try again.",
      reportUrl: mcpErrorFixture.reportUrl
    }
  }
}`,...o.parameters?.docs?.source}}};const F=["TwoApps","JustDisconnected","NoApps","DisconnectFailed"];export{o as DisconnectFailed,t as JustDisconnected,r as NoApps,a as TwoApps,F as __namedExportsOrder,U as default};
