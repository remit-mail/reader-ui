import{r as m,j as y}from"./iframe-4Y_dM_UU.js";import{R as S}from"./role-appointment-prompt-BGHV86yn.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./dialog-Bvc7C5e_.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DGD_JTED.js";import"./dialog-backdrop-BCWOD_77.js";import"./folder-tree-picker-DcJnzJvt.js";import"./folder-tree-lS__Eg2V.js";import"./folder-row-DwoEVzVA.js";import"./chevron-right-DdPAKdYb.js";import"./check-DSdQDF54.js";import"./folder-C3sBa3fi.js";import"./circle-alert-Z6J3DHRJ.js";import"./input-BVRvisgp.js";import"./new-folder-action-CzyiZDAz.js";import"./new-folder-form-COvAljl1.js";import"./field-label-UzlVOcad.js";import"./search-Cl8zJdKp.js";import"./loader-circle-Bx4Yqfec.js";import"./triangle-alert-Bnrh-J2F.js";const w=[{id:"mb-inbox",label:"INBOX",path:"INBOX",messageCount:4821},{id:"mb-archive",label:"Archive",path:"Archive",messageCount:19243},{id:"mb-deleted",label:"INBOX/Deleted Messages",path:"INBOX/Deleted Messages",messageCount:512},{id:"mb-prullenbak",label:"Prullenbak",path:"Prullenbak",messageCount:0},{id:"mb-spam",label:"Spam",path:"Spam",messageCount:88}];function x({initialSelectedId:h,phaseCycle:e,...p}){const[u,g]=m.useState(h),[b,f]=m.useState(0);return m.useEffect(()=>{if(!e||e.length<2)return;const k=setInterval(()=>f(I=>(I+1)%e.length),2200);return()=>clearInterval(k)},[e]),y.jsx(S,{...p,open:!0,folders:w,delimiter:"/",phase:e?.[b]??p.phase,selectedId:u,onSelect:g,onConfirm:()=>{},onCancel:()=>{}})}const Y={title:"Design System/Mail/RoleAppointmentPrompt",component:x},c={kind:"choosing"},n={name:"none",args:{reason:"none",action:{kind:"delete",count:12},phase:c,accountEmail:"hostnet-user@example.com"}},t={name:"stale",args:{reason:"stale",action:{kind:"delete",count:12},staleFolderLabel:"Prullenbak",phase:c}},a={name:"unconfirmed",args:{reason:"unconfirmed",action:{kind:"emptyTrash"},trashFolderLabel:"INBOX/Deleted Messages",trashRoleLabel:"Prullenbak",initialSelectedId:"mb-deleted",phase:c}},r={name:"unconfirmed — delete in place",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"INBOX/Deleted Messages",trashRoleLabel:"Prullenbak",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-deleted",phase:c}},s={name:"unconfirmed — delete into another folder",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"INBOX/Deleted Messages",trashRoleLabel:"Prullenbak",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-prullenbak",phase:c}},o={name:"unconfirmed — delete in place, acting",args:{reason:"unconfirmed",action:{kind:"delete",count:3},trashFolderLabel:"INBOX/Deleted Messages",trashRoleLabel:"Prullenbak",guessedMailboxId:"mb-deleted",initialSelectedId:"mb-deleted",phase:{kind:"acting"}}},i={name:"pending",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appointing"},phaseCycle:[{kind:"appointing"},{kind:"acting"}]}},d={name:"appoint-failed",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appoint-failed",message:"The mail server refused the folder appointment."}}},l={name:"appoint-refused-pending-mailbox",args:{reason:"none",action:{kind:"delete",count:12},initialSelectedId:"mb-prullenbak",phase:{kind:"appoint-failed",message:"Prullenbak is still being created on the mail server. Wait for it to finish, then try again."}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
    trashFolderLabel: "INBOX/Deleted Messages",
    trashRoleLabel: "Prullenbak",
    initialSelectedId: "mb-deleted",
    phase: choosing
  }
}`,...a.parameters?.docs?.source},description:{story:`Empty Trash on a folder reader only matched by name. The guess starts
selected, so the common case is one tap, and the confirm is the danger
variant — this is the only framing whose confirm expunges.`,...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete in place",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "INBOX/Deleted Messages",
    trashRoleLabel: "Prullenbak",
    guessedMailboxId: "mb-deleted",
    initialSelectedId: "mb-deleted",
    phase: choosing
  }
}`,...r.parameters?.docs?.source},description:{story:`A delete refused because the rows are already inside the folder reader only
matched by name: confirming it expunges them where they sit, so the copy says
"delete", never "empty", and the confirm is the danger variant.`,...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete into another folder",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "INBOX/Deleted Messages",
    trashRoleLabel: "Prullenbak",
    guessedMailboxId: "mb-deleted",
    initialSelectedId: "mb-prullenbak",
    phase: choosing
  }
}`,...s.parameters?.docs?.source},description:{story:`The same refusal answered with a different folder. The rows are not in that
one, so the delete moves them there and the confirm is not destructive.`,...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "unconfirmed — delete in place, acting",
  args: {
    reason: "unconfirmed",
    action: {
      kind: "delete",
      count: 3
    },
    trashFolderLabel: "INBOX/Deleted Messages",
    trashRoleLabel: "Prullenbak",
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
      message: "The mail server refused the folder appointment."
    }
  }
}`,...d.parameters?.docs?.source},description:{story:"The write failed. The picker stays, the selection stays, the confirm stays pressable.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
      message: "Prullenbak is still being created on the mail server. Wait for it to finish, then try again."
    }
  }
}`,...l.parameters?.docs?.source},description:{story:`The folder was made in the picker and the mail server has not confirmed it
yet. A different sentence with a different remedy from a network failure —
waiting fixes this one, retrying does not.`,...l.parameters?.docs?.description}}};const Z=["None","Stale","Unconfirmed","UnconfirmedDelete","UnconfirmedDeleteElsewhere","UnconfirmedDeleteInFlight","Pending","AppointFailed","AppointRefusedPendingMailbox"];export{d as AppointFailed,l as AppointRefusedPendingMailbox,n as None,i as Pending,t as Stale,a as Unconfirmed,r as UnconfirmedDelete,s as UnconfirmedDeleteElsewhere,o as UnconfirmedDeleteInFlight,Z as __namedExportsOrder,Y as default};
