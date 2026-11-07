import{j as e,r as u}from"./iframe-COEer--I.js";import{F as c}from"./folder-manager-DnzGOgoR.js";import{F as D}from"./folder-rename-dialog-aaPG7fn5.js";import"./preload-helper-PPVm8Dsz.js";import"./folder-manage-actions-B07572hB.js";import"./button-BKOwcnJQ.js";import"./cn-d2XQ1MEC.js";import"./pencil-B9QBJ-4U.js";import"./createLucideIcon-BvDEQKSa.js";import"./trash-2-CqeeiT_r.js";import"./folder-tree-picker-Sl9nSH2A.js";import"./folder-tree-ZE9Jqoy_.js";import"./folder-row-xrwiZYIb.js";import"./chevron-right-Bw-e3CYG.js";import"./check-C7HRKhEX.js";import"./folder-DoIwiYln.js";import"./circle-alert-BhIdpm6l.js";import"./input-D9nX-zZw.js";import"./new-folder-action-BY50Wbfi.js";import"./new-folder-form-DG2sUwOd.js";import"./field-label-Cih7j4th.js";import"./search-xmsQ3ROG.js";import"./dialog-B_m041Us.js";import"./overlay-scope-DP4ejR8d.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DbxXOF0z.js";import"./dialog-backdrop-agnXJdIA.js";import"./x-DcmHvAZb.js";const d=[{id:"mbx-inbox",label:"Inbox",path:"INBOX",deleteBlockedReason:"The inbox can't be deleted."},{id:"mbx-archive",label:"Archive",path:"Archive",deleteBlockedReason:"This folder is your Archive folder. Reassign that role before deleting it."},{id:"mbx-trash",label:"Trash",path:"Deleted Messages",deleteBlockedReason:"This folder is your Trash folder. Reassign that role before deleting it."},{id:"mbx-travel",label:"Travel",path:"Travel",deleteBlockedReason:"This folder has subfolders. Delete them first."},{id:"mbx-travel-flights",label:"Flights",path:"Travel/Flights"},{id:"mbx-travel-hotels",label:"Hotels",path:"Travel/Hotels"},{id:"mbx-travel-hotels-receipts",label:"Receipts",path:"Travel/Hotels/Receipts"},{id:"mbx-finance",label:"Finance",path:"Finance",deleteBlockedReason:"This folder has subfolders. Delete them first."},{id:"mbx-finance-invoices",label:"Invoices",path:"Finance/Invoices"},{id:"mbx-finance-tax",label:"Tax",path:"Finance/Tax"},{id:"mbx-family",label:"Family",path:"Family"},{id:"mbx-news",label:"Newsletters",path:"Newsletters"},{id:"mbx-news-tech",label:"Tech",path:"Newsletters/Tech"}],ee={title:"Playground/Shipped/Settings/Folders/FolderManager",component:c,parameters:{layout:"centered"}};function b({children:r,className:a="h-[520px] w-[420px] rounded-lg border border-line shadow-lg"}){return e.jsx("div",{className:`flex flex-col overflow-hidden bg-surface font-sans text-fg ${a}`,children:r})}let R=0;const g=(r,a)=>new Promise(p=>{R+=1,setTimeout(()=>p({id:`mbx-created-${R}`,label:r,path:a?`${a}/${r}`:r}),400)});function x({renaming:r=!1,className:a}){const[p,F]=u.useState(d),[v,h]=u.useState(r?d[2]:null),[T,w]=u.useState("Trash");return e.jsxs(e.Fragment,{children:[e.jsx(b,{className:a,children:e.jsx(c,{folders:p,onCreateFolder:(o,f)=>g(o,f).then(m=>(F(y=>[...y,m]),m)),onRename:o=>{h(o),w(o.label)},onDelete:o=>F(f=>f.filter(m=>m.id!==o.id)),labels:{treeAriaLabel:"All folders for alice@northwind.example"}})}),v&&e.jsx(D,{open:!0,folderLabel:v.label,defaultLabel:"Deleted Messages",name:T,onNameChange:w,onSubmit:()=>h(null),onClose:()=>h(null)})]})}const t={name:"Default (collapsed to top level)",render:()=>e.jsx(x,{})},s={name:"Renaming a folder",render:()=>e.jsx(x,{renaming:!0})},n={name:"A single folder",render:()=>e.jsx(b,{children:e.jsx(c,{folders:[d[0]],onCreateFolder:g,onRename:()=>{},onDelete:()=>{}})})},l={name:"A delete the mail server refused",render:()=>e.jsx(b,{children:e.jsx(c,{folders:[d[0],{id:"mbx-locked",label:"Locked",path:"Locked",failure:"The mail server refused the last change: Permission denied"},d[11]],onCreateFolder:g,onRename:()=>{},onDelete:()=>{}})})},i={name:"Phone",globals:{viewport:{value:"mobile"}},parameters:{layout:"fullscreen"},render:()=>e.jsx(x,{className:"h-screen w-full"})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Default (collapsed to top level)",
  render: () => <Manager />
}`,...t.parameters?.docs?.source},description:{story:`The account's folders as they really nest, closed to the top level. Every row
opens where you tap it and carries rename and delete; a folder the account
depends on keeps rename and states why it stays.`,...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Renaming a folder",
  render: () => <Manager renaming />
}`,...s.parameters?.docs?.source},description:{story:"Renaming a folder: the name is Remit's own, and clearing it restores the server's.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "A single folder",
  render: () => <Frame>
            <FolderManager folders={[folders[0] as ManagedFolder]} onCreateFolder={createFolder} onRename={() => {}} onDelete={() => {}} />
        </Frame>
}`,...n.parameters?.docs?.source},description:{story:"A first-run account with nothing but its inbox.",...n.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "A delete the mail server refused",
  render: () => <Frame>
            <FolderManager folders={[folders[0] as ManagedFolder, {
      id: "mbx-locked",
      label: "Locked",
      path: "Locked",
      failure: "The mail server refused the last change: Permission denied"
    }, folders[11] as ManagedFolder]} onCreateFolder={createFolder} onRename={() => {}} onDelete={() => {}} />
        </Frame>
}`,...l.parameters?.docs?.source},description:{story:"A folder the mail server refused to delete says why, on its own row.",...l.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Phone",
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  parameters: {
    layout: "fullscreen"
  },
  render: () => <Manager className="h-screen w-full" />
}`,...i.parameters?.docs?.source},description:{story:"The surface as it sits on a phone: full width, one branch open at a time.",...i.parameters?.docs?.description}}};const re=["Default","Renaming","JustTheInbox","RefusedDelete","Phone"];export{t as Default,n as JustTheInbox,i as Phone,l as RefusedDelete,s as Renaming,re as __namedExportsOrder,ee as default};
