import{j as d}from"./iframe-DUn0T08W.js";import{T as m}from"./touch-list-BTEceBft.js";import"./preload-helper-PPVm8Dsz.js";import"./swipeable-row-BKVUKi8L.js";import"./use-gesture-react.esm-CRLqyy4t.js";import"./cn-IyxL_b2c.js";import"./avatar-uqshRSnj.js";import"./message-row-I1SCnHBj.js";import"./category-presentation-4vprz89G.js";import"./keymap-dispatch-DTaqnLKC.js";import"./roving-focus-D9D6kD4K.js";import"./badge-DVSnq8Ns.js";import"./folder-role-DZ_tTsff.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CjrXUxPh.js";import"./createLucideIcon-BO9sjSGA.js";import"./file-text-a4VOwwvH.js";import"./send-DHkdV7Sh.js";import"./mails-DhngMbOi.js";import"./octagon-alert-Dmmw3E67.js";import"./trash-TQGHNCuP.js";import"./star-Cbz_ngPP.js";import"./label-chip-Dcm-1SvV.js";import"./label-color-CbbIIEbk.js";import"./message-settlement-CLH_iG7E.js";import"./cloud-off-Cae8sICe.js";import"./spam-row-marker-BFgfHVCk.js";import"./paperclip-B7J8EUUi.js";import"./shield-alert-B929ORlJ.js";import"./triangle-alert-CDC1gVbd.js";import"./check-D47ZSDJv.js";import"./mail-DoYzsxpw.js";import"./mail-open-BtvvwzYJ.js";import"./refresh-cw-BrCsMzCe.js";const c=[{id:"today",label:"Today",threads:[{id:"t1",accountId:"a1",fromName:"Priya Nair",fromEmail:"priya@example.com",subject:"Design review tomorrow",snippet:"Can we move it to 2pm? I have a conflict in the morning.",timeLabel:"8:15",isRead:!1,messageCount:3},{id:"t2",accountId:"a1",fromName:"Alex Rivera",fromEmail:"alex@example.com",subject:"Re: Q3 planning notes",snippet:"Sounds good — pushed the deck to the shared drive.",timeLabel:"9:42",isRead:!0},{id:"t3",accountId:"a1",fromName:"Dana Lopez",fromEmail:"dana@example.com",subject:"Invoice for May",snippet:"Please find the attached invoice, due end of month.",timeLabel:"Wed",isRead:!0,hasAttachment:!0}]}],H={title:"Playground/Shipped/Mail/TouchListBody",component:m,parameters:{layout:"padded"},args:{sections:c,selectionMode:!1,checkedIds:new Set,refreshing:!1,onToggleCheck:()=>{},onEnterSelection:()=>{},onOpenThread:()=>{},onRefresh:()=>{}},render:e=>d.jsx("div",{className:"flex h-[700px] w-[390px] flex-col rounded-md border border-line",children:d.jsx(m,{...e})})},s={},a={args:{refreshing:!0}},i={args:{selectionMode:!0,checkedIds:new Set(["t1","t3"])}},t={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(n=>n.id)))}},o={args:{selectionMode:!0,checkedIds:new Set}},r={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(n=>n.id))),busy:!0}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    refreshing: true
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectionMode: true,
    checkedIds: new Set(["t1", "t3"])
  }
}`,...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source},description:{story:"A bulk delete is running against the checked rows: they stay checked but\ndim, and stop responding to taps — no more opening a message that's\nmid-delete. Pairs with `SelectionTopBar`'s `DeletingWithProgress` story.",...r.parameters?.docs?.description}}};const J=["Default","Refreshing","SelectionMode","SelectionModeAllChecked","SelectionModeNoneChecked","SelectionModeBusy"];export{s as Default,a as Refreshing,i as SelectionMode,t as SelectionModeAllChecked,r as SelectionModeBusy,o as SelectionModeNoneChecked,J as __namedExportsOrder,H as default};
