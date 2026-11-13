import{j as d}from"./iframe-fYsS-Mr7.js";import{T as m}from"./touch-list-BS2Q-lY0.js";import"./preload-helper-PPVm8Dsz.js";import"./swipeable-row-CRYcgcaI.js";import"./use-gesture-react.esm-BeBsQnfM.js";import"./cn-IyxL_b2c.js";import"./avatar-aV0gIO8j.js";import"./message-row-DbzGo0H7.js";import"./category-presentation-4vprz89G.js";import"./keymap-dispatch-DTaqnLKC.js";import"./roving-focus-CpImUO0P.js";import"./badge-CZgi-7XL.js";import"./label-chip-h6m_g3T6.js";import"./label-color-CbbIIEbk.js";import"./message-settlement-wJ5jHxvq.js";import"./cloud-off-Bnaz2KKc.js";import"./createLucideIcon-B5J0h_XM.js";import"./spam-row-marker-CHaCsuZK.js";import"./star-j_TS7MKt.js";import"./paperclip-C3hdlHo-.js";import"./shield-alert-CC24WvU8.js";import"./triangle-alert-C5hLOYcH.js";import"./check-ClpQiEYg.js";import"./mail-CSMuoKF3.js";import"./mail-open-DdbEEvw_.js";import"./trash-CtpmnHuk.js";import"./refresh-cw-gk6LWOr6.js";const c=[{id:"today",label:"Today",threads:[{id:"t1",accountId:"a1",fromName:"Priya Nair",fromEmail:"priya@example.com",subject:"Design review tomorrow",snippet:"Can we move it to 2pm? I have a conflict in the morning.",timeLabel:"8:15",isRead:!1,messageCount:3},{id:"t2",accountId:"a1",fromName:"Alex Rivera",fromEmail:"alex@example.com",subject:"Re: Q3 planning notes",snippet:"Sounds good — pushed the deck to the shared drive.",timeLabel:"9:42",isRead:!0},{id:"t3",accountId:"a1",fromName:"Dana Lopez",fromEmail:"dana@example.com",subject:"Invoice for May",snippet:"Please find the attached invoice, due end of month.",timeLabel:"Wed",isRead:!0,hasAttachment:!0}]}],O={title:"Playground/Shipped/Mail/TouchListBody",component:m,parameters:{layout:"padded"},args:{sections:c,selectionMode:!1,checkedIds:new Set,refreshing:!1,onToggleCheck:()=>{},onEnterSelection:()=>{},onOpenThread:()=>{},onRefresh:()=>{}},render:e=>d.jsx("div",{className:"flex h-[700px] w-[390px] flex-col rounded-md border border-line",children:d.jsx(m,{...e})})},s={},a={args:{refreshing:!0}},n={args:{selectionMode:!0,checkedIds:new Set(["t1","t3"])}},t={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(i=>i.id)))}},o={args:{selectionMode:!0,checkedIds:new Set}},r={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(i=>i.id))),busy:!0}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    refreshing: true
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    selectionMode: true,
    checkedIds: new Set(["t1", "t3"])
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    selectionMode: true,
    checkedIds: new Set(sections.flatMap(section => section.threads.map(t => t.id)))
  }
}`,...t.parameters?.docs?.source},description:{story:"Every row checked — the ceiling a select-all control drives toward.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectionMode: true,
    checkedIds: new Set<string>()
  }
}`,...o.parameters?.docs?.source},description:{story:"Selection mode with nothing checked. `TouchListBody` itself has no floor —\nthe auto-exit-at-zero contract belongs to the caller (`MessageListPane`,\nproduction `MessageList.tsx`), which this component doesn't own.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selectionMode: true,
    checkedIds: new Set(sections.flatMap(section => section.threads.map(t => t.id))),
    busy: true
  }
}`,...r.parameters?.docs?.source},description:{story:"A bulk delete is running against the checked rows: they stay checked but\ndim, and stop responding to taps — no more opening a message that's\nmid-delete. Pairs with `SelectionTopBar`'s `DeletingWithProgress` story.",...r.parameters?.docs?.description}}};const W=["Default","Refreshing","SelectionMode","SelectionModeAllChecked","SelectionModeNoneChecked","SelectionModeBusy"];export{s as Default,a as Refreshing,n as SelectionMode,t as SelectionModeAllChecked,r as SelectionModeBusy,o as SelectionModeNoneChecked,W as __namedExportsOrder,O as default};
