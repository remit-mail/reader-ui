import{m as c}from"./mcp-fixtures-ggOEzzmm.js";import{j as e}from"./iframe-Dz9ev7_1.js";import{B as d}from"./button-CLbVgqC1.js";import{I as i}from"./input-Dno_Kr9T.js";import{M as g}from"./mcp-error-notice-C7j9-U2M.js";import{M as u}from"./mcp-page-C_1bWVto.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./banner-CcGBhVUA.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./auth-card-CrNpbzlu.js";import"./auth-hero-BS6SdZ6q.js";function p({hiddenFields:o,email:r,error:s}){return e.jsxs(u,{heading:"Sign in to remit",intro:"Use the email and password you sign in to remit with.",children:[s&&e.jsx(g,{error:s}),e.jsxs("form",{method:"post",className:"flex flex-col gap-4",children:[Object.entries(o).map(([n,l])=>e.jsx("input",{type:"hidden",name:n,value:l},n)),e.jsxs("div",{className:"flex flex-col gap-1 text-sm",children:[e.jsx("label",{htmlFor:"mcp-email",className:"text-fg-muted",children:"Email"}),e.jsx(i,{id:"mcp-email",name:"email",type:"email",autoComplete:"username",defaultValue:r,placeholder:"you@example.com",required:!0})]}),e.jsxs("div",{className:"flex flex-col gap-1 text-sm",children:[e.jsx("label",{htmlFor:"mcp-password",className:"text-fg-muted",children:"Password"}),e.jsx(i,{id:"mcp-password",name:"password",type:"password",autoComplete:"current-password",placeholder:"Your password",required:!0})]}),e.jsx(d,{type:"submit",children:"Sign in"})]})]})}p.__docgenInfo={description:"",methods:[],displayName:"McpLoginPage",props:{hiddenFields:{required:!0,tsType:{name:"Readonly",elements:[{name:"Record",elements:[{name:"string"},{name:"string"}],raw:"Record<string, string>"}],raw:"Readonly<Record<string, string>>"},description:""},email:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"McpPageError"},description:""}}};const{expect:m,within:x}=__STORYBOOK_MODULE_TEST__,B={title:"Playground/Proposed/MCP/McpLoginPage",tags:["proposed"],component:p,parameters:{layout:"fullscreen"},args:{hiddenFields:{oauth_query:"client_id=abc&sig=xyz"}}},a={},t={args:{email:"owner@example.com",error:{message:"Wrong email or password.",fix:"Check both and try again. It is the password you sign in to remit with.",reportUrl:c.reportUrl}},play:async({canvasElement:o})=>{const r=x(o);await m(r.getByRole("alert")).toHaveTextContent("Wrong email or password."),await m(r.getByLabelText("Email")).toHaveValue("owner@example.com")}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    email: "owner@example.com",
    error: {
      message: "Wrong email or password.",
      fix: "Check both and try again. It is the password you sign in to remit with.",
      reportUrl: mcpErrorFixture.reportUrl
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Wrong email or password.");
    await expect(canvas.getByLabelText("Email")).toHaveValue("owner@example.com");
  }
}`,...t.parameters?.docs?.source}}};const C=["Empty","WrongPassword"];export{a as Empty,t as WrongPassword,C as __namedExportsOrder,B as default};
