import{j as s}from"./iframe-Dz9ev7_1.js";import{C as t}from"./compose-body-skeleton-D2GlgCjj.js";import"./preload-helper-PPVm8Dsz.js";const{expect:a,within:n}=__STORYBOOK_MODULE_TEST__,m={title:"Design System/Compose/ComposeBodySkeleton",component:t,decorators:[o=>s.jsx("div",{className:"h-80 w-[560px] border border-line bg-canvas",children:s.jsx(o,{})})]},e={play:async({canvasElement:o})=>{await a(n(o).getByTestId("compose-body-skeleton")).toBeVisible()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByTestId("compose-body-skeleton")).toBeVisible();
  }
}`,...e.parameters?.docs?.source}}};const p=["Loading"];export{e as Loading,p as __namedExportsOrder,m as default};
