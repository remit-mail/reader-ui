import{j as p}from"./iframe-fYsS-Mr7.js";import{A as l,i as w}from"./calendar-window-0Lyhu4Dh.js";import{S as c,c as h,f as y}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as u,j as i,n as v}from"./calendar-story-server-BcFZ7H_I.js";import"./preload-helper-PPVm8Dsz.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-CQjzh2Y9.js";import"./useCalendarSuggestions-DvWNa7Q8.js";import"./react-query.gen-B1_4DilO.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./createLucideIcon-B5J0h_XM.js";import"./useMutation-BWoFIWmj.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./useCalendars-Cbd3Binc.js";import"./nav-link-surface-Bcna85LV.js";import"./cn-IyxL_b2c.js";import"./index-DbNRduy1.js";import"./index-BNekr84Q.js";import"./wizard-steps-qDpjPjkM.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-CbqKfMFy.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-DTwR-V5R.js";import"./folder-role-CjJrjS2E.js";import"./folder-tree-ZE9Jqoy_.js";import"./inbox-vF0NtWrK.js";import"./file-text-ByqS7Kt2.js";import"./send-C4SeWUwb.js";import"./mails-hVcCx1jX.js";import"./octagon-alert-DwiO4oVu.js";import"./trash-CtpmnHuk.js";import"./star-j_TS7MKt.js";import"./runtime-config-aIiziXlW.js";import"./AgendaStrip-_ngWR5En.js";import"./agenda-flow-D4nlD9-2.js";import"./calendar-color-CqvBY603.js";import"./calendar-event-chip-D78Phz7N.js";import"./repeat-DUzgTyc4.js";import"./mail-CSMuoKF3.js";import"./globe-DMBwvAOE.js";import"./chevron-right-Fk7PhnMq.js";import"./map-pin-N9se7Rv0.js";import"./agenda-panels-BgvMG8Yc.js";import"./clock-BU-oGQ2u.js";import"./queryClient-ClMo2LzF.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,g=`/calendar/agenda/${c}`,d=a=>(e=>{const o=new URL(e.url);return o.pathname.endsWith("/calendars")?i({items:h}):o.pathname.endsWith("/calendar-events")?a(o):i({items:[]})});function f({density:a,server:e}){return p.jsx("div",{className:"flex h-dvh flex-col bg-canvas",children:p.jsx(u,{entry:g,server:e,pane:p.jsx(l,{density:a,onPickSlot:()=>{}})})})}const he={title:"Playground/Shipped/Calendar/Agenda view",component:f,parameters:{layout:"fullscreen"},args:{density:"comfortable",server:d(a=>i({items:w(a,y)}))}},r={play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Roadmap review")).toBeVisible(),await t(e.getByText("Standup")).toBeVisible()}},s={args:{server:d(v)},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByTestId(`agenda-day-pending-${c}`)).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}},n={args:{server:d(()=>i({message:"The window has to be shorter than a year."},400))},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Couldn't load these days")).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Roadmap review")).toBeVisible();
    await expect(canvas.getByText("Standup")).toBeVisible();
  }
}`,...r.parameters?.docs?.source},description:{story:"The weeks around the day the address names, drawn from what the server sent.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    server: answering(never)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId(\`agenda-day-pending-\${STORY_DATE}\`)).toBeVisible();
    await expect(canvas.queryByText("Roadmap review")).toBeNull();
  }
}`,...s.parameters?.docs?.source},description:{story:`The weeks are still out. Every day keeps the row it will occupy, so nothing
jumps when the answers land — and, which matters more, an unanswered day says
so rather than drawing as a day with nothing booked on it.`,...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    server: answering(() => json({
      message: "The window has to be shorter than a year."
    }, 400))
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Couldn't load these days")).toBeVisible();
    await expect(canvas.queryByText("Roadmap review")).toBeNull();
  }
}`,...n.parameters?.docs?.source},description:{story:`The read was refused. This is the state an empty strip must never be confused
with: a fortnight drawn blank because the request failed reads as a fortnight
with nothing in it, and the reader gives the time away.`,...n.parameters?.docs?.description}}};const ye=["Populated","LoadingWeeks","RefusedRead"];export{s as LoadingWeeks,r as Populated,n as RefusedRead,ye as __namedExportsOrder,he as default};
