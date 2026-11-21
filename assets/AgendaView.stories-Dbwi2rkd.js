import{j as p}from"./iframe-DUn0T08W.js";import{A as l,i as w}from"./calendar-window-B68ldMwV.js";import{S as c,c as h,f as y}from"./calendar-story-fixtures-nudx2Ft_.js";import{C as u,j as i,n as v}from"./calendar-story-server-J9TRdhN_.js";import"./preload-helper-PPVm8Dsz.js";import"./agenda-time-BSnlf1Hq.js";import"./agenda-window-tTG5-juQ.js";import"./useCalendarSuggestions-DxjvrzTF.js";import"./react-query.gen-B4habc-D.js";import"./ErrorState-CY9CR2so.js";import"./circle-alert-Dup3Hpj3.js";import"./createLucideIcon-BO9sjSGA.js";import"./useMutation-BSnD0KLu.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./list-pages-BCUbyyea.js";import"./useCalendars-Bno_ukVl.js";import"./nav-link-surface-_wSNG8Qr.js";import"./cn-IyxL_b2c.js";import"./index-BZOT5VJZ.js";import"./index-DxLbloat.js";import"./wizard-steps-qDpjPjkM.js";import"./filter-rule-CPGV50Cj.js";import"./useMediaQuery-DNOZ3Pnr.js";import"./mailbox-name-CfEfTTjc.js";import"./use-match-media-bgoIUxjQ.js";import"./folder-role-DZ_tTsff.js";import"./folder-tree-lS__Eg2V.js";import"./inbox-CjrXUxPh.js";import"./file-text-a4VOwwvH.js";import"./send-DHkdV7Sh.js";import"./mails-DhngMbOi.js";import"./octagon-alert-Dmmw3E67.js";import"./trash-TQGHNCuP.js";import"./star-Cbz_ngPP.js";import"./runtime-config-aIiziXlW.js";import"./AgendaStrip-wXCMYlWt.js";import"./agenda-flow-B6-rM9Y7.js";import"./calendar-color-CqvBY603.js";import"./calendar-event-chip-B7qfckdP.js";import"./repeat-6HJbWKxZ.js";import"./mail-DoYzsxpw.js";import"./globe-CagDWj-T.js";import"./chevron-right-D5PcmHU6.js";import"./map-pin-DaFgrBXH.js";import"./agenda-panels-BJK2lScp.js";import"./clock-CyTpi23Y.js";import"./queryClient-C864qFkK.js";const{expect:t,within:m}=__STORYBOOK_MODULE_TEST__,g=`/calendar/agenda/${c}`,d=a=>(e=>{const o=new URL(e.url);return o.pathname.endsWith("/calendars")?i({items:h}):o.pathname.endsWith("/calendar-events")?a(o):i({items:[]})});function f({density:a,server:e}){return p.jsx("div",{className:"flex h-dvh flex-col bg-canvas",children:p.jsx(u,{entry:g,server:e,pane:p.jsx(l,{density:a,onPickSlot:()=>{}})})})}const ye={title:"Playground/Shipped/Calendar/Agenda view",component:f,parameters:{layout:"fullscreen"},args:{density:"comfortable",server:d(a=>i({items:w(a,y)}))}},r={play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Roadmap review")).toBeVisible(),await t(e.getByText("Standup")).toBeVisible()}},s={args:{server:d(v)},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByTestId(`agenda-day-pending-${c}`)).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}},n={args:{server:d(()=>i({message:"The window has to be shorter than a year."},400))},play:async({canvasElement:a})=>{const e=m(a);await t(await e.findByText("Couldn't load these days")).toBeVisible(),await t(e.queryByText("Roadmap review")).toBeNull()}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
with nothing in it, and the reader gives the time away.`,...n.parameters?.docs?.description}}};const ue=["Populated","LoadingWeeks","RefusedRead"];export{s as LoadingWeeks,r as Populated,n as RefusedRead,ue as __namedExportsOrder,ye as default};
