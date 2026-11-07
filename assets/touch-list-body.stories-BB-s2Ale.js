import{j as d}from"./iframe-COEer--I.js";import{T as m}from"./touch-list-DTlqBNWc.js";import"./preload-helper-PPVm8Dsz.js";import"./swipeable-row-BubUippv.js";import"./use-gesture-react.esm-C_8pkfn9.js";import"./cn-d2XQ1MEC.js";import"./avatar-D5JTcjxk.js";import"./message-row-Dw_atagB.js";import"./category-presentation-BDbE0cN-.js";import"./keymap-dispatch-DTaqnLKC.js";import"./roving-focus-fDA2XJgQ.js";import"./badge-Cv_dAAay.js";import"./label-chip-1bCM6gjO.js";import"./message-settlement-BJx_CyX2.js";import"./cloud-off-pMRUlVF-.js";import"./createLucideIcon-BvDEQKSa.js";import"./shield-alert-D8DI2iSE.js";import"./star-B6_Gpkjy.js";import"./paperclip-tU3VsCC2.js";import"./check-C7HRKhEX.js";import"./mail-DqGc-bfU.js";import"./mail-open-D5ozEXVV.js";import"./trash-2-CqeeiT_r.js";import"./refresh-cw-Cz6E8LRk.js";const c=[{id:"today",label:"Today",threads:[{id:"t1",accountId:"a1",fromName:"Priya Nair",fromEmail:"priya@example.com",subject:"Design review tomorrow",snippet:"Can we move it to 2pm? I have a conflict in the morning.",timeLabel:"8:15",isRead:!1,messageCount:3},{id:"t2",accountId:"a1",fromName:"Alex Rivera",fromEmail:"alex@example.com",subject:"Re: Q3 planning notes",snippet:"Sounds good — pushed the deck to the shared drive.",timeLabel:"9:42",isRead:!0},{id:"t3",accountId:"a1",fromName:"Dana Lopez",fromEmail:"dana@example.com",subject:"Invoice for May",snippet:"Please find the attached invoice, due end of month.",timeLabel:"Wed",isRead:!0,hasAttachment:!0}]}],A={title:"Playground/Shipped/Mail/TouchListBody",component:m,parameters:{layout:"padded"},args:{sections:c,selectionMode:!1,checkedIds:new Set,refreshing:!1,onToggleCheck:()=>{},onEnterSelection:()=>{},onOpenThread:()=>{},onRefresh:()=>{}},render:e=>d.jsx("div",{className:"flex h-[700px] w-[390px] flex-col rounded-md border border-line",children:d.jsx(m,{...e})})},s={},a={args:{refreshing:!0}},n={args:{selectionMode:!0,checkedIds:new Set(["t1","t3"])}},t={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(i=>i.id)))}},o={args:{selectionMode:!0,checkedIds:new Set}},r={args:{selectionMode:!0,checkedIds:new Set(c.flatMap(e=>e.threads.map(i=>i.id))),busy:!0}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source},description:{story:"A bulk delete is running against the checked rows: they stay checked but\ndim, and stop responding to taps — no more opening a message that's\nmid-delete. Pairs with `SelectionTopBar`'s `DeletingWithProgress` story.",...r.parameters?.docs?.description}}};const D=["Default","Refreshing","SelectionMode","SelectionModeAllChecked","SelectionModeNoneChecked","SelectionModeBusy"];export{s as Default,a as Refreshing,n as SelectionMode,t as SelectionModeAllChecked,r as SelectionModeBusy,o as SelectionModeNoneChecked,D as __namedExportsOrder,A as default};
