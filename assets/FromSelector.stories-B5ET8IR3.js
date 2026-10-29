import{j as t}from"./iframe-Dz9ev7_1.js";import{an as c,j as a}from"./react-query.gen-CqIaQaIp.js";import{Q as n}from"./queryClient-8T75I5CD.js";import{F as d,m as i,c as s}from"./fixtures-BeHZHkBX.js";import"./preload-helper-PPVm8Dsz.js";import"./client.gen-D_seGqM5.js";const l=[s({accountId:"acc-1",email:"alice@example.com"}),s({accountId:"acc-2",email:"bob@example.com"})];function m(){const r=new n({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}});return r.setQueryData(a(),i(l)),r}const v={title:"Playground/Shipped/Mail/Compose/FromSelector",component:d,parameters:{layout:"padded"},decorators:[r=>t.jsx(c,{client:m(),children:t.jsx(r,{})})],args:{onSelect:()=>{}}},e={args:{selectedAccountId:"acc-2"}},o={args:{selectedAccountId:void 0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: "acc-2"
  }
}`,...e.parameters?.docs?.source},description:{story:"A resolved account, picked from the configured accounts.",...e.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: undefined
  }
}`,...o.parameters?.docs?.source},description:{story:`No account resolved — the source mailbox could not be matched to a
configured account. The select shows a disabled placeholder instead of
falling back to the first account's address.`,...o.parameters?.docs?.description}}};const x=["Resolved","Unresolved"];export{e as Resolved,o as Unresolved,x as __namedExportsOrder,v as default};
