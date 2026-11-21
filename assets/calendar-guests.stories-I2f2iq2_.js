import{j as s,r as u}from"./iframe-DUn0T08W.js";import{b as i,p as n,c as d}from"./calendar-guests-e_M6kWZe.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./calendar-event-popup-Cc9BuJlo.js";import"./calendar-color-CqvBY603.js";import"./pencil-BsYDlpUX.js";import"./createLucideIcon-BO9sjSGA.js";import"./trash-TQGHNCuP.js";import"./x-D26GNrGg.js";import"./map-pin-DaFgrBXH.js";import"./calendar-days-EGloaown.js";import"./check-D47ZSDJv.js";import"./circle-question-mark-krPvE_RD.js";const L={title:"Design System/Calendar/Guests field",component:i,parameters:{layout:"padded"},decorators:[e=>s.jsx("div",{className:"w-[24rem]",children:s.jsx(e,{})})],args:{value:[],onChange:()=>{},suggestions:[{email:"guest@example.com",name:"Guest name"}],onQuery:()=>{}}},m=e=>{const[p,c]=u.useState(e?.value??[]);return s.jsx(i,{value:p,onChange:c,suggestions:e?.suggestions??[],onQuery:()=>{}})},r={render:e=>s.jsx(m,{...e})},a={args:{value:[n("sender@example.com"),n("Guest name <guest@example.com>")]},render:e=>s.jsx(m,{...e})},t={args:{value:[n("sender@example.com"),n("not-an-email")]},render:e=>s.jsx(m,{...e})},o={render:()=>s.jsx(d,{missed:["sender@example.com"],onRetry:()=>{},reportHref:"#",onDismiss:()=>{}})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => <Live {...args} />
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: [parseGuest("sender@example.com"), parseGuest("Guest name <guest@example.com>")]
  },
  render: args => <Live {...args} />
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: [parseGuest("sender@example.com"), parseGuest("not-an-email")]
  },
  render: args => <Live {...args} />
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarInvitationsNotSent missed={["sender@example.com"]} onRetry={() => {}} reportHref="#" onDismiss={() => {}} />
}`,...o.parameters?.docs?.source}}};const D=["Empty","WithGuests","InvalidGuest","InvitationsNotSent"];export{r as Empty,t as InvalidGuest,o as InvitationsNotSent,a as WithGuests,D as __namedExportsOrder,L as default};
