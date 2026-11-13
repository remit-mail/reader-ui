import{j as r}from"./iframe-fYsS-Mr7.js";import{c as g}from"./cn-IyxL_b2c.js";import{B as t}from"./badge-CZgi-7XL.js";import{F as p}from"./folder-D4sEH3xY.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-B5J0h_XM.js";function k(e,n){switch(n.kind){case"healthy":return e;case"creating":return`${e} — creating`;case"renaming":return`${e} — renaming to ${n.target}`;case"deleting":return`${e} — deleting`;case"rename-failed":return`${e} — rename failed`;case"delete-failed":return`${e} — delete failed`}}function f(e){return e.kind==="healthy"||e.kind==="renaming"||e.kind==="rename-failed"||e.kind==="delete-failed"}function m({state:e}){switch(e.kind){case"healthy":return null;case"creating":return r.jsx(t,{tone:"neutral",children:"Creating…"});case"renaming":return r.jsx(t,{tone:"neutral",children:`Renaming to “${e.target}”…`});case"deleting":return r.jsx(t,{tone:"neutral",children:"Deleting…"});case"rename-failed":return r.jsx(t,{tone:"danger",children:"Rename failed"});case"delete-failed":return r.jsx(t,{tone:"danger",children:"Delete failed"})}}m.__docgenInfo={description:"",methods:[],displayName:"FolderSyncBadge",props:{state:{required:!0,tsType:{name:"union",raw:`| { kind: "healthy" }
| { kind: "creating" }
| { kind: "renaming"; target: string }
| { kind: "deleting" }
| { kind: "rename-failed"; target: string }
| { kind: "delete-failed" }`,elements:[{name:"signature",type:"object",raw:'{ kind: "healthy" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"healthy"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "creating" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"creating"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "renaming"; target: string }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"renaming"',required:!0}},{key:"target",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "deleting" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"deleting"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "rename-failed"; target: string }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"rename-failed"',required:!0}},{key:"target",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "delete-failed" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"delete-failed"',required:!0}}]}}]},description:""}}};const j={title:"Design System/Mail/FolderSyncState",tags:["proposed"],component:m,parameters:{layout:"centered"}};function a({label:e,state:n}){const u=f(n);return r.jsx("ul",{className:"w-[320px] list-none overflow-hidden rounded-lg border border-line bg-surface font-sans",children:r.jsxs("li",{"aria-label":k(e,n),className:g("flex min-h-11 items-center gap-2 px-3 py-2.5",!u&&"opacity-60"),children:[r.jsx(p,{className:"size-4 shrink-0 text-fg-subtle","aria-hidden":"true"}),r.jsx("span",{className:"min-w-0 flex-1 truncate text-sm text-fg",children:e}),r.jsx(m,{state:n})]})})}const i={name:"Healthy",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"healthy"}})},s={name:"Creating",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"creating"}})},l={name:"Renaming",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"renaming",target:"Q3 Receipts"}})},d={name:"Deleting",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"deleting"}})},o={name:"Rename failed",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"rename-failed",target:"Q3 Receipts"}})},c={name:"Delete failed",render:()=>r.jsx(a,{label:"Receipts",state:{kind:"delete-failed"}})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Healthy",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "healthy"
  }} />
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Creating",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "creating"
  }} />
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Renaming",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "renaming",
    target: "Q3 Receipts"
  }} />
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Deleting",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "deleting"
  }} />
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Rename failed",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "rename-failed",
    target: "Q3 Receipts"
  }} />
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Delete failed",
  render: () => <FolderRowPreview label="Receipts" state={{
    kind: "delete-failed"
  }} />
}`,...c.parameters?.docs?.source}}};const v=["Healthy","Creating","Renaming","Deleting","RenameFailed","DeleteFailed"];export{s as Creating,c as DeleteFailed,d as Deleting,i as Healthy,o as RenameFailed,l as Renaming,v as __namedExportsOrder,j as default};
