import{j as e,r as i}from"./iframe-Dz9ev7_1.js";import{b as Q,i as _}from"./filter-presets-B-ABJFx0.js";import{u as J,S as X}from"./suggest-list-DoVkY54B.js";import{M}from"./mobile-search-view-DiUL2DB3.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-BDbE0cN-.js";import"./brief-filters-CING_Fn4.js";import"./cn-d2XQ1MEC.js";import"./button-CLbVgqC1.js";import"./filter-sheet-CeQiR8S1.js";import"./row-keyboard-4SpR8O0u.js";import"./badge-Dsqh0My3.js";import"./search-bar-DZkFD619.js";import"./search-chip-input-BdOc8EBq.js";import"./overlay-scope-D24dfPkM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./search-token-chip-DPL30lLY.js";import"./x-snW7h3us.js";import"./createLucideIcon-RYwrBmYZ.js";import"./search-qhk-8fnj.js";import"./search-results-BVRf6CWX.js";import"./blocked-reason-CuncjwVb.js";import"./folder-role-BD2LqoZH.js";import"./folder-tree-ZE9Jqoy_.js";import"./inbox-CCAVz_Kv.js";import"./file-text-DPRQ2ITA.js";import"./send-Drm6iBwR.js";import"./mails-hwwal05r.js";import"./octagon-alert-D9xVGo9b.js";import"./trash-2-0YleYOuI.js";import"./star-CgN1A-T5.js";import"./message-row-DihY8YqP.js";import"./roving-focus-D6bxHDLq.js";import"./avatar-BqhrHOCc.js";import"./label-chip-BhjI_09Q.js";import"./message-settlement-DjEMPELc.js";import"./cloud-off-CSr7LjQx.js";import"./shield-alert-D0TTzBU-.js";import"./paperclip-CCYkVloo.js";import"./check-D-jt1aUx.js";import"./spam-results-offer-BgfUpCDD.js";import"./banner-CcGBhVUA.js";import"./clock-QCzNkE3J.js";import"./chevron-down-COHbBXpp.js";const Z=a=>e.jsx("div",{className:"overflow-hidden rounded-lg border border-line",style:{width:390,height:720},children:e.jsx(a,{})}),ee=[{id:"personal",label:"reader@",count:42,active:!0},{id:"work",label:"work@acme",count:17}],te=["invoice march","from: stripe","flight confirmation"],F=[{id:"r1",sender:"Stripe",senderEmail:"receipts@stripe.com",subject:"Your invoice for March is ready",snippet:"Invoice #4821 — €149.00 paid on Visa ending 4242.",date:"9:42",unread:!0,category:{label:"Receipt",tone:"positive"}},{id:"r2",sender:"Hetzner Online",senderEmail:"billing@hetzner.com",subject:"Invoice 2026-03 available in your account",snippet:"Dear customer, your invoice for the period is attached.",date:"Mar 3",category:{label:"Finance",tone:"accent"}},{id:"r3",sender:"Anna de Vries",senderEmail:"anna@devries.nl",subject:"Re: Q1 invoice approval",snippet:"Approved — can you forward the PDF invoice to finance?",date:"Mar 1",flagged:!0},{id:"r4",sender:"AWS Billing",senderEmail:"no-reply@aws.amazon.com",subject:"Your invoice is now available",snippet:"Your total for February was $312.55 across 6 services.",date:"Feb 28",category:{label:"Finance",tone:"accent"}}],se=[{id:"r5",sender:"QuickBooks",subject:"Reminder: 2 invoices awaiting payment",snippet:"You have outstanding invoices totalling €430.00.",date:"Feb 20",category:{label:"Reminder",tone:"warning"},threadId:"thread-quickbooks",mailboxId:"mailbox-personal"},{id:"r6",sender:"noreply@vendor.io",subject:"Overdue invoice notice",snippet:"This invoice is now 14 days overdue. Please remit payment.",date:"Feb 12",category:{label:"Overdue",tone:"danger"},threadId:"thread-vendor",mailboxId:"mailbox-personal"}],C=[{id:"top",label:"Top matches",results:F}],oe=[{id:"top",label:"Top matches",results:[]}],re=[{...F[0],folder:{role:"inbox"}},{...F[1],folder:{role:"inbox"}},{id:"x1",sender:"Mollie",senderEmail:"info@mollie.com",subject:"Invoice 2026-02 — archived",snippet:"Filed last month; payment already settled.",date:"Feb 24",folder:{role:"archive"}},{id:"x2",sender:"Accountant",senderEmail:"jan@boekhouding.example",subject:"Invoices for the quarter",snippet:"The quarterly set, filed with the rest of the bookkeeping.",date:"Jan 30",folder:{providerPath:"Projects/Bookkeeping",hierarchyDelimiter:"/"}}],V=[{id:"s1",sender:"billing@unknown-vendor.test",senderEmail:"billing@unknown-vendor.test",subject:"URGENT invoice attached",snippet:"Wire the amount below within 24 hours to avoid suspension.",date:"Feb 11",folder:{role:"junk"}},{id:"s2",sender:"invoices@pay-now.test",senderEmail:"invoices@pay-now.test",subject:"Outstanding invoice — final notice",snippet:"Your account is overdue. Settle immediately.",date:"Feb 4",folder:{role:"junk"}}],I=[{id:"top",label:"Top matches",results:[...re,...V]}],ne=[{value:"in:Archive",label:"Archive",hint:"reader@example.com"},{value:"in:Inbox",label:"Inbox",hint:"reader@example.com"},{value:'in:"Sent Items"',label:"Sent Items",hint:"work@acme.test"},{value:"in:Spam",label:"Spam",hint:"reader@example.com"}],E=(a,c)=>{const w=a.slice(0,a.search(/\S*$/));return c.value.endsWith(":")?w+c.value:`${w+c.value} `};function t({initialValue:a="",initialChips:c=[],loading:w,sections:N,preset:q,scope:P,makeFilterBlockedReason:G,suggestions:T=[]}){const[O,l]=i.useState(a),[B,D]=i.useState(c),[L,A]=i.useState("all"),[Y,H]=i.useState(new Set),[z,U]=i.useState("personal"),[W,$]=i.useState(!1),[j,R]=i.useState(null),n=J({count:T.length,onAccept:s=>{const o=T[s];o&&l(r=>E(r,o))}}),K=q==="brief"?Q(ee.map(s=>({...s,active:s.id===z}))):_();return j?e.jsxs("div",{className:"flex h-full flex-col items-center justify-center gap-2 bg-canvas p-6 text-center text-sm",children:[e.jsx("p",{className:"font-semibold text-fg",children:"Opened conversation"}),e.jsx("p",{className:"text-fg-muted",children:j.subject}),e.jsxs("p",{className:"text-2xs text-fg-subtle",children:["thread ",j.threadId??"(none)"," · mailbox"," ",j.mailboxId??"(none)"]}),e.jsx("button",{type:"button",className:"mt-2 text-2xs text-accent underline",onClick:()=>R(null),children:"Back to search"})]}):e.jsx(M,{value:O,onChange:l,onClear:()=>l(""),onCancel:()=>{},chips:B,onRemoveChip:s=>D(o=>o.filter(r=>r.id!==s)),filter:{...K,selectedCategory:L,activeFilters:Y,expanded:W,onExpandedChange:$,onSelectCategory:A,onSelectSource:U,onToggleFilter:s=>H(o=>{const r=new Set(o);return r.has(s)?r.delete(s):r.add(s),r}),onClear:()=>{A("all"),H(new Set)}},recentSearches:te,onPickRecent:l,sections:N,loading:w,onSelectResult:R,scope:P,makeFilter:{onClick:()=>{},blockedReason:G},suggest:{comboboxProps:n.comboboxProps,onKeyDown:n.handleKeyDown,onCaretChange:()=>{}},suggestList:n.open?e.jsx(X,{id:n.listId,suggestions:T,activeIndex:n.activeIndex,optionId:n.optionId,onPick:s=>l(o=>E(o,s)),onHighlight:n.setActiveIndex,label:"Search suggestions",className:"mx-row-inset mt-1 shrink-0"}):null})}const _e={title:"Playground/Shipped/Mail/Search/MobileSearchView",component:M,parameters:{layout:"centered"},decorators:[Z]},d={render:()=>e.jsx(t,{initialValue:"invoice",sections:C,preset:"brief"})},p={render:()=>e.jsx(t,{initialValue:"invoice",sections:C,preset:"inbox"})},m={render:()=>e.jsx(t,{initialValue:"has:attachment",sections:C,preset:"inbox",makeFilterBlockedReason:"Has attachment isn't a filter condition — add a sender or words to filter on"})},h={render:()=>e.jsx(t,{initialValue:"in:",sections:C,preset:"inbox",suggestions:ne})},u={render:()=>e.jsx(t,{preset:"brief"})},b={render:()=>e.jsx(t,{initialValue:"asdfqwer",sections:oe,preset:"brief"})},g={render:()=>e.jsx(t,{initialValue:"invoice",loading:!0,preset:"brief"})},f={render:()=>e.jsx(t,{initialValue:"invoice",sections:[{id:"top",label:"Top matches",results:se}],preset:"brief"})},v={render:()=>e.jsx(t,{initialValue:"invoice",initialChips:[{id:"in:spam",label:"in:spam"}],sections:[{id:"top",label:"Top matches",results:V}],scope:{kind:"folder",role:"junk"},preset:"inbox"})},x={render:()=>e.jsx(t,{initialValue:"invoice",sections:I,scope:{kind:"global",onScopeToSpam:()=>{},spamCount:{kind:"exact",value:9}},preset:"brief"})},S={render:()=>e.jsx(t,{initialValue:"invoice",initialChips:[{id:"in:inbox",label:"in:inbox"}],sections:I,scope:{kind:"folder",role:"inbox"},preset:"inbox"})},y={render:()=>e.jsx(t,{initialValue:"invoice",sections:[{id:"top",label:"Top matches",results:V}],scope:{kind:"global",onScopeToSpam:()=>{},spamCount:{kind:"exact",value:2}},preset:"brief"})},k={render:()=>e.jsx(t,{initialValue:"invoice",initialChips:[{id:"is:starred",label:"is:starred"}],sections:I,scope:{kind:"collection"},preset:"brief"})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" sections={resultSections} preset="brief" />
}`,...d.parameters?.docs?.source},description:{story:`Global search — the daily-brief preset. The filter chrome is not up: a query
supersedes it, and the row above the results belongs to the conversion the
search itself offers. The header carries a single X that clears the query AND
dismisses the takeover.`,...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" sections={resultSections} preset="inbox" />
}`,...p.parameters?.docs?.source},description:{story:`Scoped search — a single inbox. It reads exactly like the global one above:
search is scoped by where the user is and differs in nothing else, so the
conversion is offered here too.`,...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="has:attachment" sections={resultSections} preset="inbox" makeFilterBlockedReason="Has attachment isn't a filter condition — add a sender or words to filter on" />
}`,...m.parameters?.docs?.source},description:{story:`A query with nothing a filter could match on: the conversion stays offered and
dimmed, rather than withheld and leaving the row to appear and vanish as the
user types. Pressing it puts the reason on screen.`,...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="in:" sections={resultSections} preset="inbox" suggestions={folderSuggestions} />
}`,...h.parameters?.docs?.source},description:{story:`A committed token name: the folders \`in:\` can name, offered under the field.

The list takes its own space between the field and the results rather than
floating over them — a soft keyboard owns the lower half of this screen, and a
list over the field would cover the query it is completing. Arrows move the
highlight, Enter takes it, Escape closes the list and leaves the query.`,...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Harness preset="brief" />
}`,...u.parameters?.docs?.source},description:{story:`Empty query: recent searches under the brief filter chrome. Nothing is being
searched, so the filter sheet has the row — typing hands it to the results.`,...u.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="asdfqwer" sections={emptySections} preset="brief" />
}`,...b.parameters?.docs?.source},description:{story:"A query that matches nothing.",...b.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" loading preset="brief" />
}`,...g.parameters?.docs?.source},description:{story:"Results still loading.",...g.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" sections={[{
    id: "top",
    label: "Top matches",
    results: unloaded
  }]} preset="brief" />
}`,...f.parameters?.docs?.source},description:{story:`Selecting a hit from outside the loaded list. These rows carry their own
thread + mailbox, so tapping one opens the conversation directly. Tap a row to
see the thread + mailbox the result hands the app to open. Regression cover for
the brief bug where a tapped result selected nothing.`,...f.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" initialChips={[{
    id: "in:spam",
    label: "in:spam"
  }]} sections={[{
    id: "top",
    label: "Top matches",
    results: spamMatches
  }]} scope={{
    kind: "folder",
    role: "junk"
  }} preset="inbox" />
}`,...v.parameters?.docs?.source},description:{story:`The narrowing expression on mobile: the same \`SearchChipInput\` the desktop
top bar uses, inside the full-screen takeover's own chrome. The chip is
removable in place — backspace at the start of the text reaches it just as it
does on desktop.

The chip and the scope say the same thing, which is the point: an \`in:spam\`
chip is what a Spam-scoped search looks like in the bar.`,...v.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" sections={acrossFoldersSections} scope={{
    kind: "global",
    onScopeToSpam: () => {},
    spamCount: {
      kind: "exact",
      value: 9
    }
  }} preset="brief" />
}`,...x.parameters?.docs?.source},description:{story:`Global search on the phone, holding spam out and offering it above the
results — the same treatment the desktop list pane gives it, because both
tiers render the one \`SearchResults\` body. Rows name the folder they came
from; the two spam matches in the same data are not among them.`,...x.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" initialChips={[{
    id: "in:inbox",
    label: "in:inbox"
  }]} sections={acrossFoldersSections} scope={{
    kind: "folder",
    role: "inbox"
  }} preset="inbox" />
}`,...S.parameters?.docs?.source},description:{story:`The same rows scoped to the inbox. No spam, no count, no offer, and no
provenance labels — the chip in the bar already says where the search is
looking.`,...S.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" sections={[{
    id: "top",
    label: "Top matches",
    results: spamMatches
  }]} scope={{
    kind: "global",
    onScopeToSpam: () => {},
    spamCount: {
      kind: "exact",
      value: 2
    }
  }} preset="brief" />
}`,...y.parameters?.docs?.source},description:{story:`A global phone search whose only matches are in Spam: the offer stands above
the empty state rather than leaving the search looking fruitless.`,...y.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Harness initialValue="invoice" initialChips={[{
    id: "is:starred",
    label: "is:starred"
  }]} sections={acrossFoldersSections} scope={{
    kind: "collection"
  }} preset="brief" />
}`,...k.parameters?.docs?.source},description:{story:`The same rows under a starred search. Starring spans folders, so the rows
keep their provenance labels, and the spam among them stays in the list — the
user starred it themselves, so there is nothing to hold back and no offer to
make.`,...k.parameters?.docs?.description}}};const Je=["GlobalSearch","ScopedSearch","NothingToConvert","SuggestingFolders","Idle","NoResults","Loading","UnloadedSelectable","ScopedByChip","GlobalAcrossFolders","ScopedToInbox","GlobalOnlySpamMatches","StarredCollection"];export{x as GlobalAcrossFolders,y as GlobalOnlySpamMatches,d as GlobalSearch,u as Idle,g as Loading,b as NoResults,m as NothingToConvert,v as ScopedByChip,p as ScopedSearch,S as ScopedToInbox,k as StarredCollection,h as SuggestingFolders,f as UnloadedSelectable,Je as __namedExportsOrder,_e as default};
