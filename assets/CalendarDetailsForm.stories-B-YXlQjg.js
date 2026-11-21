import{j as i}from"./iframe-DUn0T08W.js";import{C as c}from"./CalendarDetailsForm-BzP73FEr.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-CekMrGzb.js";import"./cn-IyxL_b2c.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./createLucideIcon-BO9sjSGA.js";import"./confirm-dialog-DG-UJVzd.js";import"./overlay-scope-DZGXhrsM.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DrKfWaG3.js";import"./dialog-backdrop-BfHibv1P.js";import"./input-hGJM2SV8.js";import"./TimeZoneSelect-TqFIyePS.js";import"./select-CiV3kovV.js";import"./chevron-down-Cg1fb-Gx.js";import"./useCalendarSuggestions-DxjvrzTF.js";import"./react-query.gen-B4habc-D.js";import"./ErrorState-CY9CR2so.js";import"./circle-alert-Dup3Hpj3.js";import"./useMutation-BSnD0KLu.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./list-pages-BCUbyyea.js";import"./trash-TQGHNCuP.js";const O={title:"Playground/Shipped/Settings/Calendars/Calendar details",component:c,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: one calendar's name and zone, and deleting it. Every
state the server can leave the form in, including its refusal to delete the
default calendar.`}}},args:{calendarName:"Work",timezone:"Europe/Amsterdam",isBusy:!1,problem:"",onSave:()=>{},onDelete:()=>{}},render:n=>i.jsx("div",{className:"max-w-xl",children:i.jsx(c,{...n})})},s={},e={args:{timezone:""}},r={args:{isBusy:!0}},t={args:{calendarName:"Default",problem:'"default" is the calendar this account files events into and cannot be removed'}},a={play:async({canvasElement:n})=>{[...n.querySelectorAll("button")].find(m=>m.textContent==="Delete calendar")?.click()}},o={parameters:{theme:"dark"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source},description:{story:"The same form on the dark theme.",...o.parameters?.docs?.description}}};const P=["Default","Unzoned","Busy","DeleteRefused","DeleteConfirm","Dark"];export{r as Busy,o as Dark,s as Default,a as DeleteConfirm,t as DeleteRefused,e as Unzoned,P as __namedExportsOrder,O as default};
