import{j as e,r as g}from"./iframe-Dz9ev7_1.js";import{A as w}from"./avatar-BqhrHOCc.js";import{R as j}from"./refresh-button-BKFLj66X.js";import{S as m}from"./shell-top-bar-DEBMzcNl.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./button-CLbVgqC1.js";import"./circle-alert-CcoNAO8C.js";import"./createLucideIcon-RYwrBmYZ.js";import"./circle-check-big-CTNKdZr7.js";import"./refresh-cw-CVxCxhHu.js";import"./app-top-bar-BIo1tiXa.js";import"./attention-dot-B1yjjn_a.js";import"./app-shell-types-C5CLdvMm.js";import"./dialog-CClY1ZXZ.js";import"./overlay-scope-D24dfPkM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-WDgdsyy8.js";import"./dialog-backdrop-hoQFjglb.js";import"./menu-Cq__KQR7.js";import"./search-bar-DZkFD619.js";import"./search-chip-input-BdOc8EBq.js";import"./search-token-chip-DPL30lLY.js";import"./x-snW7h3us.js";import"./search-qhk-8fnj.js";import"./bug-3Zk-gqgz.js";const Y={title:"Design System/Mail/ShellTopBar",component:m,parameters:{layout:"fullscreen"}},f={id:"in:spam",label:"in:spam",tone:"scope"},x=()=>e.jsx("button",{type:"button","aria-label":"Account",children:e.jsx(w,{name:"Reader Example",email:"reader@example.com",size:"sm"})}),v=({state:d="idle"})=>e.jsx(j,{state:d,label:"Refresh all accounts",errorMessage:d==="error"?"2 of 3 accounts couldn't be reached":void 0,onRefresh:()=>{}}),r=({initialChips:d,scope:b="global",refreshState:S="idle",settingsAttention:y})=>{const[h,u]=g.useState(d),[C,l]=g.useState("");return e.jsx(m,{search:{value:C,scope:h?.length?b:"global",chips:h,onChange:l,onClear:()=>{l(""),u(void 0)},onClearQuery:()=>l(""),onRemoveChip:()=>u(void 0)},onCompose:()=>{},onReportBug:()=>{},onOpenSettings:()=>{},settingsAttention:y,composeShortcut:"c",refreshControl:e.jsx(v,{state:S}),account:e.jsx(x,{})})},s={render:()=>e.jsx(r,{})},o={render:()=>e.jsx(r,{initialChips:[f],scope:"scoped"})},t={render:()=>e.jsx(m,{search:{value:"",scope:"pending",onChange:()=>{},onClear:()=>{},onClearQuery:()=>{}},onCompose:()=>{},onReportBug:()=>{},onOpenSettings:()=>{},composeShortcut:"c",refreshControl:e.jsx(v,{}),account:e.jsx(x,{})})},a={render:()=>e.jsx(r,{initialChips:[{id:"is:starred",label:"is:starred",tone:"scope"}],scope:"scoped"})},n={render:()=>e.jsx(r,{refreshState:"refreshing"})},i={render:()=>e.jsx(r,{refreshState:"error"})},p={render:()=>e.jsx(r,{settingsAttention:"Sync warnings"})},c={render:()=>e.jsxs("div",{className:"flex h-96 flex-col bg-canvas",children:[e.jsx(r,{initialChips:[f],scope:"scoped"}),e.jsxs("div",{className:"flex min-h-0 flex-1",children:[e.jsx("div",{className:"w-56 shrink-0 border-r border-line bg-surface p-3 text-xs text-fg-muted",children:"Nav — under the bar, like every other pane"}),e.jsx("div",{className:"w-72 shrink-0 border-r border-line bg-surface p-3 text-xs text-fg-muted",children:"Message list"}),e.jsx("div",{className:"min-w-0 flex-1 p-3 text-xs text-fg-muted",children:"Message pane — its own toolbar lives here, under the bar"})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Bar />
}`,...s.parameters?.docs?.source},description:{story:`The daily brief's state: search unscoped, nothing narrowing it, and the only
placeholder allowed to claim it searches all mail — which it genuinely does,
across every folder of every account.`,...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Bar initialChips={[SCOPE]} scope="scoped" />
}`,...o.parameters?.docs?.source},description:{story:`A narrowing scope in the bar, tinted to mark it as the view the user is in
rather than a filter they typed. Removing it widens the search again — a
navigation back to the brief, not an edit of the text, because the chip
mirrors the route. The placeholder narrows with the chip.`,...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <ShellTopBar search={{
    value: "",
    scope: "pending",
    onChange: () => undefined,
    onClear: () => undefined,
    onClearQuery: () => undefined
  }} onCompose={() => undefined} onReportBug={() => undefined} onOpenSettings={() => undefined} composeShortcut="c" refreshControl={<GlobalRefresh />} account={<Account />} />
}`,...t.parameters?.docs?.source},description:{story:`A mailbox route whose name has not resolved yet. The list underneath is
already narrowed, so the bar must not claim to search everything — and a chip
reading a raw uuid is worse than no chip, so it shows none and falls back to
neutral wording until the name arrives.`,...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Bar initialChips={[{
    id: "is:starred",
    label: "is:starred",
    tone: "scope"
  }]} scope="scoped" />
}`,...a.parameters?.docs?.source},description:{story:"The virtual collections scope the bar too, and their chips read as whatever\ndescribes the collection. Flagged is a marker on the mail rather than a\nplace, so it chips `is:starred`.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Bar refreshState="refreshing" />
}`,...n.parameters?.docs?.source},description:{story:`The global refresh mid-flight — every connected account syncing at once,
next to the avatar it sits beside.`,...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Bar refreshState="error" />
}`,...i.parameters?.docs?.source},description:{story:`At least one account couldn't be reached. The tooltip and accessible name
say so; the button stays clickable to retry.`,...i.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Bar settingsAttention="Sync warnings" />
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-96 flex-col bg-canvas">
            <Bar initialChips={[SCOPE]} scope="scoped" />
            <div className="flex min-h-0 flex-1">
                <div className="w-56 shrink-0 border-r border-line bg-surface p-3 text-xs text-fg-muted">
                    Nav — under the bar, like every other pane
                </div>
                <div className="w-72 shrink-0 border-r border-line bg-surface p-3 text-xs text-fg-muted">
                    Message list
                </div>
                <div className="min-w-0 flex-1 p-3 text-xs text-fg-muted">
                    Message pane — its own toolbar lives here, under the bar
                </div>
            </div>
        </div>
}`,...c.parameters?.docs?.source},description:{story:"The arrangement: one bar across the top of the shell, over every pane.",...c.parameters?.docs?.description}}};const Z=["Unscoped","Scoped","ScopePending","ScopedToFlagged","RefreshingAllAccounts","RefreshFailed","SettingsAttention","OverTheLayout"];export{c as OverTheLayout,i as RefreshFailed,n as RefreshingAllAccounts,t as ScopePending,o as Scoped,a as ScopedToFlagged,p as SettingsAttention,s as Unscoped,Z as __namedExportsOrder,Y as default};
