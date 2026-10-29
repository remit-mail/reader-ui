import{j as o}from"./iframe-Dz9ev7_1.js";import{M as s}from"./mcp-error-notice-C7j9-U2M.js";import{m as e}from"./mcp-fixtures-ggOEzzmm.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-CcGBhVUA.js";import"./cn-d2XQ1MEC.js";import"./button-CLbVgqC1.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";const{expect:n,within:i}=__STORYBOOK_MODULE_TEST__,y={title:"Playground/Proposed/MCP/McpErrorNotice",tags:["proposed"],component:s,parameters:{layout:"padded"},decorators:[t=>o.jsx("div",{className:"mx-auto max-w-sm",children:o.jsx(t,{})})]},r={args:{error:e},play:async({canvasElement:t})=>{const a=i(t);await n(a.getByRole("alert")).toHaveTextContent(e.fix),await n(a.getByRole("link",{name:"Report an issue"})).toHaveAttribute("href",e.reportUrl)}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
