import{j as i}from"./iframe-fYsS-Mr7.js";import{C as c}from"./CalendarDetailsForm-DKF6q4ZI.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-2MU9qEbR.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./confirm-dialog-CiVQifnw.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";import"./input-Ejju9bJ0.js";import"./TimeZoneSelect-D4e3_7OG.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./useCalendarSuggestions-DvWNa7Q8.js";import"./react-query.gen-B1_4DilO.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./useMutation-BWoFIWmj.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./trash-CtpmnHuk.js";const F={title:"Playground/Shipped/Settings/Calendars/Calendar details",component:c,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: one calendar's name and zone, and deleting it. Every
state the server can leave the form in, including its refusal to delete the
default calendar.`}}},args:{calendarName:"Work",timezone:"Europe/Amsterdam",isBusy:!1,problem:"",onSave:()=>{},onDelete:()=>{}},render:n=>i.jsx("div",{className:"max-w-xl",children:i.jsx(c,{...n})})},s={},e={args:{timezone:""}},r={args:{isBusy:!0}},t={args:{calendarName:"Default",problem:'"default" is the calendar this account files events into and cannot be removed'}},a={play:async({canvasElement:n})=>{[...n.querySelectorAll("button")].find(d=>d.textContent==="Delete calendar")?.click()}},o={parameters:{theme:"dark"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:"Deleting asks first, because every event in the calendar goes with it.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  parameters: {
    theme: "dark"
  }
}`,...o.parameters?.docs?.source},description:{story:"The same form on the dark theme.",...o.parameters?.docs?.description}}};const O=["Default","Unzoned","Busy","DeleteRefused","DeleteConfirm","Dark"];export{r as Busy,o as Dark,s as Default,a as DeleteConfirm,t as DeleteRefused,e as Unzoned,O as __namedExportsOrder,F as default};
