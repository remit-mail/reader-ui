import{j as a}from"./iframe-COEer--I.js";import{C as o}from"./calendar-task-popup-BWzLbxbx.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./calendar-event-popup-DsTocHqe.js";import"./calendar-color-CqvBY603.js";import"./pencil-B9QBJ-4U.js";import"./createLucideIcon-BvDEQKSa.js";import"./trash-2-CqeeiT_r.js";import"./x-DcmHvAZb.js";import"./map-pin-DVthVcGn.js";import"./calendar-days-BigdGwrU.js";const T={title:"Design System/Calendar/Task popup",component:o,parameters:{layout:"padded"},decorators:[s=>a.jsx("div",{className:"w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl",children:a.jsx(s,{})})],args:{headingId:"task-title",fields:{title:"Send the report",dueDate:"2026-11-05",dueTime:"",description:"The numbers for the quarter."},dueText:"Due Thursday 5 November",listName:"Tasks",completed:!1,onToggle:()=>{},onSave:()=>{},onDelete:()=>{},onClose:()=>{}}},e={},r={args:{completed:!0}},t={args:{failure:{text:"Couldn't save the task: the server didn't answer.",reportHref:"#",onRetry:()=>{}}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    completed: true
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    failure: {
      text: "Couldn't save the task: the server didn't answer.",
      reportHref: "#",
      onRetry: () => {}
    }
  }
}`,...t.parameters?.docs?.source}}};const v=["Task","Done","SaveFailed"];export{r as Done,t as SaveFailed,e as Task,v as __namedExportsOrder,T as default};
