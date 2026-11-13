import{j as v}from"./iframe-fYsS-Mr7.js";import{C as b}from"./CalendarDetailsForm-DKF6q4ZI.js";import{C as y}from"./CalendarFeedCard-Drk0aZsz.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-2MU9qEbR.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./confirm-dialog-CiVQifnw.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";import"./input-Ejju9bJ0.js";import"./TimeZoneSelect-D4e3_7OG.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./useCalendarSuggestions-DvWNa7Q8.js";import"./react-query.gen-B1_4DilO.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./useMutation-BWoFIWmj.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./trash-CtpmnHuk.js";import"./badge-CZgi-7XL.js";import"./card-D_7pcfRT.js";import"./format-CIELvwEW.js";import"./enums-CyACTv6m.js";import"./refresh-cw-gk6LWOr6.js";import"./check-ClpQiEYg.js";import"./copy-Bu_DPTpH.js";const re={title:"Playground/Shipped/Settings/Calendars/Subscription address",component:y,parameters:{layout:"padded",docs:{description:{component:`Settings › Calendars: the per-calendar subscription address (#1067). Every
state the server can put the control in, including the one moment the address
is legible and the two confirmations that take it away.`}}},args:{calendarName:"Work",mintedUrl:"",isBusy:!1,actionError:void 0,onMint:()=>{},onRevoke:()=>{},onDismissMinted:()=>{},onRetry:()=>{}}},e=Date.parse("2026-05-04T09:12:00Z"),E=Date.parse("2026-08-19T16:40:00Z"),A="webcal://mail.example.com/feeds/calendar/9Xq2mB7tK1vHs4dLpZ0rY6wJfN3aC8eQuIoT5gRbVkE.ics",t={args:{state:{status:"loading"}}},r={args:{state:{status:"absent"}}},a={args:{state:{status:"absent"},isBusy:!0}},s={args:{state:{status:"active",createdAt:e,rotatedAt:0}}},n={name:"Shared (dark)",parameters:{theme:"dark"},args:{state:{status:"active",createdAt:e,rotatedAt:0}}},o={args:{state:{status:"active",createdAt:e,rotatedAt:E}}},d={args:{state:{status:"active",createdAt:e,rotatedAt:0},mintedUrl:A}},i={name:"Address shown once (dark)",parameters:{theme:"dark"},args:{state:{status:"active",createdAt:e,rotatedAt:0},mintedUrl:A}},c={args:{state:{status:"active",createdAt:e,rotatedAt:0}},play:async({canvasElement:h})=>{[...h.querySelectorAll("button")].find(g=>g.textContent==="Replace address")?.click()}},p={args:{state:{status:"active",createdAt:e,rotatedAt:0}},play:async({canvasElement:h})=>{[...h.querySelectorAll("button")].find(g=>g.textContent==="Stop sharing")?.click()}},m={args:{state:{status:"absent"},actionError:new Error("Calendar not found")}},u={args:{state:{status:"unreadable",error:new Error("Service unavailable")}}},l={args:{state:{status:"active",createdAt:e,rotatedAt:0},details:v.jsx(b,{calendarName:"Work",timezone:"Europe/Amsterdam",isBusy:!1,problem:"",onSave:()=>{},onDelete:()=>{}})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "loading"
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"The read is still out — no control has an answer to draw yet.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "absent"
    }
  }
}`,...r.parameters?.docs?.source},description:{story:"Not shared. The one control creates the address, and says what it is.",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "absent"
    },
    isBusy: true
  }
}`,...a.parameters?.docs?.source},description:{story:"The create is in flight.",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    }
  }
}`,...s.parameters?.docs?.source},description:{story:"Shared, on an address that has never been replaced.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Shared (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    }
  }
}`,...n.parameters?.docs?.source},description:{story:"Shared, on the dark theme.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: ROTATED
    }
  }
}`,...o.parameters?.docs?.source},description:{story:"Shared on an address that has been replaced since it was first created.",...o.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    },
    mintedUrl: ADDRESS
  }
}`,...d.parameters?.docs?.source},description:{story:`The one moment the address is readable: straight after the write that minted
it. It is not stored in the clear, so nothing can show it again.`,...d.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Address shown once (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    },
    mintedUrl: ADDRESS
  }
}`,...i.parameters?.docs?.source},description:{story:"The same, on the dark theme.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    }
  },
  play: async ({
    canvasElement
  }) => {
    const buttons = [...canvasElement.querySelectorAll("button")];
    buttons.find(button => button.textContent === "Replace address")?.click();
  }
}`,...c.parameters?.docs?.source},description:{story:"Replacing the address warns that the current one stops working.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    }
  },
  play: async ({
    canvasElement
  }) => {
    const buttons = [...canvasElement.querySelectorAll("button")];
    buttons.find(button => button.textContent === "Stop sharing")?.click();
  }
}`,...p.parameters?.docs?.source},description:{story:"Revoking says the address stops working immediately.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "absent"
    },
    actionError: new Error("Calendar not found")
  }
}`,...m.parameters?.docs?.source},description:{story:"The write was refused. The card says so where the button is.",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "unreadable",
      error: new Error("Service unavailable")
    }
  }
}`,...u.parameters?.docs?.source},description:{story:`The read itself failed. Not drawn as "not shared": a calendar the server
would not answer for may well be shared with somebody right now.`,...u.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: "active",
      createdAt: CREATED,
      rotatedAt: 0
    },
    details: <CalendarDetailsForm calendarName="Work" timezone="Europe/Amsterdam" isBusy={false} problem="" onSave={() => undefined} onDelete={() => undefined} />
  }
}`,...l.parameters?.docs?.source},description:{story:"The whole card as the settings page draws it: details above the address.",...l.parameters?.docs?.description}}};const ae=["Loading","NotShared","Creating","Shared","SharedDark","SharedAfterRotation","AddressShownOnce","AddressShownOnceDark","RotateConfirm","RevokeConfirm","WriteRefused","Unreadable","WithDetails"];export{d as AddressShownOnce,i as AddressShownOnceDark,a as Creating,t as Loading,r as NotShared,p as RevokeConfirm,c as RotateConfirm,s as Shared,o as SharedAfterRotation,n as SharedDark,u as Unreadable,l as WithDetails,m as WriteRefused,ae as __namedExportsOrder,re as default};
