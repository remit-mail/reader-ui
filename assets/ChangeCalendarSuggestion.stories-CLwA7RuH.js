import{j as n}from"./iframe-fYsS-Mr7.js";import{$ as T,a6 as f}from"./useCalendars-Cbd3Binc.js";import{w as x,P as B}from"./ChangeCalendarSuggestion-CYsJJ_-f.js";import{a as v,c as b}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as y,j as r}from"./calendar-story-server-BcFZ7H_I.js";import"./preload-helper-PPVm8Dsz.js";import"./useCalendarSuggestions-DvWNa7Q8.js";import"./react-query.gen-B1_4DilO.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./createLucideIcon-B5J0h_XM.js";import"./useMutation-BWoFIWmj.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./nav-link-surface-Bcna85LV.js";import"./cn-IyxL_b2c.js";import"./index-DbNRduy1.js";import"./index-BNekr84Q.js";import"./wizard-steps-qDpjPjkM.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-CbqKfMFy.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-DTwR-V5R.js";import"./folder-role-CjJrjS2E.js";import"./folder-tree-ZE9Jqoy_.js";import"./inbox-vF0NtWrK.js";import"./file-text-ByqS7Kt2.js";import"./send-C4SeWUwb.js";import"./mails-hVcCx1jX.js";import"./octagon-alert-DwiO4oVu.js";import"./trash-CtpmnHuk.js";import"./star-j_TS7MKt.js";import"./runtime-config-aIiziXlW.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-CQjzh2Y9.js";import"./calendar-failure-note-yrQatvg_.js";import"./triangle-alert-C5hLOYcH.js";import"./calendar-suggestion-list-1B1pDz5T.js";import"./sparkles-tBYydyJD.js";import"./event-suggestion-card-DoyfbFTH.js";import"./blocked-reason--dVpmaO7.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./mail-CSMuoKF3.js";import"./globe-DMBwvAOE.js";import"./plus-BgwexbCS.js";import"./calendar-clash-strip-15mhh4pl.js";import"./check-ClpQiEYg.js";import"./calendar-event-sidebar-l5u6Ntmf.js";import"./calendar-guests-DVgYafyj.js";import"./calendar-event-popup-CW1gBa5q.js";import"./calendar-color-CqvBY603.js";import"./pencil-D4Z2Ugdp.js";import"./map-pin-N9se7Rv0.js";import"./calendar-days-Bsdw_fPO.js";import"./circle-question-mark-hVJ2st9V.js";import"./event-editor-CFVlBY0k.js";import"./input-Ejju9bJ0.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./chevron-right-Fk7PhnMq.js";import"./repeat-DUzgTyc4.js";import"./bug-report-vYCUKYUD.js";import"./app-info-BsoZZlWQ.js";import"./queryClient-ClMo2LzF.js";const{expect:t,userEvent:g,within:o}=__STORYBOOK_MODULE_TEST__,u="cccccccc-cccc-4ccc-8ccc-cccccccccccc",p=(a={})=>({suggestionId:u,accountConfigId:"cfg-1",messageId:"msg-1",bodyPartId:"part-1",icalUid:"uid-kickoff",sequence:0,method:"Request",source:"IcalendarPart",state:"Pending",summary:"Billing migration kickoff",dtStart:"2026-06-11T14:00:00+02:00",dtEnd:"2026-06-11T15:00:00+02:00",endsAtUtc:"2026-06-11T13:00:00Z",allDay:!1,location:"Room Noord",organizer:"priya@example.invalid",zoneCertainty:"Explicit",acceptedCalendarObjectId:"",supersededByMessageId:"",supersededByThreadId:"",createdAt:0,updatedAt:0,answerOvertakenBy:"None",...a}),w=a=>e=>{const i=new URL(e.url);return i.pathname.endsWith("/calendars")?r({items:b}):i.pathname.endsWith("/calendar-suggestions")?r({items:a}):i.pathname.endsWith("/accept")?r({...a[0],state:"Accepted"}):r({items:[]})};function h(){const{changeSuggestionFirst:a,closeToView:e}=T(),i=f();return n.jsxs("div",{className:"flex h-dvh bg-canvas",children:[n.jsx(B,{onChangeFirst:a}),n.jsx("div",{className:"min-w-0 flex-1 border-l border-line",children:i!==void 0&&n.jsx(x,{suggestionId:i,onClose:e})})]})}function E({pending:a,openedFrom:e="address"}){return e==="card"?n.jsx(y,{entry:v,server:w(a),pane:n.jsx(h,{})}):n.jsx("div",{className:"h-dvh max-w-2xl border-l border-line bg-canvas",children:n.jsx(y,{entry:`${v}/suggestion/${u}`,server:w(a),pane:n.jsx(x,{suggestionId:u,onClose:()=>{}})})})}const Oe={title:"Playground/Shipped/Calendar/Change a suggestion first",component:E,parameters:{layout:"fullscreen"}},s={args:{pending:[p()]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11"),await t(e.getByRole("button",{name:"Add"})).toBeVisible()}},c={args:{pending:[p({dtStart:"2026-06-11T09:00:00+00:00",dtEnd:"2026-06-11T10:00:00+00:00",endsAtUtc:"2026-06-11T10:00:00Z",zoneCertainty:"Ambiguous"})]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Start time")).toHaveValue("09:00"),await t(e.getByText(/named a time zone nothing could resolve/)).toBeVisible()}},l={args:{pending:[]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByText(/no longer waiting on you/)).toBeVisible()}},m={args:{pending:[p()]},play:async({canvasElement:a})=>{const e=o(a),i=await e.findByLabelText("Title");await g.clear(i),await g.click(e.getByRole("button",{name:"Add"})),await t(await e.findByRole("alert")).toHaveTextContent("Give the event a title")}},d={args:{pending:[p()],openedFrom:"card"},globals:{viewport:{value:"desktop"}},play:async({canvasElement:a})=>{const e=o(a);await g.click(await e.findByRole("button",{name:"Change first"})),await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    pending: [suggestion()]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Title")).toHaveValue("Billing migration kickoff");
    await expect(canvas.getByLabelText("Location")).toHaveValue("Room Noord");
    await expect(canvas.getByLabelText("Date")).toHaveValue("2026-06-11");
    await expect(canvas.getByRole("button", {
      name: "Add"
    })).toBeVisible();
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    pending: [suggestion({
      dtStart: "2026-06-11T09:00:00+00:00",
      dtEnd: "2026-06-11T10:00:00+00:00",
      endsAtUtc: "2026-06-11T10:00:00Z",
      zoneCertainty: "Ambiguous"
    })]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Start time")).toHaveValue("09:00");
    await expect(canvas.getByText(/named a time zone nothing could resolve/)).toBeVisible();
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    pending: []
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/no longer waiting on you/)).toBeVisible();
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    pending: [suggestion()]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByLabelText("Title");
    await userEvent.clear(title);
    await userEvent.click(canvas.getByRole("button", {
      name: "Add"
    }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Give the event a title");
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    pending: [suggestion()],
    openedFrom: "card"
  },
  globals: {
    viewport: {
      value: "desktop"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", {
      name: "Change first"
    }));
    await expect(await canvas.findByLabelText("Title")).toHaveValue("Billing migration kickoff");
    await expect(canvas.getByLabelText("Location")).toHaveValue("Room Noord");
    await expect(canvas.getByLabelText("Date")).toHaveValue("2026-06-11");
  }
}`,...d.parameters?.docs?.source}}};const _e=["SeededFromTheMail","ZoneNobodyCouldPlace","NoLongerWaiting","SaysWhatIsMissing","OpenedFromTheWaitingCard"];export{l as NoLongerWaiting,d as OpenedFromTheWaitingCard,m as SaysWhatIsMissing,s as SeededFromTheMail,c as ZoneNobodyCouldPlace,_e as __namedExportsOrder,Oe as default};
