import{j as e,r as O}from"./iframe-Dz9ev7_1.js";import{A as w}from"./attachment-list-C-PWWXsq.js";import"./preload-helper-PPVm8Dsz.js";import"./attachment-file-lxgUGUUR.js";import"./cn-d2XQ1MEC.js";import"./paperclip-CCYkVloo.js";import"./createLucideIcon-RYwrBmYZ.js";import"./chevron-down-COHbBXpp.js";import"./chevron-right-BgpxkwQ0.js";import"./mail-lJ4T2vNk.js";import"./circle-alert-CcoNAO8C.js";import"./loader-circle-C6jTFX4E.js";import"./download-CVFC-Ko8.js";const Q={title:"Design System/Mail/AttachmentList",component:w,parameters:{layout:"padded",docs:{description:{component:`The attachment list on an open message (#683). Every row saves a file, so
every row is a button; the paperclip in the heading is the only glyph and it
is decoration. Nothing here fetches — the app owns the download and hands
back per-row state, which is what makes the failure story below the same
component the app renders.`}}}},n={attachmentId:"part-2",kind:"file",filename:"Q3 board pack.pdf",typeLabel:"PDF",sizeOctets:2411724,download:{status:"idle"}},u={attachmentId:"part-3",kind:"file",filename:"site-plan.png",typeLabel:"PNG",sizeOctets:486120,download:{status:"idle"}},x={attachmentId:"part-9",kind:"message",filename:"forwarded.eml",typeLabel:"MESSAGE",sizeOctets:617,download:{status:"idle"}},A={attachmentId:"part-9-2",kind:"file",filename:"original.pdf",typeLabel:"PDF",sizeOctets:33,download:{status:"idle"}},j=()=>e.jsxs("div",{className:"space-y-3 text-sm text-fg",children:[e.jsx("p",{children:"Original message body before forwarding."}),e.jsx(w,{attachments:[A],onDownload:()=>{},onToggleOpen:()=>{}})]}),z=900,s=({attachments:L,hasUnlistedAttachment:I,initiallyOpen:k=null})=>{const[f,v]=O.useState(L),[g,F]=O.useState(k),y=(t,a)=>v(h=>h.map(b=>b.attachmentId===t?a:b)),S=t=>{const a=f.find(h=>h.attachmentId===t);!a||a.download.status==="downloading"||(y(t,{...a,download:{status:"downloading"}}),setTimeout(()=>y(t,{...a,download:{status:"idle"}}),z))};return e.jsx(w,{attachments:f,onDownload:S,hasUnlistedAttachment:I,onToggleOpen:t=>F(a=>a===t?null:t),opened:g===null?void 0:{attachmentId:g,content:e.jsx(j,{})}})},m={render:()=>e.jsx(s,{attachments:[n]})},p={render:()=>e.jsx(s,{attachments:[n,u,{attachmentId:"part-4",kind:"file",filename:"notes.txt",typeLabel:"PLAIN",sizeOctets:812,download:{status:"idle"}},{attachmentId:"part-5",kind:"file",filename:"archive",typeLabel:"FILE",sizeOctets:1024**3+1024**2*200,download:{status:"idle"}}]})},r={render:()=>e.jsx(s,{attachments:[{...n,download:{status:"downloading"}},u]})},o={render:()=>e.jsx(s,{attachments:[{...n,download:{status:"failed",title:"This attachment is missing from storage",detail:"Remit has the message but not the file. Re-sync the account from Settings, then try again.",reportUrl:"https://github.com/remit-mail/reader/issues/new"}},u]})},i={render:()=>e.jsx(s,{attachments:[{attachmentId:"part-6",kind:"file",filename:"passwd",typeLabel:"FILE",sizeOctets:3120,download:{status:"idle"}},{attachmentId:"part-7",kind:"file",filename:"invoicegnp.exe",typeLabel:"FILE",sizeOctets:118400,download:{status:"idle"}},{attachmentId:"part-8",kind:"file",filename:`${"long-name-".repeat(11)}report.pdf`,typeLabel:"PDF",sizeOctets:44e3,download:{status:"idle"}}]})},d={render:()=>e.jsx(s,{attachments:[],hasUnlistedAttachment:!0})},c={render:()=>e.jsx(s,{attachments:[x,n]})},l={render:()=>e.jsx(s,{attachments:[x,n],initiallyOpen:"part-9"})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[report]} />
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[report, sitePlan, {
    attachmentId: "part-4",
    kind: "file",
    filename: "notes.txt",
    typeLabel: "PLAIN",
    sizeOctets: 812,
    download: {
      status: "idle"
    }
  }, {
    attachmentId: "part-5",
    kind: "file",
    filename: "archive",
    typeLabel: "FILE",
    sizeOctets: 1024 ** 3 + 1024 ** 2 * 200,
    download: {
      status: "idle"
    }
  }]} />
}`,...p.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[{
    ...report,
    download: {
      status: "downloading"
    }
  }, sitePlan]} />
}`,...r.parameters?.docs?.source},description:{story:"One row mid-fetch. The rows beside it are still pressable.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[{
    ...report,
    download: {
      status: "failed",
      title: "This attachment is missing from storage",
      detail: "Remit has the message but not the file. Re-sync the account from Settings, then try again.",
      reportUrl: "https://github.com/remit-mail/reader/issues/new"
    }
  }, sitePlan]} />
}`,...o.parameters?.docs?.source},description:{story:`A fetch that failed. The row keeps its control, and the alert underneath
names what broke and what to do about it — a dead click that leaves the user
guessing whether the app, the server or they themselves are at fault is the
outcome this list exists to make impossible.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[{
    attachmentId: "part-6",
    kind: "file",
    filename: "passwd",
    typeLabel: "FILE",
    sizeOctets: 3_120,
    download: {
      status: "idle"
    }
  }, {
    attachmentId: "part-7",
    kind: "file",
    filename: "invoicegnp.exe",
    typeLabel: "FILE",
    sizeOctets: 118_400,
    download: {
      status: "idle"
    }
  }, {
    attachmentId: "part-8",
    kind: "file",
    filename: \`\${"long-name-".repeat(11)}report.pdf\`,
    typeLabel: "PDF",
    sizeOctets: 44_000,
    download: {
      status: "idle"
    }
  }]} />
}`,...i.parameters?.docs?.source},description:{story:"Names written to deceive, as `sanitizeAttachmentFilename` leaves them. The\nsenders wrote `../../../etc/passwd`, `invoice<RLO>gnp.exe` — which renders as\n`invoiceexe.png` with the override intact — and 400 characters of padding.\nThe list shows exactly the name the file is saved under, so what is read is\nwhat lands.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[]} hasUnlistedAttachment />
}`,...d.parameters?.docs?.source},description:{story:`The mail server flagged the message as carrying an attachment, but no body
part describes one. Saying nothing here is what made the original paperclip
read as broken.`,...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[forwarded, report]} />
}`,...c.parameters?.docs?.source},description:{story:`A forwarded message, carried whole (message/rfc822). It is listed under its
own name and opens in place; the PDF it carries belongs to it, so it is not
a row of the outer list.`,...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Harness attachments={[forwarded, report]} initiallyOpen="part-9" />
}`,...l.parameters?.docs?.source},description:{story:"The forwarded message opened: its body and its own attachment list.",...l.parameters?.docs?.description}}};const W=["OneAttachment","SeveralAttachments","Downloading","DownloadFailed","HostileFilename","UnlistedAttachment","ForwardedMessage","ForwardedMessageOpen"];export{o as DownloadFailed,r as Downloading,c as ForwardedMessage,l as ForwardedMessageOpen,i as HostileFilename,m as OneAttachment,p as SeveralAttachments,d as UnlistedAttachment,W as __namedExportsOrder,Q as default};
