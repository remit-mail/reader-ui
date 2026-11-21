import{j as n}from"./iframe-DUn0T08W.js";import{$ as T,a6 as f}from"./useCalendars-Bno_ukVl.js";import{w as x,P as B}from"./ChangeCalendarSuggestion-Bxz9t6Gl.js";import{a as v,c as b}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as y,j as r}from"./calendar-story-server-J9TRdhN_.js";import"./preload-helper-PPVm8Dsz.js";import"./useCalendarSuggestions-DxjvrzTF.js";import"./react-query.gen-B4habc-D.js";import"./ErrorState-CY9CR2so.js";import"./circle-alert-Dup3Hpj3.js";import"./createLucideIcon-BO9sjSGA.js";import"./useMutation-BSnD0KLu.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./list-pages-BCUbyyea.js";import"./nav-link-surface-_wSNG8Qr.js";import"./cn-IyxL_b2c.js";import"./index-BZOT5VJZ.js";import"./index-DxLbloat.js";import"./wizard-steps-qDpjPjkM.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-DNOZ3Pnr.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-bgoIUxjQ.js";import"./folder-role-DZ_tTsff.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CjrXUxPh.js";import"./file-text-a4VOwwvH.js";import"./send-DHkdV7Sh.js";import"./mails-DhngMbOi.js";import"./octagon-alert-Dmmw3E67.js";import"./trash-TQGHNCuP.js";import"./star-Cbz_ngPP.js";import"./runtime-config-aIiziXlW.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-tTG5-juQ.js";import"./calendar-failure-note-BTEAfKqu.js";import"./triangle-alert-CDC1gVbd.js";import"./calendar-suggestion-list-CTFIzEi0.js";import"./sparkles-BtLTmjcv.js";import"./event-suggestion-card-B3IuJRq2.js";import"./blocked-reason-ChjFMccJ.js";import"./button-BgYe3szE.js";import"./x-D26GNrGg.js";import"./mail-DoYzsxpw.js";import"./globe-CagDWj-T.js";import"./plus-BP0Jd8NF.js";import"./calendar-clash-strip-B6-75ZaH.js";import"./check-D47ZSDJv.js";import"./calendar-event-sidebar-C6SbKO6z.js";import"./calendar-guests-e_M6kWZe.js";import"./calendar-event-popup-Cc9BuJlo.js";import"./calendar-color-CqvBY603.js";import"./pencil-BsYDlpUX.js";import"./map-pin-DaFgrBXH.js";import"./calendar-days-EGloaown.js";import"./circle-question-mark-krPvE_RD.js";import"./event-editor-bI09WegI.js";import"./input-hGJM2SV8.js";import"./select-CiV3kovV.js";import"./chevron-down-Cg1fb-Gx.js";import"./chevron-right-D5PcmHU6.js";import"./repeat-6HJbWKxZ.js";import"./bug-report-vYCUKYUD.js";import"./app-info-BsoZZlWQ.js";import"./queryClient-C864qFkK.js";const{expect:t,userEvent:g,within:o}=__STORYBOOK_MODULE_TEST__,u="cccccccc-cccc-4ccc-8ccc-cccccccccccc",p=(a={})=>({suggestionId:u,accountConfigId:"cfg-1",messageId:"msg-1",bodyPartId:"part-1",icalUid:"uid-kickoff",sequence:0,method:"Request",source:"IcalendarPart",state:"Pending",summary:"Billing migration kickoff",dtStart:"2026-06-11T14:00:00+02:00",dtEnd:"2026-06-11T15:00:00+02:00",endsAtUtc:"2026-06-11T13:00:00Z",allDay:!1,location:"Room Noord",organizer:"priya@example.invalid",zoneCertainty:"Explicit",acceptedCalendarObjectId:"",supersededByMessageId:"",supersededByThreadId:"",createdAt:0,updatedAt:0,answerOvertakenBy:"None",...a}),w=a=>e=>{const i=new URL(e.url);return i.pathname.endsWith("/calendars")?r({items:b}):i.pathname.endsWith("/calendar-suggestions")?r({items:a}):i.pathname.endsWith("/accept")?r({...a[0],state:"Accepted"}):r({items:[]})};function h(){const{changeSuggestionFirst:a,closeToView:e}=T(),i=f();return n.jsxs("div",{className:"flex h-dvh bg-canvas",children:[n.jsx(B,{onChangeFirst:a}),n.jsx("div",{className:"min-w-0 flex-1 border-l border-line",children:i!==void 0&&n.jsx(x,{suggestionId:i,onClose:e})})]})}function E({pending:a,openedFrom:e="address"}){return e==="card"?n.jsx(y,{entry:v,server:w(a),pane:n.jsx(h,{})}):n.jsx("div",{className:"h-dvh max-w-2xl border-l border-line bg-canvas",children:n.jsx(y,{entry:`${v}/suggestion/${u}`,server:w(a),pane:n.jsx(x,{suggestionId:u,onClose:()=>{}})})})}const _e={title:"Playground/Shipped/Calendar/Change a suggestion first",component:E,parameters:{layout:"fullscreen"}},s={args:{pending:[p()]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11"),await t(e.getByRole("button",{name:"Add"})).toBeVisible()}},c={args:{pending:[p({dtStart:"2026-06-11T09:00:00+00:00",dtEnd:"2026-06-11T10:00:00+00:00",endsAtUtc:"2026-06-11T10:00:00Z",zoneCertainty:"Ambiguous"})]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Start time")).toHaveValue("09:00"),await t(e.getByText(/named a time zone nothing could resolve/)).toBeVisible()}},l={args:{pending:[]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByText(/no longer waiting on you/)).toBeVisible()}},m={args:{pending:[p()]},play:async({canvasElement:a})=>{const e=o(a),i=await e.findByLabelText("Title");await g.clear(i),await g.click(e.getByRole("button",{name:"Add"})),await t(await e.findByRole("alert")).toHaveTextContent("Give the event a title")}},d={args:{pending:[p()],openedFrom:"card"},globals:{viewport:{value:"desktop"}},play:async({canvasElement:a})=>{const e=o(a);await g.click(await e.findByRole("button",{name:"Change first"})),await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};const Fe=["SeededFromTheMail","ZoneNobodyCouldPlace","NoLongerWaiting","SaysWhatIsMissing","OpenedFromTheWaitingCard"];export{l as NoLongerWaiting,d as OpenedFromTheWaitingCard,m as SaysWhatIsMissing,s as SeededFromTheMail,c as ZoneNobodyCouldPlace,Fe as __namedExportsOrder,_e as default};
