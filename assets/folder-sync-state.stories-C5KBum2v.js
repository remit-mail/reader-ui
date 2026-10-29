import{j as e}from"./iframe-Dz9ev7_1.js";import{c as p}from"./cn-d2XQ1MEC.js";import{F as c,i as g,f as R}from"./folder-sync-state-DEgAfFLn.js";import{F as u}from"./folder-BFMlMtyd.js";import"./preload-helper-PPVm8Dsz.js";import"./badge-Dsqh0My3.js";import"./createLucideIcon-RYwrBmYZ.js";const j={title:"Design System/Mail/FolderSyncState",tags:["proposed"],component:c,parameters:{layout:"centered"}};function a({label:d,state:l}){const m=g(l);return e.jsx("ul",{className:"w-[320px] list-none overflow-hidden rounded-lg border border-line bg-surface font-sans",children:e.jsxs("li",{"aria-label":R(d,l),className:p("flex min-h-11 items-center gap-2 px-3 py-2.5",!m&&"opacity-60"),children:[e.jsx(u,{className:"size-4 shrink-0 text-fg-subtle","aria-hidden":"true"}),e.jsx("span",{className:"min-w-0 flex-1 truncate text-sm text-fg",children:d}),e.jsx(c,{state:l})]})})}const r={name:"Healthy",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"healthy"}})},n={name:"Creating",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"creating"}})},t={name:"Renaming",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"renaming",target:"Q3 Receipts"}})},s={name:"Deleting",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"deleting"}})},i={name:"Rename failed",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"rename-failed",target:"Q3 Receipts"}})},o={name:"Delete failed",render:()=>e.jsx(a,{label:"Receipts",state:{kind:"delete-failed"}})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Healthy",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "healthy"
  }} />
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Creating",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "creating"
  }} />
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Renaming",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "renaming",
    target: "Q3 Receipts"
  }} />
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Deleting",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "deleting"
  }} />
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Rename failed",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "rename-failed",
    target: "Q3 Receipts"
  }} />
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Delete failed",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "delete-failed"
  }} />
}`,...o.parameters?.docs?.source}}};const k=["Healthy","Creating","Renaming","Deleting","RenameFailed","DeleteFailed"];export{n as Creating,o as DeleteFailed,s as Deleting,r as Healthy,i as RenameFailed,t as Renaming,k as __namedExportsOrder,j as default};
