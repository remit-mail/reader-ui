import{r as m,j as y}from"./iframe-Dz9ev7_1.js";import{R as I}from"./role-appointment-prompt-DCYiq-Jj.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-CcGBhVUA.js";import"./cn-d2XQ1MEC.js";import"./button-CLbVgqC1.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./dialog-CClY1ZXZ.js";import"./overlay-scope-D24dfPkM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-WDgdsyy8.js";import"./dialog-backdrop-hoQFjglb.js";import"./folder-tree-picker-Xci-OtZE.js";import"./folder-tree-ZE9Jqoy_.js";import"./folder-row-BVjFYu7r.js";import"./chevron-right-BgpxkwQ0.js";import"./check-D-jt1aUx.js";import"./folder-BFMlMtyd.js";import"./circle-alert-CcoNAO8C.js";import"./input-Dno_Kr9T.js";import"./new-folder-action-CK5s8xfF.js";import"./new-folder-form-DbboqlK-.js";import"./field-label-AfH6c15u.js";import"./search-qhk-8fnj.js";import"./loader-circle-C6jTFX4E.js";import"./triangle-alert-BzExaAbk.js";const x=[{id:"mb-inbox",label:"INBOX",path:"INBOX",messageCount:4821},{id:"mb-archive",label:"Archive",path:"Archive",messageCount:19243},{id:"mb-deleted",label:"Deleted Messages",path:"Deleted Messages",messageCount:512},{id:"mb-prullenbak",label:"Prullenbak",path:"Prullenbak",messageCount:0},{id:"mb-spam",label:"Spam",path:"Spam",messageCount:88}];function w({initialSelectedId:u,phaseCycle:e,...p}){const[h,g]=m.useState(u),[f,b]=m.useState(0);return m.useEffect(()=>{if(!e||e.length<2)return;const k=setInterval(()=>b(S=>(S+1)%e.length),2200);return()=>clearInterval(k)},[e]),y.jsx(I,{...p,open:!0,folders:x,delimiter:"/",phase:e?.[f]??p.phase,selectedId:h,onSelect:g,onConfirm:()=>{},onCancel:()=>{}})}const Y={title:"Design System/Mail/RoleAppointmentPrompt",component:w},l={kind:"choosing"},n={name:"none",args:{reason:"none",action:{kind:"delete",count:12},phase:l,accountEmail:"hostnet-user@example.com"}},t={name:"stale",args:{reason:"stale",action:{kind:"delete",count:12},staleFolderLabel:"Prullenbak",phase:l}},a={name:"unconfirmed",args:{reason:"unconfirmed",action:{kind:"emptyTrash"},trashFolderLabel:"Deleted Messages",initialSelectedId:"mb-deleted",phase:l}},s={name:"unconfirmed — delete in place",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"Deleted Messages",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-deleted",phase:l}},r={name:"unconfirmed — delete into another folder",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"Deleted Messages",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-prullenbak",phase:l}},o={name:"unconfirmed — delete in place, acting",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"Deleted Messages",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-deleted",phase:{kind:"acting"}}},i={name:"pending",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appointing"},phaseCycle:[{kind:"appointing"},{kind:"acting"}]}},d={name:"appoint-failed",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appoint-failed",cause:"generic"}}},c={name:"appoint-refused-pending-mailbox",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appoint-failed",cause:"mailbox-pending"}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "none",
  args: {
    reason: "none",
    action: {
      kind: "delete",
      count: 12
    },
    phase: choosing,
    accountEmail: "hostnet-user@example.com"
  }
}`,...n.parameters?.docs?.source},description:{story:"A delete refused because the account has no Trash at all. A first choice.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "stale",
  args: {
    reason: "stale",
    action: {
      kind: "delete",
      count: 12
    },
    staleFolderLabel: "Prullenbak",
    phase: choosing
  }
}`,...t.parameters?.docs?.source},description:{story:`A delete refused because the folder the user chose is gone. The description
names it, so a rename (pick the renamed one) is told from a deletion.`,...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "emptyTrash"
    },
    trashFolderLabel: "Deleted Messages",
    initialSelectedId: "mb-deleted",
    phase: choosing
  }
}`,...a.parameters?.docs?.source},description:{story:`Empty Trash on a folder reader only matched by name. The guess starts
selected, so the common case is one tap, and the confirm is the danger
variant — this is the only framing whose confirm expunges.`,...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete in place",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "Deleted Messages",
    guessedMailboxId: "mb-deleted",
    initialSelectedId: "mb-deleted",
    phase: choosing
  }
}`,...s.parameters?.docs?.source},description:{story:`A delete refused because the rows are already inside the folder reader only
matched by name: confirming it expunges them where they sit, so the copy says
"delete", never "empty", and the confirm is the danger variant.`,...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete into another folder",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "Deleted Messages",
    guessedMailboxId: "mb-deleted",
    initialSelectedId: "mb-prullenbak",
    phase: choosing
  }
}`,...r.parameters?.docs?.source},description:{story:`The same refusal answered with a different folder. The rows are not in that
one, so the delete moves them there and the confirm is not destructive.`,...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete in place, acting",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "Deleted Messages",
    guessedMailboxId: "mb-deleted",
    initialSelectedId: "mb-deleted",
    phase: {
      kind: "acting"
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`That confirm in flight. It says the rows are being erased where they sit —
"moving them to Deleted Messages" would narrate the opposite.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "pending",
  args: {
    reason: "none",
    action: {
      kind: "delete",
      count: 12
    },
    initialSelectedId: "mb-prullenbak",
    phase: {
      kind: "appointing"
    },
    phaseCycle: [{
      kind: "appointing"
    }, {
      kind: "acting"
    }]
  }
}`,...i.parameters?.docs?.source},description:{story:`Two writes behind one press, and the story steps through both: the
appointment, then the delete it unblocks. Neither has a way out — the write
has left, and cancelling a half-applied ceremony is worse than waiting.`,...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "appoint-failed",
  args: {
    reason: "none",
    action: {
      kind: "delete",
      count: 12
    },
    initialSelectedId: "mb-prullenbak",
    phase: {
      kind: "appoint-failed",
      cause: "generic"
    }
  }
}`,...d.parameters?.docs?.source},description:{story:"The write failed. The picker stays, the selection stays, the confirm stays pressable.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "appoint-refused-pending-mailbox",
  args: {
    reason: "none",
    action: {
      kind: "delete",
      count: 12
    },
    initialSelectedId: "mb-prullenbak",
    phase: {
      kind: "appoint-failed",
      cause: "mailbox-pending"
    }
  }
}`,...c.parameters?.docs?.source},description:{story:`The folder was made in the picker and the mail server has not confirmed it
yet. A different sentence with a different remedy from a network failure —
waiting fixes this one, retrying does not.`,...c.parameters?.docs?.description}}};const Z=["None","Stale","Unconfirmed","UnconfirmedDelete","UnconfirmedDeleteElsewhere","UnconfirmedDeleteInFlight","Pending","AppointFailed","AppointRefusedPendingMailbox"];export{d as AppointFailed,c as AppointRefusedPendingMailbox,n as None,i as Pending,t as Stale,a as Unconfirmed,s as UnconfirmedDelete,r as UnconfirmedDeleteElsewhere,o as UnconfirmedDeleteInFlight,Z as __namedExportsOrder,Y as default};
