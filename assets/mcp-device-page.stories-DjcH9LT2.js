import{j as e}from"./iframe-Dz9ev7_1.js";import{B as d,a as l}from"./button-CLbVgqC1.js";import{I as g}from"./input-Dno_Kr9T.js";import{M as v}from"./mcp-error-notice-C7j9-U2M.js";import{M as p}from"./mcp-page-C_1bWVto.js";import{m as x}from"./mcp-fixtures-ggOEzzmm.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./banner-CcGBhVUA.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./auth-card-CrNpbzlu.js";import"./auth-hero-BS6SdZ6q.js";function y({userCode:r,error:n}){return e.jsxs(p,{heading:"Connect a device",intro:"Enter the code your terminal shows.",children:[n&&e.jsx(v,{error:n}),e.jsxs("form",{method:"get",className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-1 text-sm",children:[e.jsx("label",{htmlFor:"mcp-user-code",className:"text-fg-muted",children:"Code"}),e.jsx(g,{id:"mcp-user-code",name:"user_code",defaultValue:r,autoComplete:"one-time-code",autoCapitalize:"characters",spellCheck:!1,placeholder:"ABCD-EFGH",className:"font-mono uppercase tracking-widest",required:!0})]}),e.jsx(d,{type:"submit",children:"Continue"})]})]})}function f({userCode:r}){return e.jsxs(p,{heading:"Approve this device?",intro:"Only approve if your terminal shows the same code.",children:[e.jsx("p",{className:"rounded-md border border-line bg-surface-sunken py-3 text-center font-mono text-2xl tracking-widest text-fg",children:r}),e.jsx("p",{className:"text-sm text-fg-muted",children:"Approving lets the device use your mail until you disconnect it."}),e.jsxs("form",{method:"post",className:"flex gap-2",children:[e.jsx("input",{type:"hidden",name:"user_code",value:r}),e.jsx(d,{type:"submit",name:"action",value:"deny",variant:"secondary",className:"flex-1",children:"Deny"}),e.jsx(d,{type:"submit",name:"action",value:"approve",className:"flex-1",children:"Approve"})]})]})}function h({approved:r}){return e.jsx(p,{heading:r?"Device connected":"Device denied",intro:r?"Go back to your terminal; it signs in by itself.":"The device gets no access. You can close this page.",children:e.jsx(l,{href:"/apps",variant:"secondary",children:"Manage connected apps"})})}function u({state:r}){return r.kind==="enter"?e.jsx(y,{userCode:r.userCode,error:r.error}):r.kind==="confirm"?e.jsx(f,{userCode:r.userCode}):e.jsx(h,{approved:r.kind==="approved"})}u.__docgenInfo={description:"",methods:[],displayName:"McpDevicePage",props:{state:{required:!0,tsType:{name:"union",raw:`| { kind: "enter"; userCode: string; error?: McpPageError }
| { kind: "confirm"; userCode: string }
| { kind: "approved" }
| { kind: "denied" }`,elements:[{name:"signature",type:"object",raw:'{ kind: "enter"; userCode: string; error?: McpPageError }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"enter"',required:!0}},{key:"userCode",value:{name:"string",required:!0}},{key:"error",value:{name:"McpPageError",required:!1}}]}},{name:"signature",type:"object",raw:'{ kind: "confirm"; userCode: string }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"confirm"',required:!0}},{key:"userCode",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "approved" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"approved"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "denied" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"denied"',required:!0}}]}}]},description:""}}};const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,N={title:"Playground/Proposed/MCP/McpDevicePage",tags:["proposed"],component:u,parameters:{layout:"fullscreen"}},a={args:{state:{kind:"enter",userCode:""}}},o={args:{state:{kind:"enter",userCode:"WXYZ-1234",error:{message:"That code is not valid or has expired.",fix:"Run remit mcp login again and enter the new code.",reportUrl:x.reportUrl}}},play:async({canvasElement:r})=>{const n=m(r);await t(n.getByRole("alert")).toHaveTextContent("Run remit mcp login again"),await t(n.getByLabelText("Code")).toHaveValue("WXYZ-1234")}},s={args:{state:{kind:"confirm",userCode:"ABCD-EFGH"}},play:async({canvasElement:r})=>{const n=m(r);await t(n.getByText("ABCD-EFGH")).toBeVisible(),await t(n.getByRole("button",{name:"Approve"})).toBeVisible(),await t(n.getByRole("button",{name:"Deny"})).toBeVisible()}},i={args:{state:{kind:"approved"}}},c={args:{state:{kind:"denied"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      kind: "enter",
      userCode: ""
    }
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      kind: "enter",
      userCode: "WXYZ-1234",
      error: {
        message: "That code is not valid or has expired.",
        fix: "Run remit mcp login again and enter the new code.",
        reportUrl: mcpErrorFixture.reportUrl
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Run remit mcp login again");
    await expect(canvas.getByLabelText("Code")).toHaveValue("WXYZ-1234");
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      kind: "confirm",
      userCode: "ABCD-EFGH"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ABCD-EFGH")).toBeVisible();
    await expect(canvas.getByRole("button", {
      name: "Approve"
    })).toBeVisible();
    await expect(canvas.getByRole("button", {
      name: "Deny"
    })).toBeVisible();
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      kind: "approved"
    }
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      kind: "denied"
    }
  }
}`,...c.parameters?.docs?.source}}};const P=["EnterCode","UnknownCode","Confirm","Approved","Denied"];export{i as Approved,s as Confirm,c as Denied,a as EnterCode,o as UnknownCode,P as __namedExportsOrder,N as default};
