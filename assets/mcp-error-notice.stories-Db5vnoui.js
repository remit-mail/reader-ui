import{j as o}from"./iframe-4Y_dM_UU.js";import{M as s}from"./mcp-error-notice-C4wR5qhU.js";import{m as e}from"./mcp-fixtures-zRVi48z5.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";const{expect:n,within:i}=__STORYBOOK_MODULE_TEST__,y={title:"Playground/Proposed/MCP/McpErrorNotice",tags:["proposed"],component:s,parameters:{layout:"padded"},decorators:[t=>o.jsx("div",{className:"mx-auto max-w-sm",children:o.jsx(t,{})})]},r={args:{error:e},play:async({canvasElement:t})=>{const a=i(t);await n(a.getByRole("alert")).toHaveTextContent(e.fix),await n(a.getByRole("link",{name:"Report an issue"})).toHaveAttribute("href",e.reportUrl)}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    error: mcpErrorFixture
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(mcpErrorFixture.fix);
    await expect(canvas.getByRole("link", {
      name: "Report an issue"
    })).toHaveAttribute("href", mcpErrorFixture.reportUrl);
  }
}`,...r.parameters?.docs?.source}}};const g=["StatesTheFix"];export{r as StatesTheFix,g as __namedExportsOrder,y as default};
