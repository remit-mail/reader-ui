import{j as n}from"./iframe-4Y_dM_UU.js";import{a2 as T,a9 as f}from"./useCalendarEvents-BsWCW4Ds.js";import{y as x,P as B}from"./ChangeCalendarSuggestion-ptwNMDSS.js";import{a as v,c as b}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as y,j as r}from"./calendar-story-server-BoObz3YW.js";import"./preload-helper-PPVm8Dsz.js";import"./window-d5CweQa1.js";import"./schemas-KRodOHJj.js";import"./nav-link-surface-CjkqJ6hT.js";import"./cn-IyxL_b2c.js";import"./index-B3CIJJ7_.js";import"./index-DhYErdGu.js";import"./wizard-steps-M1TSt1Tg.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-BMdCP2iF.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-D0LgLPS6.js";import"./folder-role-CvPdLVqM.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CvUF9C2g.js";import"./createLucideIcon-DkKJcbI9.js";import"./file-text-BmCePHPh.js";import"./send-CbUYJmgX.js";import"./mails-ChqgPF6O.js";import"./octagon-alert-ChID51gq.js";import"./trash-q_49bOYx.js";import"./star-DJsZr7L-.js";import"./react-query.gen-C52jVGEN.js";import"./client.gen-84yaupxO.js";import"./instance-DcbrR06W.js";import"./app-info-BsoZZlWQ.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-CB2TKzXm.js";import"./calendar-failure-note-B5iSFSZg.js";import"./triangle-alert-Bnrh-J2F.js";import"./calendar-suggestion-list-pAjvbmY2.js";import"./sparkles-D_Q6aOk4.js";import"./event-suggestion-card-D3cC6pKk.js";import"./blocked-reason-THUdDQwz.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./mail-1N_4GVps.js";import"./globe-CVBGglCM.js";import"./plus-PRuHRyZn.js";import"./calendar-clash-strip-Bat4ioKM.js";import"./check-DSdQDF54.js";import"./calendar-event-sidebar-hLK_p-bE.js";import"./calendar-guests-Bx8s5IcP.js";import"./calendar-event-popup-MvRaIgRY.js";import"./calendar-color-CqvBY603.js";import"./pencil-CXAxDKIq.js";import"./map-pin-CE8Z3xzB.js";import"./calendar-days-hBuBL6bE.js";import"./circle-question-mark-EomEsxf1.js";import"./event-editor-N-ZAxL1L.js";import"./input-BVRvisgp.js";import"./select-ddVD-RDW.js";import"./chevron-down-qwKh9shH.js";import"./chevron-right-DdPAKdYb.js";import"./repeat-CyVMIsMy.js";import"./ErrorState-DI525bMD.js";import"./circle-alert-Z6J3DHRJ.js";import"./useMutation-DOEmXLBu.js";import"./list-pages-BCUbyyea.js";import"./bug-report-Ca4X2TPn.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./queryClient-B-_Q6x1O.js";import"./client-BpBKSbyE.js";import"./api-BX6GFMBA.js";import"./network-error-tuI5IsFH.js";const{expect:t,userEvent:g,within:o}=__STORYBOOK_MODULE_TEST__,u="cccccccc-cccc-4ccc-8ccc-cccccccccccc",d=(a={})=>({suggestionId:u,accountConfigId:"cfg-1",messageId:"msg-1",bodyPartId:"part-1",icalUid:"uid-kickoff",sequence:0,method:"Request",source:"IcalendarPart",state:"Pending",summary:"Billing migration kickoff",dtStart:"2026-06-11T14:00:00+02:00",dtEnd:"2026-06-11T15:00:00+02:00",endsAtUtc:"2026-06-11T13:00:00Z",allDay:!1,location:"Room Noord",organizer:"priya@example.invalid",zoneCertainty:"Explicit",acceptedCalendarObjectId:"",supersededByMessageId:"",supersededByThreadId:"",createdAt:0,updatedAt:0,answerOvertakenBy:"None",...a}),w=a=>e=>{const i=new URL(e.url);return i.pathname.endsWith("/calendars")?r({items:b}):i.pathname.endsWith("/calendar-suggestions")?r({items:a}):i.pathname.endsWith("/accept")?r({...a[0],state:"Accepted"}):r({items:[]})};function h(){const{changeSuggestionFirst:a,closeToView:e}=T(),i=f();return n.jsxs("div",{className:"flex h-dvh bg-canvas",children:[n.jsx(B,{onChangeFirst:a}),n.jsx("div",{className:"min-w-0 flex-1 border-l border-line",children:i!==void 0&&n.jsx(x,{suggestionId:i,onClose:e})})]})}function E({pending:a,openedFrom:e="address"}){return e==="card"?n.jsx(y,{entry:v,server:w(a),pane:n.jsx(h,{})}):n.jsx("div",{className:"h-dvh max-w-2xl border-l border-line bg-canvas",children:n.jsx(y,{entry:`${v}/suggestion/${u}`,server:w(a),pane:n.jsx(x,{suggestionId:u,onClose:()=>{}})})})}const Ue={title:"Playground/Shipped/Calendar/Change a suggestion first",component:E,parameters:{layout:"fullscreen"}},s={args:{pending:[d()]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11"),await t(e.getByRole("button",{name:"Add"})).toBeVisible()}},c={args:{pending:[d({dtStart:"2026-06-11T09:00:00+00:00",dtEnd:"2026-06-11T10:00:00+00:00",endsAtUtc:"2026-06-11T10:00:00Z",zoneCertainty:"Ambiguous"})]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByLabelText("Start time")).toHaveValue("09:00"),await t(e.getByText(/named a time zone nothing could resolve/)).toBeVisible()}},l={args:{pending:[]},play:async({canvasElement:a})=>{const e=o(a);await t(await e.findByText(/no longer waiting on you/)).toBeVisible()}},m={args:{pending:[d()]},play:async({canvasElement:a})=>{const e=o(a),i=await e.findByLabelText("Title");await g.clear(i),await g.click(e.getByRole("button",{name:"Add"})),await t(await e.findByRole("alert")).toHaveTextContent("Give the event a title")}},p={args:{pending:[d()],openedFrom:"card"},globals:{viewport:{value:"desktop"}},play:async({canvasElement:a})=>{const e=o(a);await g.click(await e.findByRole("button",{name:"Change first"})),await t(await e.findByLabelText("Title")).toHaveValue("Billing migration kickoff"),await t(e.getByLabelText("Location")).toHaveValue("Room Noord"),await t(e.getByLabelText("Date")).toHaveValue("2026-06-11")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};const ze=["SeededFromTheMail","ZoneNobodyCouldPlace","NoLongerWaiting","SaysWhatIsMissing","OpenedFromTheWaitingCard"];export{l as NoLongerWaiting,p as OpenedFromTheWaitingCard,m as SaysWhatIsMissing,s as SeededFromTheMail,c as ZoneNobodyCouldPlace,ze as __namedExportsOrder,Ue as default};
