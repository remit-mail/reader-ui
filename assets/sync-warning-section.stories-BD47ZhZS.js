import{j as e,r as S}from"./iframe-Dz9ev7_1.js";import{M as l}from"./message-report-dialog-QM6OkSWO.js";import{S as d,a as u,f as g}from"./sync-warning-section-Bnqy97RJ.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CLbVgqC1.js";import"./cn-d2XQ1MEC.js";import"./dialog-CClY1ZXZ.js";import"./overlay-scope-D24dfPkM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-WDgdsyy8.js";import"./dialog-backdrop-hoQFjglb.js";import"./createLucideIcon-RYwrBmYZ.js";import"./external-link-DKEvVWRd.js";import"./badge-Dsqh0My3.js";import"./bug-3Zk-gqgz.js";import"./circle-check-BDce0YBc.js";const r=[{syncWarningId:"w-1",uid:51002,stage:"Body",state:"GaveUp",attempts:3,createdAt:Date.parse("2026-10-17T08:12:00Z"),folderLabel:"Inbox"},{syncWarningId:"w-2",uid:50874,stage:"Header",state:"Retrying",attempts:7,createdAt:Date.parse("2026-10-16T21:40:00Z"),folderLabel:"Receipts"}],[y,x]=r,R="https://github.com/remit-mail/reader/issues/new",G={title:"Design System/Settings/Sync warnings",component:d,parameters:{layout:"padded"},args:{onReport:()=>{}},decorators:[n=>e.jsx("div",{className:"mx-auto max-w-2xl",children:e.jsx(n,{})})]},s={args:{entries:[],total:0}},o={args:{entries:r,total:r.length}},t={args:{entries:r,total:4812}},a={render:()=>e.jsx("ul",{className:"rounded-sm border border-line bg-surface",children:e.jsx(u,{entry:y,onReport:()=>{}})})},p={render:()=>e.jsx("ul",{className:"rounded-sm border border-line bg-surface",children:e.jsx(u,{entry:x,onReport:()=>{}})})},i={render:()=>{const[n,m]=S.useState(null);return e.jsxs(e.Fragment,{children:[e.jsx(d,{entries:r,total:r.length,onReport:m}),e.jsx(l,{report:n?g(n):null,issueUrl:R,onClose:()=>m(null),onCopy:()=>m(null)})]})}},c={render:()=>e.jsx(l,{report:g(y),issueUrl:R,onClose:()=>{},onCopy:()=>{}})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    entries: [],
    total: 0
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    entries: syncWarningDemoEntries,
    total: syncWarningDemoEntries.length
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    entries: syncWarningDemoEntries,
    total: 4_812
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ul className="rounded-sm border border-line bg-surface">
            <SyncWarningRow entry={gaveUp} onReport={() => {}} />
        </ul>
}`,...a.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ul className="rounded-sm border border-line bg-surface">
            <SyncWarningRow entry={retrying} onReport={() => {}} />
        </ul>
}`,...p.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState<SyncWarningEntry | null>(null);
    return <>
                <SyncWarningSection entries={syncWarningDemoEntries} total={syncWarningDemoEntries.length} onReport={setOpen} />
                <MessageReportDialog report={open ? formatSyncWarningReport(open) : null} issueUrl={demoIssueUrl} onClose={() => setOpen(null)} onCopy={() => setOpen(null)} />
            </>;
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <MessageReportDialog report={formatSyncWarningReport(gaveUp)} issueUrl={demoIssueUrl} onClose={() => {}} onCopy={() => {}} />
}`,...c.parameters?.docs?.source}}};const _=["Empty","Mixed","OverCap","GaveUpRow","RetryingRow","ReportFlow","Report"];export{s as Empty,a as GaveUpRow,o as Mixed,t as OverCap,c as Report,i as ReportFlow,p as RetryingRow,_ as __namedExportsOrder,G as default};
