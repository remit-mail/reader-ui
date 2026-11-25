import{r as x,j as I}from"./iframe-4Y_dM_UU.js";import{R as P}from"./role-appointment-list-D0CS2ru5.js";import"./preload-helper-PPVm8Dsz.js";import"./folder-tree-lS__Eg2V.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./folder-role-CvPdLVqM.js";import"./inbox-CvUF9C2g.js";import"./file-text-BmCePHPh.js";import"./send-CbUYJmgX.js";import"./mails-ChqgPF6O.js";import"./octagon-alert-ChID51gq.js";import"./trash-q_49bOYx.js";import"./star-DJsZr7L-.js";import"./input-BVRvisgp.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./folder-C3sBa3fi.js";import"./check-DSdQDF54.js";const e=[{mailboxId:"mb-inbox",providerPath:"INBOX",hierarchyDelimiter:"/",messageCount:4821},{mailboxId:"mb-archive",providerPath:"INBOX/Archive",hierarchyDelimiter:"/",messageCount:19243},{mailboxId:"mb-concepten",providerPath:"INBOX/Concepten",hierarchyDelimiter:"/",messageCount:340},{mailboxId:"mb-deleted",providerPath:"INBOX/Deleted Messages",hierarchyDelimiter:"/",messageCount:512},{mailboxId:"mb-drafts",providerPath:"INBOX/Drafts",hierarchyDelimiter:"/",messageCount:0},{mailboxId:"mb-news",providerPath:"INBOX/Nieuwsbrieven",hierarchyDelimiter:"/",messageCount:2870},{mailboxId:"mb-sent",providerPath:"INBOX/Sent",hierarchyDelimiter:"/",messageCount:0},{mailboxId:"mb-sent-messages",providerPath:"INBOX/Sent Messages",hierarchyDelimiter:"/",messageCount:6105},{mailboxId:"mb-spam",providerPath:"INBOX/Spam",hierarchyDelimiter:"/",messageCount:88}],s=h=>({mailboxId:h,source:"Appointed"}),r={inbox:{mailboxId:"mb-inbox",source:"Reserved"},drafts:s("mb-concepten"),sent:s("mb-sent-messages"),archive:s("mb-archive"),junk:s("mb-spam"),trash:s("mb-deleted")};function L({folders:h,initial:E,setup:b=!1}){const[T,D]=x.useState(E),[v,O]=x.useState({}),N=(g,S)=>{D(f=>({...f,[g]:{mailboxId:S,source:"Appointed"}}))},y=(g,S)=>O(f=>({...f,[g]:S.trim()}));return I.jsx("div",{className:"max-w-3xl p-8",children:I.jsx(P,{accountEmail:"hostnet-user@example.com",folders:h,appointments:T,displayNames:v,onAppoint:N,onRename:b?void 0:y,roles:b?["trash","sent","drafts","archive"]:void 0,showOtherFolders:!b})})}const Z={title:"Design System/Settings/RoleAppointmentList",component:L},o={args:{folders:e,initial:r}},a={args:{folders:e,initial:{...r,drafts:{mailboxId:"mb-drafts",source:"Flagged"},sent:{mailboxId:"mb-sent",source:"Flagged"}}}},t={name:"appointed",args:{folders:e,initial:r}},n={name:"flagged",args:{folders:e,initial:{...r,trash:{mailboxId:"mb-deleted",source:"Flagged"}}}},i={name:"detected",args:{folders:e,initial:{...r,trash:{mailboxId:"mb-deleted",source:"Detected"}}}},d={name:"reserved",args:{folders:e,initial:{...r,inbox:{mailboxId:"mb-inbox",source:"Reserved"}}}},c={name:"proposed",args:{folders:e,initial:{...r,trash:{mailboxId:"mb-deleted",source:"Proposed"}}}},m={name:"proposed throughout",args:{folders:e,initial:{inbox:{mailboxId:"mb-inbox",source:"Reserved"},drafts:{mailboxId:"mb-concepten",source:"Proposed"},sent:{mailboxId:"mb-sent-messages",source:"Proposed"},archive:{mailboxId:"mb-archive",source:"Proposed"},junk:{mailboxId:"mb-spam",source:"Proposed"},trash:{mailboxId:"mb-deleted",source:"Proposed"}}}},l={name:"stale",args:{folders:e,initial:{...r,trash:{mailboxId:null,source:"Stale",staleFolderPath:"INBOX/Prullenbak"}}}},p={name:"none",args:{folders:e,initial:{...r,trash:{mailboxId:null,source:"None"},archive:{mailboxId:null,source:"None"}}}},u={args:{...o.args,setup:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    folders: HOSTNET_FOLDERS,
    initial: SETTLED
  }
}`,...o.parameters?.docs?.source},description:{story:'The intended end state: each role points at the folder that holds the mail —\nDrafts → Concepten · 340, not the empty `INBOX/Drafts`; Sent → Sent Messages.\nThe empty look-alikes drop to "Other folders".',...o.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      drafts: {
        mailboxId: "mb-drafts",
        source: "Flagged"
      },
      sent: {
        mailboxId: "mb-sent",
        source: "Flagged"
      }
    }
  }
}`,...a.parameters?.docs?.source},description:{story:"Flag-first proposal before the user corrects it: detection appointed the\n`\\Drafts`-flagged but empty `INBOX/Drafts` (0) and the empty `INBOX/Sent`.\nThe picker counts reveal the real folders so the user can re-appoint.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "appointed",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: SETTLED
  }
}`,...t.parameters?.docs?.source},description:{story:"`Appointed` — a person decided, and the row says so. Every picker offers\nfolders only: a canonical role is mandatory, so a wrong choice is fixed by\nnaming another folder, never by clearing the row.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "flagged",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      trash: {
        mailboxId: "mb-deleted",
        source: "Flagged"
      }
    }
  }
}`,...n.parameters?.docs?.source},description:{story:"`Flagged` — the mail server's own SPECIAL-USE flag, not a guess.",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "detected",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      trash: {
        mailboxId: "mb-deleted",
        source: "Detected"
      }
    }
  }
}`,...i.parameters?.docs?.source},description:{story:"`Detected` — an unambiguous automatic appointment, not a proposal.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "reserved",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      inbox: {
        mailboxId: "mb-inbox",
        source: "Reserved"
      }
    }
  }
}`,...d.parameters?.docs?.source},description:{story:"`Reserved` — INBOX is the one role the protocol names for us.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "proposed",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      trash: {
        mailboxId: "mb-deleted",
        source: "Proposed"
      }
    }
  }
}`,...c.parameters?.docs?.source},description:{story:"`Proposed` — a name matched. Nobody confirmed it, and the row does not\npretend otherwise. `Set as Trash` commits the folder the picker already\nshows, which re-picking that same option cannot do.",...c.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "proposed throughout",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      inbox: {
        mailboxId: "mb-inbox",
        source: "Reserved"
      },
      drafts: {
        mailboxId: "mb-concepten",
        source: "Proposed"
      },
      sent: {
        mailboxId: "mb-sent-messages",
        source: "Proposed"
      },
      archive: {
        mailboxId: "mb-archive",
        source: "Proposed"
      },
      junk: {
        mailboxId: "mb-spam",
        source: "Proposed"
      },
      trash: {
        mailboxId: "mb-deleted",
        source: "Proposed"
      }
    }
  }
}`,...m.parameters?.docs?.source},description:{story:`Density check: a server that advertises no SPECIAL-USE flags, so every role
but INBOX rests on a name match alone. Each row carries its own commit, so
the screen stays a list rather than five stacked callouts.`,...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "stale",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      trash: {
        mailboxId: null,
        source: "Stale",
        staleFolderPath: "INBOX/Prullenbak"
      }
    }
  }
}`,...l.parameters?.docs?.source},description:{story:"`Stale` — the folder the user chose is gone from the mail server. The one row\nrepresenting a broken decision, so it is a callout with its repair rather\nthan a subtitle. Deleting mail is stopped until Trash is repaired.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "none",
  args: {
    folders: HOSTNET_FOLDERS,
    initial: {
      ...SETTLED,
      trash: {
        mailboxId: null,
        source: "None"
      },
      archive: {
        mailboxId: null,
        source: "None"
      }
    }
  }
}`,...p.parameters?.docs?.source},description:{story:'`None` — a decision waiting to be made. No icon, no danger colour. Trash and\nArchive show the disabled "Choose a folder" placeholder; the settled rows\naround them have no such option left to fall back to.',...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...Hostnet.args,
    setup: true
  }
}`,...u.parameters?.docs?.source},description:{story:"Setup confirms the four operational roles without editing sidebar names.",...u.parameters?.docs?.description}}};const $=["Hostnet","ProposedDefaults","AppointedSource","FlaggedSource","DetectedSource","ReservedSource","ProposedSource","ProposedThroughout","StaleSource","NoneSource","Setup"];export{t as AppointedSource,i as DetectedSource,n as FlaggedSource,o as Hostnet,p as NoneSource,a as ProposedDefaults,c as ProposedSource,m as ProposedThroughout,d as ReservedSource,u as Setup,l as StaleSource,$ as __namedExportsOrder,Z as default};
