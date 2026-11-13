import{j as e}from"./iframe-fYsS-Mr7.js";import{C as m,a as u}from"./calendar-event-popup-CW1gBa5q.js";import{C as d,a as i}from"./calendar-guests-DVgYafyj.js";import"./preload-helper-PPVm8Dsz.js";import"./calendar-color-CqvBY603.js";import"./cn-IyxL_b2c.js";import"./pencil-D4Z2Ugdp.js";import"./createLucideIcon-B5J0h_XM.js";import"./trash-CtpmnHuk.js";import"./x-sSwTlOFF.js";import"./map-pin-N9se7Rv0.js";import"./calendar-days-Bsdw_fPO.js";import"./check-ClpQiEYg.js";import"./circle-question-mark-hVJ2st9V.js";const c=[{name:"Sender name",email:"sender@example.com",rsvp:"accepted",role:"organizer"},{name:"Guest one",email:"one@example.com",rsvp:"tentative",role:"attendee"},{name:"",email:"two@example.com",rsvp:"noReply",role:"attendee"}],l={accepted:1,declined:0,tentative:1,needsAction:1},F={title:"Design System/Calendar/Event popup",component:m,parameters:{layout:"padded"},decorators:[p=>e.jsx("div",{className:"w-[26rem] rounded-xl border border-line bg-surface-raised shadow-xl",children:e.jsx(p,{})})],args:{headingId:"event-title",title:"Oktoberfest",color:"cal-3",when:"Wednesday, 4 November · 18:00 – 22:00",location:"Theresienwiese, Munich",calendarName:"Personal",availability:"Busy",onEdit:()=>{},onDelete:()=>{},onClose:()=>{}}},r={},t={args:{failure:{text:"Couldn't delete this event: the server didn't answer.",reportHref:"#",onRetry:()=>{}}}},s={render:()=>e.jsx(u,{headingId:"gone",onClose:()=>{}})},a={args:{children:e.jsx(d,{attendees:c,counts:l})}},n={args:{children:e.jsxs(e.Fragment,{children:[e.jsx(d,{attendees:c,counts:l}),e.jsx(i,{current:"tentative",onAnswer:()=>{}})]})}},o={args:{children:e.jsxs(e.Fragment,{children:[e.jsx(d,{attendees:c,counts:l}),e.jsx(i,{current:"accepted",onAnswer:()=>{},failure:{text:"Couldn't send your reply: the server didn't answer.",reportHref:"#",onRetry:()=>{}}})]})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    failure: {
      text: "Couldn't delete this event: the server didn't answer.",
      reportHref: "#",
      onRetry: () => {}
    }
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <CalendarEventGone headingId="gone" onClose={() => {}} />
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: <CalendarEventGuests attendees={guests} counts={counts} />
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
                <CalendarEventGuests attendees={guests} counts={counts} />
                <CalendarReplyRow current="tentative" onAnswer={() => {}} />
            </>
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
                <CalendarEventGuests attendees={guests} counts={counts} />
                <CalendarReplyRow current="accepted" onAnswer={() => {}} failure={{
        text: "Couldn't send your reply: the server didn't answer.",
        reportHref: "#",
        onRetry: () => {}
      }} />
            </>
  }
}`,...o.parameters?.docs?.source}}};const A=["Event","DeleteFailed","Gone","WithGuests","Reply","ReplyFailed"];export{t as DeleteFailed,r as Event,s as Gone,n as Reply,o as ReplyFailed,a as WithGuests,A as __namedExportsOrder,F as default};
