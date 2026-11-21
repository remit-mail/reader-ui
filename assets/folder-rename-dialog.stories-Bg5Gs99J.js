import{j as e,r as u}from"./iframe-DUn0T08W.js";import{F as i}from"./folder-rename-dialog-B8qscACS.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BgYe3szE.js";import"./cn-IyxL_b2c.js";import"./dialog-tX53YodE.js";import"./overlay-scope-DZGXhrsM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DrKfWaG3.js";import"./dialog-backdrop-BfHibv1P.js";import"./field-label-C_T9yPZP.js";import"./input-hGJM2SV8.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";const y={title:"Design System/Folders/FolderRenameDialog",component:i,parameters:{layout:"fullscreen"}};function a({initialName:m="Trash",pending:d,error:l}){const[c,p]=u.useState(m);return e.jsx("div",{className:"h-screen bg-canvas font-sans",children:e.jsx(i,{open:!0,folderLabel:"Trash",defaultLabel:"Deleted Messages",name:c,onNameChange:p,onSubmit:()=>{},onClose:()=>{},pending:d,error:l})})}const o={name:"Renaming an appointed folder",render:()=>e.jsx(a,{})},r={name:"Name cleared",render:()=>e.jsx(a,{initialName:""})},s={name:"Saving",render:()=>e.jsx(a,{pending:!0})},n={name:"The save failed",render:()=>e.jsx(a,{error:"Couldn't save that name. Please try again."})},t={name:"Phone",globals:{viewport:{value:"mobile"}},render:()=>e.jsx(a,{})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Renaming an appointed folder",
  render: () => <Live />
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "Name cleared",
  render: () => <Live initialName="" />
}`,...r.parameters?.docs?.source},description:{story:"Cleared: the folder goes back to what the mail server calls it.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Saving",
  render: () => <Live pending />
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "The save failed",
  render: () => <Live error="Couldn't save that name. Please try again." />
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Phone",
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  render: () => <Live />
}`,...t.parameters?.docs?.source}}};const R=["Default","Cleared","Saving","Failed","Phone"];export{r as Cleared,o as Default,n as Failed,t as Phone,s as Saving,R as __namedExportsOrder,y as default};
