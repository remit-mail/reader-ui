import{j as b,r as k}from"./iframe-fYsS-Mr7.js";import{b as $,f as T,d as A}from"./agenda-time-BSnlf1Hq.js";import{f as F}from"./agenda-window-CQjzh2Y9.js";import"./react-query.gen-B1_4DilO.js";import"./useCalendarSuggestions-DvWNa7Q8.js";import{A as N}from"./AgendaStrip-_ngWR5En.js";import"./preload-helper-PPVm8Dsz.js";import"./ErrorState-DvRHnVcx.js";import"./circle-alert-CB51jFZQ.js";import"./createLucideIcon-B5J0h_XM.js";import"./useMutation-BWoFIWmj.js";import"./error-classifier-C58Iuok9.js";import"./request-breadcrumbs-OUZqy9mi.js";import"./schemas-KRodOHJj.js";import"./agenda-flow-D4nlD9-2.js";import"./calendar-color-CqvBY603.js";import"./cn-IyxL_b2c.js";import"./calendar-event-chip-D78Phz7N.js";import"./repeat-DUzgTyc4.js";import"./mail-CSMuoKF3.js";import"./globe-DMBwvAOE.js";import"./chevron-right-Fk7PhnMq.js";import"./map-pin-N9se7Rv0.js";import"./agenda-panels-BgvMG8Yc.js";import"./clock-BU-oGQ2u.js";const{expect:E,within:j}=__STORYBOOK_MODULE_TEST__,e="2026-06-10",u="+02:00",P=`${e}T09:30:00${u}`,R="cal_work",y="cal_team",v="cal_home",W=[{id:R,accountId:"acct_work",accountLabel:"Work",name:"Northwind",color:"cal-1"},{id:y,accountId:"acct_work",accountLabel:"Work",name:"Platform",color:"cal-6"},{id:v,accountId:"acct_home",accountLabel:"Personal",name:"Home",color:"cal-4"}],V={id:"",calendarId:R,title:"",start:"",end:"",allDay:!1,location:"",notes:"",attendees:[],myRsvp:"accepted",threadId:"",threadSubject:"",timeZone:"Europe/Amsterdam",zoneCertainty:"explicit",recurrenceRule:"",seriesId:"",seriesException:!1,status:"confirmed"},a=(t,r,g,S,w,f={})=>({...V,...f,id:t,title:r,start:`${g}T${S}:00${u}`,end:`${g}T${w}:00${u}`}),G=[a("standup","Standup",e,"09:15","09:30",{recurrenceRule:"Repeats",seriesId:"ser_standup"}),a("roadmap","Q3 roadmap review",e,"10:00","11:30",{calendarId:y,location:"Kaap"}),a("incident","Incident review",e,"10:30","12:00"),a("dentist","Dentist","2026-06-11","11:00","12:00",{calendarId:v,location:"Kerkstraat 4"}),a("retro","Retro","2026-06-18","16:00","17:00",{calendarId:y}),a("climbing","Climbing","2026-06-20","10:00","12:00",{calendarId:v})],I=[a("s","Standup",e,"09:00","09:15"),a("d1","Design review",e,"09:30","11:00",{calendarId:y}),a("d2","Supplier call",e,"11:00","12:00",{location:"Meet"}),a("d3","One to one",e,"13:30","14:00",{location:"Room 2"}),a("d4","Hiring panel",e,"14:00","15:30",{calendarId:y}),a("d5","Board prep",e,"15:30","17:00"),a("d6","School run",e,"17:00","18:00",{calendarId:v})],D=A("2026-06-01","2026-06-24"),K=t=>t==="all"?new Set(D):t==="week"?new Set(A("2026-06-15","2026-06-21")):new Set;function O({events:t,initialDensity:r,loading:g,error:S,busy:w,atCap:f}){const[x]=k.useState(r),[C,B]=k.useState(""),_=D.map(n=>$(n,t,e)),L=F(D,w);return b.jsx(N,{days:_,calendars:W,density:x,today:e,anchorDate:e,now:P,selectedEventId:C,freeOn:n=>w.length===0?T(n):L.get(n.date)??T(n),loadingDates:K(g),error:S,onRetry:()=>{},onSelectEvent:B,onPickSlot:()=>{},onZoomDay:()=>{},onGoToDate:()=>{},onReachStart:()=>{},onReachEnd:()=>{},atStartCap:f,atEndCap:f,onLoadEarlier:()=>{},onLoadLater:()=>{},onVisibleDayChange:()=>{}})}const ye={title:"Playground/Shipped/Calendar/Agenda",component:O,parameters:{layout:"fullscreen"},args:{events:G,initialDensity:"comfortable",loading:"none",busy:[]},render:t=>b.jsx("div",{className:"flex h-dvh flex-col bg-canvas",children:b.jsx(O,{...t})})},s={},o={args:{loading:"all",events:[]}},i={args:{loading:"week"}},c={args:{events:[]}},d={args:{events:I}},p={args:{events:I,initialDensity:"compact"}},l={args:{events:[],busy:[{start:`2026-06-11T09:00:00${u}`,end:`2026-06-11T16:00:00${u}`}]}},m={args:{atCap:!0},play:async({canvasElement:t})=>{const r=j(t);await E(await r.findByRole("button",{name:"Show earlier days"})).toBeVisible(),await E(r.getByRole("button",{name:"Show later days"})).toBeVisible()}},h={args:{events:[],error:new Error("The window has to be shorter than a year.")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source},description:{story:"A fortnight: two busy days, a pile-up, and the quiet in between named.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    loading: "all",
    events: []
  }
}`,...o.parameters?.docs?.source},description:{story:`Before any week has answered. Every day is a skeleton on the date it will
occupy, so nothing jumps when the answers land — and, crucially, this does
not read as a fortnight with nothing booked.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    loading: "week"
  }
}`,...i.parameters?.docs?.source},description:{story:"One week still in flight, with the answered days around it drawn.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    events: []
  }
}`,...c.parameters?.docs?.source},description:{story:`Nothing booked for weeks. The claim this view makes is that one sentence is a
better answer to "am I free" than a fortnight of blank screens.`,...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    events: denseDay
  }
}`,...d.parameters?.docs?.source},description:{story:"One day, back to back, at the reading that spends a row on each.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    events: denseDay,
    initialDensity: "compact"
  }
}`,...p.parameters?.docs?.source},description:{story:"The same dense day at Glance, where a title still has to be readable.",...p.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    events: [],
    busy: [{
      start: \`2026-06-11T09:00:00\${OFFSET}\`,
      end: \`2026-06-11T16:00:00\${OFFSET}\`
    }]
  }
}`,...l.parameters?.docs?.source},description:{story:`The reader has unticked the calendar those meetings are on, so the strip
draws nothing on the 11th. They are booked all the same, and the free bands
come from the merged busy spans rather than from the rows on screen.`,...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    atCap: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", {
      name: "Show earlier days"
    })).toBeVisible();
    await expect(canvas.getByRole("button", {
      name: "Show later days"
    })).toBeVisible();
  }
}`,...m.parameters?.docs?.source},description:{story:`The run has grown as far as scrolling takes it, and stops there rather than
fetching its way across years nobody asked for. A sparse diary draws shorter
than the distance the strip fetches at, so an end measured off the content
alone is reached on the first layout pass and never stops being reached —
which is why the cap says so and hands the reader the next stretch instead.`,...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    events: [],
    error: new Error("The window has to be shorter than a year.")
  }
}`,...h.parameters?.docs?.source},description:{story:"A read that was refused. An empty strip would say the opposite of this.",...h.parameters?.docs?.description}}};const ge=["PopulatedFortnight","Loading","OneWeekStillLoading","EmptyRunCollapsed","DenseDay","DenseDayAtAGlance","BusyOnACalendarNotDrawn","AtTheCap","CouldNotLoad"];export{m as AtTheCap,l as BusyOnACalendarNotDrawn,h as CouldNotLoad,d as DenseDay,p as DenseDayAtAGlance,c as EmptyRunCollapsed,o as Loading,i as OneWeekStillLoading,s as PopulatedFortnight,ge as __namedExportsOrder,ye as default};
