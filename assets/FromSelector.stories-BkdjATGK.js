import{j as t}from"./iframe-fYsS-Mr7.js";import{aE as c,j as a}from"./react-query.gen-B1_4DilO.js";import{Q as n}from"./queryClient-ClMo2LzF.js";import{F as d,m as i,d as s}from"./fixtures-4baultqg.js";import"./preload-helper-PPVm8Dsz.js";const l=[s({accountId:"acc-1",email:"alice@example.com"}),s({accountId:"acc-2",email:"bob@example.com"})];function m(){const r=new n({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}});return r.setQueryData(a(),i(l)),r}const h={title:"Playground/Shipped/Mail/Compose/FromSelector",component:d,parameters:{layout:"padded"},decorators:[r=>t.jsx(c,{client:m(),children:t.jsx(r,{})})],args:{onSelect:()=>{}}},e={args:{selectedAccountId:"acc-2"}},o={args:{selectedAccountId:void 0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: "acc-2"
  }
}`,...e.parameters?.docs?.source},description:{story:"A resolved account, picked from the configured accounts.",...e.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: undefined
  }
}`,...o.parameters?.docs?.source},description:{story:`No account resolved — the source mailbox could not be matched to a
configured account. The select shows a disabled placeholder instead of
falling back to the first account's address.`,...o.parameters?.docs?.description}}};const v=["Resolved","Unresolved"];export{e as Resolved,o as Unresolved,v as __namedExportsOrder,h as default};
