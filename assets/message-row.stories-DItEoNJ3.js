import{j as e}from"./iframe-4Y_dM_UU.js";import{C as r,a as b}from"./message-row-DXa1xRZL.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-4vprz89G.js";import"./cn-IyxL_b2c.js";import"./keymap-dispatch-DTaqnLKC.js";import"./roving-focus-Bod4bgAv.js";import"./avatar-VuE91yj1.js";import"./badge-BALHcx9W.js";import"./folder-role-CvPdLVqM.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CvUF9C2g.js";import"./createLucideIcon-DkKJcbI9.js";import"./file-text-BmCePHPh.js";import"./send-CbUYJmgX.js";import"./mails-ChqgPF6O.js";import"./octagon-alert-ChID51gq.js";import"./trash-q_49bOYx.js";import"./star-DJsZr7L-.js";import"./label-chip-BdNnltY-.js";import"./label-color-CbbIIEbk.js";import"./message-settlement-DECQUpsr.js";import"./cloud-off-BlLYV7QF.js";import"./spam-row-marker-frlPmoPM.js";import"./paperclip-BDaaYwmP.js";import"./shield-alert--T5XA0yY.js";import"./triangle-alert-Bnrh-J2F.js";import"./check-DSdQDF54.js";const f={id:"r-read",accountId:"a1",fromName:"Alex Rivera",fromEmail:"alex@example.com",subject:"Re: Q3 planning notes",snippet:"Sounds good — I pushed the deck to the shared drive.",timeLabel:"9:42",isRead:!0},w={id:"r-unread",accountId:"a1",fromName:"Priya Nair",fromEmail:"priya@example.com",subject:"Design review tomorrow",snippet:"Can we move it to 2pm? I have a conflict in the morning.",timeLabel:"8:15",isRead:!1,messageCount:3},y={id:"r-starred",accountId:"a1",fromName:"Sam Okafor",fromEmail:"sam@example.com",subject:"Contract signed",snippet:"Attaching the countersigned PDF for your records.",timeLabel:"Mon",isRead:!0,starred:!0},L={id:"r-suspected",accountId:"a1",fromName:"Account Security",fromEmail:"no-reply@secure-update.example",subject:"Verify your account immediately",snippet:"Your account will be suspended unless you confirm now.",timeLabel:"Tue",isRead:!1,spam:{label:{labelId:"label-phishing",name:"Phishing",color:"Red"},suspected:!0}},R={...L,id:"r-suspected-inbox",folder:{role:"inbox"}},j={id:"r-attachment",accountId:"a1",fromName:"Dana Lopez",fromEmail:"dana@example.com",subject:"Invoice for May",snippet:"Please find the attached invoice, due end of month.",timeLabel:"Wed",isRead:!0,hasAttachment:!0},x={id:"r-category",accountId:"a1",fromName:"The Weekly Brief",fromEmail:"hello@weekly.example",subject:"This week in product",snippet:"Five stories you might have missed this week.",timeLabel:"Thu",isRead:!1,category:"newsletter"},I={id:"r-no-label",accountId:"a1",fromName:"Jordan Lee",fromEmail:"jordan@example.com",subject:"Lunch on Friday?",snippet:"Thinking the usual place, around noon.",timeLabel:"10:03",isRead:!0},S={id:"r-one-label",accountId:"a1",fromName:"Stripe",fromEmail:"receipts@stripe.com",subject:"Your receipt from Acme Co",snippet:"Payment of $42.00 was successful.",timeLabel:"9:10",isRead:!0,labels:[{labelId:"l1",name:"Receipts",color:"Blue"}]},T={id:"r-two-labels",accountId:"a1",fromName:"United Airlines",fromEmail:"noreply@united.com",subject:"Your itinerary for SFO → JFK",snippet:"Check-in opens 24 hours before departure.",timeLabel:"Yesterday",isRead:!1,labels:[{labelId:"l1",name:"Receipts",color:"Blue"},{labelId:"l2",name:"Travel",color:"Green"}]},D={id:"r-several-labels",accountId:"a1",fromName:"Finance Team",fromEmail:"finance@example.com",subject:"Q3 budget review — action needed",snippet:"Please review the attached numbers before Thursday.",timeLabel:"Mon",isRead:!1,labels:[{labelId:"l1",name:"Receipts",color:"Blue"},{labelId:"l2",name:"Travel",color:"Green"},{labelId:"l3",name:"Urgent",color:"Red"},{labelId:"l4",name:"Work",color:"Purple"}]},F={id:"r-long-label",accountId:"a1",fromName:"Compliance",fromEmail:"compliance@example.com",subject:"Filing due end of quarter",snippet:"One outstanding item on the checklist.",timeLabel:"Tue",isRead:!0,labels:[{labelId:"l5",name:"Quarterly compliance filings that need a second look",color:"Purple"}]},C={id:"r-delete-failed",accountId:"a1",fromName:"Tomas Berg",fromEmail:"tomas@example.com",subject:"Signed lease, final version",snippet:"Deleted here; Remit refused to finish it and the row came back.",timeLabel:"Mon",isRead:!1,settlement:"delete_failed"},N={...C,id:"r-delete-failed-labels",category:"newsletter",labels:[{labelId:"l1",name:"Receipts",color:"Blue"}]},E={id:"r-move-failed",accountId:"a1",fromName:"Wren Adeyemi",fromEmail:"wren@example.com",subject:"Q3 filing, countersigned",snippet:"Filed here; Remit stopped trying to finish the move on the server.",timeLabel:"Fri",isRead:!1,settlement:"move_failed"},k=[C,N,E,f],g=[I,S,T,D,F],v=[f,w,y,L,j,x],ie={title:"Design System/Mail/MessageRow",parameters:{layout:"padded"}},t=({children:a})=>e.jsx("div",{className:"w-md divide-y divide-line rounded-md border border-line",children:a}),p={render:()=>e.jsx(t,{children:v.map(a=>e.jsx(r,{thread:a},a.id))})},h={render:()=>e.jsx(t,{children:v.map(a=>e.jsx(b,{thread:a},a.id))})},u={render:()=>e.jsxs(t,{children:[e.jsx(r,{thread:w,active:!0}),e.jsx(r,{thread:f,focused:!0}),e.jsx(r,{thread:y}),e.jsx(r,{thread:L}),e.jsx(r,{thread:R})]})},o={render:()=>e.jsxs(t,{children:[e.jsx(r,{thread:w,selection:{checked:!0,onToggle:()=>{}}}),e.jsx(r,{thread:f,selection:{checked:!1,onToggle:()=>{}}}),e.jsx(r,{thread:y,selection:{checked:!1,alwaysVisible:!0,onToggle:()=>{}}}),e.jsx(r,{thread:x})]})},s={render:()=>e.jsx(t,{children:g.map(a=>e.jsx(r,{thread:a},a.id))})},n={name:"Comfortable Labels (dark)",parameters:{theme:"dark"},render:()=>e.jsx(t,{children:g.map(a=>e.jsx(r,{thread:a},a.id))})},d={render:()=>e.jsx(t,{children:g.map(a=>e.jsx(b,{thread:a},a.id))})},i={name:"Compact Labels (dark)",parameters:{theme:"dark"},render:()=>e.jsx(t,{children:g.map(a=>e.jsx(b,{thread:a},a.id))})},l={render:()=>e.jsx(t,{children:k.map(a=>e.jsx(r,{thread:a},a.id))})},m={name:"Delete failed (dark)",parameters:{theme:"dark"},render:()=>e.jsx(t,{children:k.map(a=>e.jsx(r,{thread:a},a.id))})},c={name:"Delete failed (compact)",render:()=>e.jsx(t,{children:k.map(a=>e.jsx(b,{thread:a},a.id))})};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            {all.map(thread => <ComfortableRow key={thread.id} thread={thread} />)}
        </List>
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            {all.map(thread => <CompactRow key={thread.id} thread={thread} />)}
        </List>
}`,...h.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            <ComfortableRow thread={unread} active />
            <ComfortableRow thread={read} focused />
            <ComfortableRow thread={starred} />
            <ComfortableRow thread={suspected} />
            <ComfortableRow thread={suspectedInInbox} />
        </List>
}`,...u.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            <ComfortableRow thread={unread} selection={{
      checked: true,
      onToggle: () => undefined
    }} />
            <ComfortableRow thread={read} selection={{
      checked: false,
      onToggle: () => undefined
    }} />
            <ComfortableRow thread={starred} selection={{
      checked: false,
      alwaysVisible: true,
      onToggle: () => undefined
    }} />
            <ComfortableRow thread={withCategory} />
        </List>
}`,...o.parameters?.docs?.source},description:{story:`Selectable rows. The checkbox layers over the avatar: hidden until hover
while unchecked, pinned visible once checked or while the list is in
multi-select mode. A row rendered without \`selection\` — the brief and
Flagged before they gained selection — shows the avatar alone.`,...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            {labeled.map(thread => <ComfortableRow key={thread.id} thread={thread} />)}
        </List>
}`,...s.parameters?.docs?.source},description:{story:`Labels (issue #26) alongside the existing read/unread, attachment and
category affordances — no label, one, two, several, and a long name that
truncates rather than growing the row. Comfortable density renders the
chips; compact does not (see \`CompactLabels\` below).`,...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Comfortable Labels (dark)",
  parameters: {
    theme: "dark"
  },
  render: () => <List>
            {labeled.map(thread => <ComfortableRow key={thread.id} thread={thread} />)}
        </List>
}`,...n.parameters?.docs?.source},description:{story:"The same labeled threads on the dark theme.",...n.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            {labeled.map(thread => <CompactRow key={thread.id} thread={thread} />)}
        </List>
}`,...d.parameters?.docs?.source},description:{story:"The same labeled threads in compact density. `CompactRowBody` carries no\nlabel rendering today — this documents that as the approved current\nbehavior, not an oversight in the story.",...d.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Compact Labels (dark)",
  parameters: {
    theme: "dark"
  },
  render: () => <List>
            {labeled.map(thread => <CompactRow key={thread.id} thread={thread} />)}
        </List>
}`,...i.parameters?.docs?.source},description:{story:"Compact density, dark theme.",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <List>
            {unsettled.map(thread => <ComfortableRow key={thread.id} thread={thread} />)}
        </List>
}`,...l.parameters?.docs?.source},description:{story:`A row whose delete Remit abandoned (issue #1002): it was removed here, then
refused before it reached the server, so the message came back to the folder
the server still has it in. The only unsettled state the wire can prove — a
move that gave up leaves the same fields a move mid-retry leaves, so it gets
no chip. The chip names the state; the open message carries the statement, a
working Delete again, and the report link (\`MessageSettlementNotice\`).`,...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Delete failed (dark)",
  parameters: {
    theme: "dark"
  },
  render: () => <List>
            {unsettled.map(thread => <ComfortableRow key={thread.id} thread={thread} />)}
        </List>
}`,...m.parameters?.docs?.source},description:{story:"The same rows on the dark theme.",...m.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Delete failed (compact)",
  render: () => <List>
            {unsettled.map(thread => <CompactRow key={thread.id} thread={thread} />)}
        </List>
}`,...c.parameters?.docs?.source},description:{story:"Compact density carries the same chip.",...c.parameters?.docs?.description}}};const le=["Comfortable","Compact","States","Selectable","ComfortableLabels","ComfortableLabelsDark","CompactLabels","CompactLabelsDark","DeleteFailed","DeleteFailedDark","DeleteFailedCompact"];export{p as Comfortable,s as ComfortableLabels,n as ComfortableLabelsDark,h as Compact,d as CompactLabels,i as CompactLabelsDark,l as DeleteFailed,c as DeleteFailedCompact,m as DeleteFailedDark,o as Selectable,u as States,le as __namedExportsOrder,ie as default};
