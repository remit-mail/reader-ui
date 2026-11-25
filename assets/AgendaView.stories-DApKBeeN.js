import{j as p}from"./iframe-4Y_dM_UU.js";import{i as l}from"./calendar-window-B0pZ5L0r.js";import{A as w}from"./AgendaView-BznTl_6k.js";import{S as c,c as h,f as y}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as u,j as i,n as v}from"./calendar-story-server-BoObz3YW.js";import"./preload-helper-PPVm8Dsz.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-CB2TKzXm.js";import"./window-d5CweQa1.js";import"./schemas-KRodOHJj.js";import"./instance-DcbrR06W.js";import"./useCalendarEvents-BsWCW4Ds.js";import"./nav-link-surface-CjkqJ6hT.js";import"./cn-IyxL_b2c.js";import"./index-B3CIJJ7_.js";import"./index-DhYErdGu.js";import"./wizard-steps-M1TSt1Tg.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-BMdCP2iF.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-D0LgLPS6.js";import"./folder-role-CvPdLVqM.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CvUF9C2g.js";import"./createLucideIcon-DkKJcbI9.js";import"./file-text-BmCePHPh.js";import"./send-CbUYJmgX.js";import"./mails-ChqgPF6O.js";import"./octagon-alert-ChID51gq.js";import"./trash-q_49bOYx.js";import"./star-DJsZr7L-.js";import"./react-query.gen-C52jVGEN.js";import"./client.gen-84yaupxO.js";import"./app-info-BsoZZlWQ.js";import"./AgendaStrip-RXZPDZRr.js";import"./agenda-flow-DOcDh1zD.js";import"./calendar-color-CqvBY603.js";import"./calendar-event-chip-BbOjVQUp.js";import"./repeat-CyVMIsMy.js";import"./mail-1N_4GVps.js";import"./globe-CVBGglCM.js";import"./chevron-right-DdPAKdYb.js";import"./map-pin-CE8Z3xzB.js";import"./agenda-panels-C_KcMv-g.js";import"./clock-J1C0g1gG.js";import"./ErrorState-DI525bMD.js";import"./circle-alert-Z6J3DHRJ.js";import"./queryClient-B-_Q6x1O.js";import"./client-BpBKSbyE.js";import"./request-breadcrumbs-d-JFnrHf.js";import"./api-BX6GFMBA.js";import"./network-error-tuI5IsFH.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,g=`/calendar/agenda/${c}`,d=a=>(e=>{const o=new URL(e.url);return o.pathname.endsWith("/calendars")?i({items:h}):o.pathname.endsWith("/calendar-events")?a(o):i({items:[]})});function f({density:a,server:e}){return p.jsx("div",{className:"flex h-dvh flex-col bg-canvas",children:p.jsx(u,{entry:g,server:e,pane:p.jsx(w,{density:a,onPickSlot:()=>{}})})})}const ge={title:"Playground/Shipped/Calendar/Agenda view",component:f,parameters:{layout:"fullscreen"},args:{density:"comfortable",server:d(a=>i({items:l(a,y)}))}},r={play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Roadmap review")).toBeVisible(),await t(e.getByText("Standup")).toBeVisible()}},s={args:{server:d(v)},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByTestId(`agenda-day-pending-${c}`)).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}},n={args:{server:d(()=>i({message:"The window has to be shorter than a year."},400))},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Couldn't load these days")).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
with nothing in it, and the reader gives the time away.`,...n.parameters?.docs?.description}}};const fe=["Populated","LoadingWeeks","RefusedRead"];export{s as LoadingWeeks,r as Populated,n as RefusedRead,fe as __namedExportsOrder,ge as default};
