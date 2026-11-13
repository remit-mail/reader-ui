import{j as p}from"./iframe-fYsS-Mr7.js";import{F as g}from"./FiltersList-Cpq_3Va8.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-CZgi-7XL.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./label-chip-h6m_g3T6.js";import"./label-color-CbbIIEbk.js";import"./organize-model-kmpTaIUf.js";import"./trash-CtpmnHuk.js";import"./createLucideIcon-B5J0h_XM.js";const f=Date.parse("2026-09-25T12:00:00Z"),R={title:"Playground/Shipped/Settings/Filters/FiltersList",component:g,parameters:{layout:"padded"},decorators:[e=>p.jsx("div",{className:"mx-auto max-w-md",children:p.jsx(e,{})})],args:{mailboxName:e=>e==="mbx-invoices"?"Invoices":void 0,labelById:new Map,onEdit:()=>{},onDelete:()=>{},onToggle:()=>{},onRunNow:()=>{},now:f}},r=e=>({filterId:"flt-1",accountConfigId:"acc-1",name:"Invoices",scope:"Standing",state:"Active",disabledReason:"None",ruleChangedAt:0,actionChangedAt:0,matchOperator:"And",literalClauses:[{field:"From",value:"billing@example.com"}],actionLabelId:"None",actionMailboxId:"mbx-invoices",createdAt:0,updatedAt:0,priority:0,stop:!1,rule:{version:1,test:{test:"allof",tests:[]}},...e}),a=(e,u={})=>[r({state:"Disabled",disabledReason:e,...u})],s={args:{filters:[r({})]}},t={args:{filters:a("UserDisabled")}},n={args:{filters:a("AwaitingFolder",{actionMailboxId:"None"})}},o={args:{filters:a("FolderCreateFailed",{actionMailboxId:"None"})}},i={args:{filters:a("FolderMissing",{actionMailboxId:"mbx-deleted"})}},d={args:{filters:a("UserDisabled"),togglingFilterId:"flt-1"}},l={args:{filters:[r({})],runFilterId:"flt-1",runStatus:{kind:"running"}}},c={args:{filters:[r({})],runFilterId:"flt-1",runStatus:{kind:"done",matched:3,applied:3}}},m={args:{filters:[r({})],runFilterId:"flt-1",runStatus:{kind:"done",matched:0,applied:0}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    filters: [makeFilter({})]
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    filters: disabled("UserDisabled")
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    filters: disabled("AwaitingFolder", {
      actionMailboxId: "None"
    })
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    filters: disabled("FolderCreateFailed", {
      actionMailboxId: "None"
    })
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    filters: disabled("FolderMissing", {
      actionMailboxId: "mbx-deleted"
    })
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    filters: disabled("UserDisabled"),
    togglingFilterId: "flt-1"
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    filters: [makeFilter({})],
    runFilterId: "flt-1",
    runStatus: {
      kind: "running"
    }
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    filters: [makeFilter({})],
    runFilterId: "flt-1",
    runStatus: {
      kind: "done",
      matched: 3,
      applied: 3
    }
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    filters: [makeFilter({})],
    runFilterId: "flt-1",
    runStatus: {
      kind: "done",
      matched: 0,
      applied: 0
    }
  }
}`,...m.parameters?.docs?.source}}};const k=["Active","TurnedOffByUser","AwaitingFolder","FolderCreateFailed","FolderMissing","Toggling","RunNowRunning","RunNowDone","RunNowMatchedNothing"];export{s as Active,n as AwaitingFolder,o as FolderCreateFailed,i as FolderMissing,c as RunNowDone,m as RunNowMatchedNothing,l as RunNowRunning,d as Toggling,t as TurnedOffByUser,k as __namedExportsOrder,R as default};
