import{C as s}from"./compose-fab-CJrdodJo.js";import"./iframe-Dz9ev7_1.js";import"./preload-helper-PPVm8Dsz.js";import"./pencil-BNdFrw8L.js";import"./createLucideIcon-RYwrBmYZ.js";const{expect:o,fn:i,userEvent:m,within:r}=__STORYBOOK_MODULE_TEST__,w={title:"Design System/Mail/ComposeFab",component:s,args:{onCompose:i()},globals:{viewport:{value:"mobile",isRotated:!1}}},e={play:async({args:a,canvasElement:n})=>{const t=r(n).getByRole("button",{name:"Compose new message"});await o(t).toBeVisible(),await m.click(t),await o(a.onCompose).toHaveBeenCalledOnce()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Compose new message"
    });
    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onCompose).toHaveBeenCalledOnce();
  }
}`,...e.parameters?.docs?.source}}};const g=["Default"];export{e as Default,g as __namedExportsOrder,w as default};
