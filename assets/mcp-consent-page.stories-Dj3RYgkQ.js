import{j as e}from"./iframe-DUn0T08W.js";import{B as p}from"./button-BgYe3szE.js";import{C as y}from"./checkbox-DFAZ3ZDJ.js";import{M as g}from"./mcp-page-BjLGtNPR.js";import{M as x}from"./mcp-permission-list-D7VAlIrM.js";import{a as c}from"./mcp-fixtures-ggOEzzmm.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./check-D47ZSDJv.js";import"./createLucideIcon-BO9sjSGA.js";import"./minus-CDlI3PPe.js";import"./auth-card-CSnHFyWj.js";import"./auth-hero-DH83tJS9.js";function m({clientName:t,permissions:a,oauthQuery:u,offerOperatorGrant:d}){return e.jsxs(g,{heading:`Allow ${t} to use your mail?`,intro:`${t} asks to:`,children:[e.jsx(x,{permissions:a}),e.jsxs("p",{className:"text-xs text-fg-muted",children:["You can disconnect it at any time from"," ",e.jsx("a",{href:"/apps",className:"underline underline-offset-2",children:"connected apps"}),"."]}),e.jsxs("form",{method:"post",className:"flex flex-col gap-2",children:[e.jsx("input",{type:"hidden",name:"oauth_query",value:u}),d&&e.jsx(y,{name:"operator",value:"true",label:"Grant operator access"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(p,{type:"submit",name:"accept",value:"false",variant:"secondary",className:"flex-1",children:"Deny"}),e.jsx(p,{type:"submit",name:"accept",value:"true",className:"flex-1",children:"Allow"})]})]})]})}m.__docgenInfo={description:"",methods:[],displayName:"McpConsentPage",props:{clientName:{required:!0,tsType:{name:"string"},description:""},permissions:{required:!0,tsType:{name:"unknown"},description:""},oauthQuery:{required:!0,tsType:{name:"string"},description:""},offerOperatorGrant:{required:!0,tsType:{name:"boolean"},description:""}}};const{expect:s,within:l}=__STORYBOOK_MODULE_TEST__,N={title:"Playground/Proposed/MCP/McpConsentPage",tags:["proposed"],component:m,parameters:{layout:"fullscreen"},args:{clientName:"Claude",oauthQuery:"client_id=abc&sig=xyz",offerOperatorGrant:!1}},n={args:{permissions:c},play:async({canvasElement:t})=>{const a=l(t);await s(a.getByText("Read your mail")).toBeVisible(),await s(a.getByText("Create and change folders and filters")).toBeVisible(),await s(a.getByRole("button",{name:"Allow"})).toBeVisible(),await s(a.getByRole("button",{name:"Deny"})).toBeVisible(),await s(a.queryByRole("checkbox",{name:"Grant operator access"})).not.toBeInTheDocument()}},r={args:{permissions:c,offerOperatorGrant:!0},play:async({canvasElement:t})=>{const a=l(t);await s(a.getByRole("checkbox",{name:"Grant operator access"})).not.toBeChecked()}},o={args:{permissions:c.slice(0,1)}},i={args:{clientName:"A very long assistant name registered by a desktop client",permissions:c}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    permissions: mcpPermissionsFixture
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Read your mail")).toBeVisible();
    await expect(canvas.getByText("Create and change folders and filters")).toBeVisible();
    await expect(canvas.getByRole("button", {
      name: "Allow"
    })).toBeVisible();
    await expect(canvas.getByRole("button", {
      name: "Deny"
    })).toBeVisible();
    await expect(canvas.queryByRole("checkbox", {
      name: "Grant operator access"
    })).not.toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    permissions: mcpPermissionsFixture,
    offerOperatorGrant: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", {
      name: "Grant operator access"
    })).not.toBeChecked();
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    permissions: mcpPermissionsFixture.slice(0, 1)
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    clientName: "A very long assistant name registered by a desktop client",
    permissions: mcpPermissionsFixture
  }
}`,...i.parameters?.docs?.source}}};const _=["WithoutOperatorGrant","WithOperatorGrant","ReadOnly","LongClientName"];export{i as LongClientName,o as ReadOnly,r as WithOperatorGrant,n as WithoutOperatorGrant,_ as __namedExportsOrder,N as default};
