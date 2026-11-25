import{j as i}from"./iframe-4Y_dM_UU.js";import{C as c}from"./CalendarDetailsForm-BgaoBLJ9.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-Dq9rhq1I.js";import"./cn-IyxL_b2c.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./confirm-dialog-nzRXSIlS.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DGD_JTED.js";import"./dialog-backdrop-BCWOD_77.js";import"./input-BVRvisgp.js";import"./TimeZoneSelect-Ewnryet-.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./window-d5CweQa1.js";import"./schemas-KRodOHJj.js";import"./instance-DcbrR06W.js";import"./client.gen-84yaupxO.js";import"./app-info-BsoZZlWQ.js";import"./trash-q_49bOYx.js";const U={title:"Playground/Shipped/Settings/Calendars/Calendar details",component:c,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: one calendar's name and zone, and deleting it. Every
state the server can leave the form in, including its refusal to delete the
default calendar.`}}},args:{calendarName:"Work",timezone:"Europe/Amsterdam",isBusy:!1,problem:"",onSave:()=>{},onDelete:()=>{}},render:n=>i.jsx("div",{className:"max-w-xl",children:i.jsx(c,{...n})})},o={},e={args:{timezone:""}},r={args:{isBusy:!0}},t={args:{calendarName:"Default",problem:'"default" is the calendar this account files events into and cannot be removed'}},a={play:async({canvasElement:n})=>{[...n.querySelectorAll("button")].find(d=>d.textContent==="Delete calendar")?.click()}},s={parameters:{theme:"dark"}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    timezone: ""
  }
}`,...e.parameters?.docs?.source},description:{story:"No zone of its own, which reads as UTC.",...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    isBusy: true
  }
}`,...r.parameters?.docs?.source},description:{story:"A save or delete is out; every control waits.",...r.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    calendarName: "Default",
    problem: '"default" is the calendar this account files events into and cannot be removed'
  }
}`,...t.parameters?.docs?.source},description:{story:"The server refused to delete the default calendar, in its own words.",...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const buttons = [...canvasElement.querySelectorAll("button")];
    buttons.find(button => button.textContent === "Delete calendar")?.click();
  }
}`,...a.parameters?.docs?.source},description:{story:"Deleting asks first, because every event in the calendar goes with it.",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  parameters: {
    theme: "dark"
  }
}`,...s.parameters?.docs?.source},description:{story:"The same form on the dark theme.",...s.parameters?.docs?.description}}};const q=["Default","Unzoned","Busy","DeleteRefused","DeleteConfirm","Dark"];export{r as Busy,s as Dark,o as Default,a as DeleteConfirm,t as DeleteRefused,e as Unzoned,q as __namedExportsOrder,U as default};
