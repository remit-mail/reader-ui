import{j as t}from"./iframe-4Y_dM_UU.js";import{aJ as c,j as a}from"./react-query.gen-C52jVGEN.js";import{Q as n}from"./queryClient-B-_Q6x1O.js";import{m as d,d as s}from"./fixtures-qaJRvpjc.js";import{F as i}from"./FromSelector-BTjfdOFo.js";import"./preload-helper-PPVm8Dsz.js";import"./client.gen-84yaupxO.js";const m=[s({accountId:"acc-1",email:"alice@example.com"}),s({accountId:"acc-2",email:"bob@example.com"})];function l(){const r=new n({defaultOptions:{queries:{retry:!1},mutations:{retry:!1}}});return r.setQueryData(a(),d(m)),r}const x={title:"Playground/Shipped/Mail/Compose/FromSelector",component:i,parameters:{layout:"padded"},decorators:[r=>t.jsx(c,{client:l(),children:t.jsx(r,{})})],args:{onSelect:()=>{}}},e={args:{selectedAccountId:"acc-2"}},o={args:{selectedAccountId:void 0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: "acc-2"
  }
}`,...e.parameters?.docs?.source},description:{story:"A resolved account, picked from the configured accounts.",...e.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedAccountId: undefined
  }
}`,...o.parameters?.docs?.source},description:{story:`No account resolved — the source mailbox could not be matched to a
configured account. The select shows a disabled placeholder instead of
falling back to the first account's address.`,...o.parameters?.docs?.description}}};const C=["Resolved","Unresolved"];export{e as Resolved,o as Unresolved,C as __namedExportsOrder,x as default};
