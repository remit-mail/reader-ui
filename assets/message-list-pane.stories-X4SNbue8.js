import{r as c,j as r}from"./iframe-Dz9ev7_1.js";import{i as P}from"./filter-presets-B-ABJFx0.js";import{m as W}from"./brief-filters-CING_Fn4.js";import{u as K,a as _}from"./use-triage-keyboard-B1Z32UVd.js";import{F as $}from"./filter-sheet-CeQiR8S1.js";import{M as q}from"./mail-header-DdRif8HS.js";import{M as D}from"./message-list-pane-BULXpbcz.js";import{S as H}from"./selection-top-bar-B9NREb6e.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-BDbE0cN-.js";import"./keymap-dispatch-DTaqnLKC.js";import"./overlay-scope-D24dfPkM.js";import"./cn-d2XQ1MEC.js";import"./row-keyboard-4SpR8O0u.js";import"./badge-Dsqh0My3.js";import"./button-CLbVgqC1.js";import"./search-bar-DZkFD619.js";import"./search-chip-input-BdOc8EBq.js";import"./search-token-chip-DPL30lLY.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./search-qhk-8fnj.js";import"./menu-Cq__KQR7.js";import"./roving-focus-D6bxHDLq.js";import"./app-shell-types-C5CLdvMm.js";import"./brief-sections-8u1_dDMR.js";import"./brief-section-qCfSJv5W.js";import"./chevron-down-COHbBXpp.js";import"./chevron-right-BgpxkwQ0.js";import"./kbd-AyBW4Ydv.js";import"./message-list-state-Biv67GYX.js";import"./circle-alert-CcoNAO8C.js";import"./loader-circle-C6jTFX4E.js";import"./message-row-DihY8YqP.js";import"./avatar-BqhrHOCc.js";import"./label-chip-BhjI_09Q.js";import"./message-settlement-DjEMPELc.js";import"./cloud-off-CSr7LjQx.js";import"./shield-alert-D0TTzBU-.js";import"./star-CgN1A-T5.js";import"./paperclip-CCYkVloo.js";import"./check-D-jt1aUx.js";import"./touch-list-C5peh5-U.js";import"./swipeable-row-WgN4ywGY.js";import"./use-gesture-react.esm-CxGbg7hY.js";import"./mail-lJ4T2vNk.js";import"./mail-open-BrtXgs5p.js";import"./trash-2-0YleYOuI.js";import"./refresh-cw-CVxCxhHu.js";import"./banner-CcGBhVUA.js";import"./checkbox-CRAJJObE.js";import"./minus-rkSVdKQS.js";import"./popover-menu-Du3fo3Fn.js";import"./index-BBFLC7WR.js";import"./index-CdNcOAZG.js";import"./progress-bar-CrBPkLi3.js";import"./arrow-left-4NvhbwRF.js";import"./folder-input-D2DV_-7p.js";import"./sparkles-8ddE6svA.js";const U="[data-message-id]",V=e=>Array.from(e.querySelectorAll(U)).map(t=>t.dataset.messageId).filter(t=>t!==void 0),z=(e,t)=>e.length===t.length&&e.every((p,d)=>p===t[d]);function G(e){const[t,p]=c.useState(void 0),d=c.useCallback(()=>{if(!e)return;const l=V(e);p(o=>o&&z(o,l)?o:l)},[e]);return c.useEffect(d),c.useEffect(()=>{if(!e)return;const l=new MutationObserver(d);return l.observe(e,{childList:!0,subtree:!0}),()=>l.disconnect()},[e,d]),t}const Q=[],M=({isDesktop:e,initialFocusedId:t,initialSelectedIds:p,enabled:d=!0})=>{const[l,o]=c.useState(null),i=G(l),a=i??Q,s=K({orderedIds:a,isDesktop:e,initialFocusedId:t,initialSelectedIds:p}),h={focusNext:s.focusNext,focusPrevious:s.focusPrevious,focusFirst:s.focusFirst,focusLast:s.focusLast,toggleSelect:s.toggleFocusedSelection,extendSelectDown:s.extendRangeDown,extendSelectUp:s.extendRangeUp,selectAll:s.selectAllLoaded,back:s.exitSelection};_({handlers:h,enabled:d,target:l});const{intersectWith:f}=s.selection;c.useEffect(()=>{i!==void 0&&f(i)},[f,i]);const{selectedIds:n,toggle:m}=s.selection,{handleRowSelect:u}=s,T=c.useMemo(()=>({selectedIds:n,onToggle:m,onRowSelect:u}),[n,m,u]);return{cursor:s,orderedIds:a,selection:T,keyboard:{focusedId:s.focusedMessageId,handlers:h,ref:o}}},g=[{id:"today",label:"Today",threads:[{id:"t1",accountId:"a1",fromName:"Alex Rivera",fromEmail:"alex@example.com",subject:"Q3 planning notes",snippet:"Here are the notes from today's planning session.",timeLabel:"9:42",category:"personal"},{id:"t2",accountId:"a1",fromName:"Acme Billing",fromEmail:"billing@acme.com",subject:"Your invoice is ready",snippet:"Invoice #1042 is available to view.",timeLabel:"8:15",isRead:!0,category:"transactional"}]},{id:"earlier",label:"Earlier",threads:[{id:"t3",accountId:"a1",fromName:"Weekly Digest",fromEmail:"news@digest.com",subject:"This week in tech",snippet:"The top stories you might have missed.",timeLabel:"Mon",category:"newsletter",messageCount:3}]}],tt={title:"Playground/Shipped/Mail/MessageListPane",component:D,parameters:{layout:"centered"},args:{listTitle:"Inbox",listMeta:"3 conversations",sections:g,onSelectThread:()=>{}}},x=e=>r.jsx("div",{className:"h-screen w-96 overflow-hidden border border-line",children:r.jsx(e,{})}),E=e=>r.jsx("div",{className:"overflow-hidden border border-line",style:{width:390,height:844},children:r.jsx(e,{})}),R={focusedId:void 0,handlers:{},ref:()=>{}};function A({briefFilters:e=!1}){const t=M({isDesktop:!0}),[p,d]=c.useState(new Set),l=g.map(o=>({...o,threads:o.threads.filter(i=>W(i,p))})).filter(o=>o.threads.length>0);return r.jsx(D,{listTitle:"Inbox",listMeta:"3 conversations",sections:e?l:g,flatList:!e,briefFilters:e,briefFilter:e?{activeFilters:p,onToggleFilter:o=>d(i=>{const a=new Set(i);return a.has(o)?a.delete(o):a.add(o),a}),onClearFilters:()=>d(new Set)}:void 0,isDesktop:!0,onSelectThread:()=>{},selection:t.selection,keyboard:t.keyboard})}const j={render:()=>r.jsx(A,{}),decorators:[x]},C={args:{isDesktop:!1,flatList:!0},decorators:[E]},N={render:()=>r.jsx(A,{briefFilters:!0}),decorators:[x]};function B({initialExpanded:e=!1}){const t=P(),[p,d]=c.useState(""),[l,o]=c.useState(!1),[i,a]=c.useState(e),[s,h]=c.useState("all"),[f,n]=c.useState(new Set),m=g.flatMap(u=>u.threads);return r.jsxs("div",{className:"flex h-full flex-col",children:[r.jsx(q,{title:"Inbox",unreadCount:3,isDesktop:!1,onMenuClick:()=>{},searchValue:p,onSearchChange:d,searchOpen:l,onSearchOpenChange:o}),r.jsx("div",{className:"min-h-0 flex-1",children:r.jsx($,{categories:t.categories,filters:t.filters,sources:t.sources,selectedCategory:s,activeFilters:f,expanded:i,onExpandedChange:a,onSelectCategory:h,onToggleFilter:u=>n(T=>{const F=new Set(T);return F.has(u)?F.delete(u):F.add(u),F}),onClear:()=>{h("all"),n(new Set)},children:r.jsx("ul",{className:"divide-y divide-line",children:m.map(u=>r.jsxs("li",{className:"px-row-inset py-2.5",children:[r.jsx("div",{className:"text-sm font-medium text-fg",children:u.fromName}),r.jsx("div",{className:"truncate text-xs text-fg-muted",children:u.subject})]},u.id))})})})]})}const b={render:()=>r.jsx(B,{}),decorators:[E]},S={render:()=>r.jsx(B,{initialExpanded:!0}),decorators:[E]},y={args:{isDesktop:!0,flatList:!0,keyboard:R,listBody:r.jsx("div",{className:"flex-1 overflow-y-auto divide-y divide-line",children:g.flatMap(e=>e.threads.map(t=>r.jsxs("a",{href:`/mail/mbx-1/thr-${t.id}/${t.id}`,className:"flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken",children:[r.jsx("span",{className:"font-medium text-sm",children:t.fromName}),r.jsx("span",{className:"text-sm text-fg-muted truncate",children:t.subject})]},t.id)))})},decorators:[x]};function O({isDesktop:e}){const[t,p]=c.useState(new Set),[d,l]=c.useState(new Set),o=g.map(n=>({...n,threads:n.threads.filter(m=>!t.has(m.id)).map(m=>d.has(m.id)?{...m,isRead:!0}:m)})),i=M({isDesktop:e}),{selection:a}=i.cursor,{orderedIds:s}=i,h=s.length>0&&s.every(n=>a.selectedIds.has(n)),f=n=>{n(a.selectedIds),a.clearSelection()};return r.jsx(D,{listTitle:"Inbox",listMeta:"3 conversations",sections:o,flatList:!0,isDesktop:e,onSelectThread:()=>{},selection:i.selection,keyboard:i.keyboard,selectionBar:r.jsx(H,{title:"Inbox",count:a.selectedCount,onCancel:a.clearSelection,onDelete:()=>f(n=>p(m=>new Set([...m,...n]))),onMarkRead:()=>f(n=>l(m=>new Set([...m,...n]))),selectAll:{checked:h,indeterminate:a.hasSelection&&!h,onChange:()=>a.toggleAll(s)}})})}const w={render:()=>r.jsx(O,{isDesktop:!0}),decorators:[x]},k={render:()=>r.jsx(O,{isDesktop:!1}),decorators:[E]},v={args:{isDesktop:!0,flatList:!0,listState:"empty",keyboard:R},decorators:[x]},L={args:{isDesktop:!0,flatList:!0,listState:"empty",keyboard:R,listFilter:{label:"Personal mail",reach:"whole-folder",onClear:()=>{}},listScopeLabel:"Inbox"},decorators:[x]},I={args:{isDesktop:!0,flatList:!0,listState:"error",keyboard:R,errorMessage:"Request timed out while loading this mailbox.",onRetry:()=>{},onReportError:()=>{}},decorators:[x]};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <LiveList />,
  decorators: [desktopFrame]
}`,...j.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    isDesktop: false,
    flatList: true
  },
  decorators: [narrowFrame]
}`,...C.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <LiveList briefFilters />,
  decorators: [desktopFrame]
}`,...N.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <InboxScreen />,
  decorators: [narrowFrame]
}`,...b.parameters?.docs?.source},description:{story:"Inbox filter collapsed: header + the FilterSheet bar over the inbox list.",...b.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <InboxScreen initialExpanded />,
  decorators: [narrowFrame]
}`,...S.parameters?.docs?.source},description:{story:"Inbox filter expanded: categories + Unread/Flagged/Has attachment.",...S.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    isDesktop: true,
    flatList: true,
    keyboard: noKeyboard,
    listBody: <div className="flex-1 overflow-y-auto divide-y divide-line">
                {sections.flatMap(s => s.threads.map(t => <a key={t.id} href={\`/mail/mbx-1/thr-\${t.id}/\${t.id}\`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                            <span className="font-medium text-sm">{t.fromName}</span>
                            <span className="text-sm text-fg-muted truncate">
                                {t.subject}
                            </span>
                        </a>))}
            </div>
  },
  decorators: [desktopFrame]
}`,...y.parameters?.docs?.source},description:{story:"Consumer-supplied `listBody` slot — the pane renders the chrome while the\n caller owns the scrollable rows, and the keys over those rows with them.\n This models the web-client's virtualized inbox path.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <SelectableList isDesktop />,
  decorators: [desktopFrame]
}`,...w.parameters?.docs?.source},description:{story:`The pane under a selection its consumer owns — it draws the checkboxes and
holds none of the state. Click a checkbox to tick one row, cmd/ctrl-click a
row to tick it without opening it, shift-click to range from the last row
touched, and select-all covers the rows on screen. From 768px up the labelled
select-all sits inline in the bar.

The bar is the header for every state of the list: it names the mailbox with
nothing ticked and carries the count and the verbs from the first ticked row.
Delete and Mark read act on the rows — trashed rows leave the list, marked
ones lose their unread dot.`,...w.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <SelectableList isDesktop={false} />,
  decorators: [narrowFrame]
}`,...k.parameters?.docs?.source},description:{story:`The same list at phone width, where selection is a long press and a tap on
the checkbox: no modifier comes off a touch, so there is no range and no
cmd-toggle here. Checkboxes stay put once a row is ticked, and select-all
moves to a second row so row one stays a count and the verbs.`,...k.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    isDesktop: true,
    flatList: true,
    listState: "empty",
    keyboard: noKeyboard
  },
  decorators: [desktopFrame]
}`,...v.parameters?.docs?.source},description:{story:"An empty mailbox, unfiltered: one plain line and no completeness claim.",...v.parameters?.docs?.description}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    isDesktop: true,
    flatList: true,
    listState: "empty",
    keyboard: noKeyboard,
    listFilter: {
      label: "Personal mail",
      reach: "whole-folder",
      onClear: () => undefined
    },
    listScopeLabel: "Inbox"
  },
  decorators: [desktopFrame]
}`,...L.parameters?.docs?.source},description:{story:`The same pane under a category filter — the composition the inbox ships
(#306). The pane forwards the filter and the scope to the empty state, so a
narrowed list states what was read instead of reading as an empty mailbox.`,...L.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    isDesktop: true,
    flatList: true,
    listState: "error",
    keyboard: noKeyboard,
    errorMessage: "Request timed out while loading this mailbox.",
    onRetry: () => undefined,
    onReportError: () => undefined
  },
  decorators: [desktopFrame]
}`,...I.parameters?.docs?.source},description:{story:`Fail-loud error state — the specific failure detail is surfaced under the
 headline (not a bare "something went wrong"), with a way back (Retry) and a
 place for the failure to go (Report a problem).`,...I.parameters?.docs?.description}}};const rt=["DesktopList","NarrowTouchList","Brief","InboxWithFilter","InboxWithFilterExpanded","CustomListBody","ConsumerSelection","NarrowConsumerSelection","EmptyState","FilteredEmptyState","ErrorState"];export{N as Brief,w as ConsumerSelection,y as CustomListBody,j as DesktopList,v as EmptyState,I as ErrorState,L as FilteredEmptyState,b as InboxWithFilter,S as InboxWithFilterExpanded,k as NarrowConsumerSelection,C as NarrowTouchList,rt as __namedExportsOrder,tt as default};
