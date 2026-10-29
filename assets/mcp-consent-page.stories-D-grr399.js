import{j as e}from"./iframe-Dz9ev7_1.js";import{B as c}from"./button-CLbVgqC1.js";import{M as l}from"./mcp-page-C_1bWVto.js";import{M as d}from"./mcp-permission-list-Cd8mnOOy.js";import{a as o}from"./mcp-fixtures-ggOEzzmm.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./auth-card-CrNpbzlu.js";import"./auth-hero-BS6SdZ6q.js";import"./check-D-jt1aUx.js";import"./createLucideIcon-RYwrBmYZ.js";function m({clientName:a,permissions:s,oauthQuery:p}){return e.jsxs(l,{heading:`Allow ${a} to use your mail?`,intro:`${a} asks to:`,children:[e.jsx(d,{permissions:s}),e.jsxs("p",{className:"text-xs text-fg-muted",children:["You can disconnect it at any time from"," ",e.jsx("a",{href:"/apps",className:"underline underline-offset-2",children:"connected apps"}),"."]}),e.jsxs("form",{method:"post",className:"flex gap-2",children:[e.jsx("input",{type:"hidden",name:"oauth_query",value:p}),e.jsx(c,{type:"submit",name:"accept",value:"false",variant:"secondary",className:"flex-1",children:"Deny"}),e.jsx(c,{type:"submit",name:"accept",value:"true",className:"flex-1",children:"Allow"})]})]})}m.__docgenInfo={description:"",methods:[],displayName:"McpConsentPage",props:{clientName:{required:!0,tsType:{name:"string"},description:""},permissions:{required:!0,tsType:{name:"unknown"},description:""},oauthQuery:{required:!0,tsType:{name:"string"},description:""}}};const{expect:t,within:u}=__STORYBOOK_MODULE_TEST__,_={title:"Playground/Proposed/MCP/McpConsentPage",tags:["proposed"],component:m,parameters:{layout:"fullscreen"},args:{clientName:"Claude",oauthQuery:"client_id=abc&sig=xyz"}},n={args:{permissions:o},play:async({canvasElement:a})=>{const s=u(a);await t(s.getByText("Read your mail")).toBeVisible(),await t(s.getByText("Create and change folders and filters")).toBeVisible(),await t(s.getByRole("button",{name:"Allow"})).toBeVisible(),await t(s.getByRole("button",{name:"Deny"})).toBeVisible()}},r={args:{permissions:o.slice(0,1)}},i={args:{clientName:"A very long assistant name registered by a desktop client",permissions:o}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    permissions: mcpPermissionsFixture.slice(0, 1)
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    clientName: "A very long assistant name registered by a desktop client",
    permissions: mcpPermissionsFixture
  }
}`,...i.parameters?.docs?.source}}};const N=["ReadAndRules","ReadOnly","LongClientName"];export{i as LongClientName,n as ReadAndRules,r as ReadOnly,N as __namedExportsOrder,_ as default};
