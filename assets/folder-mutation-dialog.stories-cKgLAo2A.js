import{j as n}from"./iframe-fYsS-Mr7.js";import{B as p}from"./button-S2h7_ODQ.js";import{D as R}from"./dialog-BR3DSJf0.js";import{L as D}from"./loader-circle-CNn9G_XI.js";import{T}from"./triangle-alert-C5hLOYcH.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";import"./createLucideIcon-B5J0h_XM.js";function b(t,e){return e.kind==="conflict"?"Already in progress":t==="rename"?e.kind==="waiting"?"Renaming folder":e.kind==="timed-out"?"Still renaming":"Rename failed":e.kind==="waiting"?"Deleting folder":e.kind==="timed-out"?"Still deleting":"Delete failed"}function j(t,e,g,i){return i.kind==="waiting"?t==="rename"?`Renaming “${e}” to “${g}” on the mail server…`:`Deleting “${e}” and everything in it from the mail server…`:i.kind==="timed-out"?t==="rename"?`“${e}” is still being renamed. It will finish on its own — you can close this and keep working. The folder shows “Renaming…” until it does.`:`“${e}” is still being deleted. It will finish on its own — you can close this. The folder shows “Deleting…” until it does.`:i.kind==="failed"?t==="rename"?`Couldn’t rename “${e}”. The mail server refused: ${i.serverMessage}. The folder is unchanged.`:`Couldn’t delete “${e}”. The mail server refused: ${i.serverMessage}. Nothing was deleted.`:t==="rename"?`Something else is already renaming or deleting “${e}”. Refresh to see where it got to.`:`Something else is already deleting or renaming “${e}”. Refresh to see where it got to.`}function h({open:t,intent:e,folderName:g,targetName:i,phase:r,onRetry:y,onRefresh:v,onClose:f}){if(!t)return null;const k=b(e,r),w=j(e,g,i,r),x=r.kind==="waiting"?n.jsx(D,{className:"size-4 shrink-0 animate-spin text-accent-2"}):r.kind==="failed"||r.kind==="conflict"?n.jsx(T,{className:"size-4 shrink-0 text-danger"}):null;return n.jsxs(R,{open:t,onClose:f,title:k,children:[n.jsxs("header",{className:"flex items-center gap-2 border-b border-line px-5 py-3",children:[x,n.jsx("span",{className:"flex-1 text-sm font-semibold text-fg",children:k})]}),n.jsx("div",{className:"space-y-3 px-5 py-4 text-sm text-fg-muted",children:n.jsx("p",{children:w})}),n.jsxs("footer",{className:"flex items-center justify-end gap-2 border-t border-line px-5 py-3",children:[r.kind==="failed"&&n.jsx(p,{variant:"secondary",size:"sm",onClick:y,children:"Try again"}),r.kind==="conflict"?n.jsx(p,{variant:"primary",size:"sm",onClick:v,children:"Refresh"}):n.jsx(p,{variant:"secondary",size:"sm",onClick:f,children:"Close"})]})]})}h.__docgenInfo={description:"",methods:[],displayName:"FolderMutationDialog",props:{open:{required:!0,tsType:{name:"boolean"},description:""},intent:{required:!0,tsType:{name:"union",raw:'"rename" | "delete"',elements:[{name:"literal",value:'"rename"'},{name:"literal",value:'"delete"'}]},description:""},folderName:{required:!0,tsType:{name:"string"},description:""},targetName:{required:!1,tsType:{name:"string"},description:""},phase:{required:!0,tsType:{name:"union",raw:`| { kind: "waiting" }
| { kind: "timed-out" }
| { kind: "failed"; serverMessage: string }
| { kind: "conflict" }`,elements:[{name:"signature",type:"object",raw:'{ kind: "waiting" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"waiting"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "timed-out" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"timed-out"',required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "failed"; serverMessage: string }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"failed"',required:!0}},{key:"serverMessage",value:{name:"string",required:!0}}]}},{name:"signature",type:"object",raw:'{ kind: "conflict" }',signature:{properties:[{key:"kind",value:{name:"literal",value:'"conflict"',required:!0}}]}}]},description:""},onRetry:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onRefresh:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const I={title:"Design System/Mail/FolderMutationDialog",tags:["proposed"],component:h,parameters:{layout:"fullscreen"},args:{open:!0,folderName:"Receipts",targetName:"Q3 Receipts",onRetry:()=>{},onRefresh:()=>{},onClose:()=>{}}},a={name:"Rename — waiting",args:{intent:"rename",phase:{kind:"waiting"}}},s={name:"Rename — timed out",args:{intent:"rename",phase:{kind:"timed-out"}}},o={name:"Rename — failed",args:{intent:"rename",phase:{kind:"failed",serverMessage:"Mailbox already exists at that path."}}},d={name:"Rename — conflict",args:{intent:"rename",phase:{kind:"conflict"}}},l={name:"Delete — waiting",args:{intent:"delete",phase:{kind:"waiting"}}},m={name:"Delete — timed out",args:{intent:"delete",phase:{kind:"timed-out"}}},c={name:"Delete — failed",args:{intent:"delete",phase:{kind:"failed",serverMessage:"The mailbox has folders inside it."}}},u={name:"Delete — conflict",args:{intent:"delete",phase:{kind:"conflict"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "Rename — waiting",
  args: {
    intent: "rename",
    phase: {
      kind: "waiting"
    }
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Rename — timed out",
  args: {
    intent: "rename",
    phase: {
      kind: "timed-out"
    }
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Rename — failed",
  args: {
    intent: "rename",
    phase: {
      kind: "failed",
      serverMessage: "Mailbox already exists at that path."
    }
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Rename — conflict",
  args: {
    intent: "rename",
    phase: {
      kind: "conflict"
    }
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Delete — waiting",
  args: {
    intent: "delete",
    phase: {
      kind: "waiting"
    }
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Delete — timed out",
  args: {
    intent: "delete",
    phase: {
      kind: "timed-out"
    }
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Delete — failed",
  args: {
    intent: "delete",
    phase: {
      kind: "failed",
      serverMessage: "The mailbox has folders inside it."
    }
  }
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Delete — conflict",
  args: {
    intent: "delete",
    phase: {
      kind: "conflict"
    }
  }
}`,...u.parameters?.docs?.source}}};const A=["RenameWaiting","RenameTimedOut","RenameFailed","RenameConflict","DeleteWaiting","DeleteTimedOut","DeleteFailed","DeleteConflict"];export{u as DeleteConflict,c as DeleteFailed,m as DeleteTimedOut,l as DeleteWaiting,d as RenameConflict,o as RenameFailed,s as RenameTimedOut,a as RenameWaiting,A as __namedExportsOrder,I as default};
