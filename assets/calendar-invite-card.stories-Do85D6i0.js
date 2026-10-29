import{r as f,j as s}from"./iframe-Dz9ev7_1.js";import{C as w}from"./calendar-invite-card-Bi78psgk.js";import{d as C,k as u}from"./intelligence-calendar-fixtures-S8EU3YbF.js";import"./preload-helper-PPVm8Dsz.js";import"./calendar-color-CqvBY603.js";import"./cn-d2XQ1MEC.js";import"./attendee-row-BpO4eGMH.js";import"./avatar-BqhrHOCc.js";import"./minus-rkSVdKQS.js";import"./createLucideIcon-RYwrBmYZ.js";import"./x-snW7h3us.js";import"./clock-QCzNkE3J.js";import"./check-D-jt1aUx.js";import"./button-CLbVgqC1.js";import"./calendar-clash-strip-ymGKT68d.js";import"./triangle-alert-BzExaAbk.js";import"./calendar-parse-badge-Vv98PZcJ.js";import"./file-text-DPRQ2ITA.js";import"./map-pin-DOlYB1cA.js";import"./trash-2-0YleYOuI.js";import"./bell-off-D5wXg9F3.js";const J={title:"Design System/Calendar/Invite card",component:w,parameters:{layout:"padded",docs:{description:{component:`The invitation as the thing it is, rather than an attachment nobody opens.
What saying yes runs into is stated above the button, and the card says the
organiser hears nothing — this plan sends no reply at all.`}}},decorators:[v=>s.jsx("div",{className:"max-w-md",children:s.jsx(v,{})})]},T={onAdd:()=>{},onTentative:()=>{},onDecline:()=>{},onReopen:()=>{},onOfferOtherTimes:()=>{}},e={invite:u,whenText:"Thursday 11 June, 14:00 – 15:00",calendarName:"Work",color:"cal-2",clashes:C,rsvp:"noReply",...T},x={...u,state:"superseded",sequence:1,evidence:"invite.ics · METHOD:REQUEST · SEQUENCE:1"},S={...u,state:"cancelled",sequence:2,evidence:"cancel.ics · METHOD:CANCEL · STATUS:CANCELLED"},r={args:e},a={args:{...e,clashes:[]}},n={args:{...e,rsvp:"accepted",clashes:[]}},t={args:{...e,rsvp:"tentative",clashes:[]}},o={args:{...e,rsvp:"declined",clashes:[]}},i={args:{...e,rsvp:"accepted",clashes:[],onReopen:void 0}},c={args:{...e,invite:{...u,state:"dismissed"},clashes:[]}},d={args:{...e,invite:x,onOpenNewer:()=>{}}},p={args:{...e,invite:S,rsvp:"accepted",onRemove:()=>{}}},m={args:{...e,guests:s.jsxs("ul",{className:"flex flex-col gap-0.5 text-xs text-fg-muted",children:[s.jsx("li",{children:"Priya Natarajan — organiser"}),s.jsx("li",{children:"Marcus Webb — coming"}),s.jsx("li",{children:"Dana Okafor — no reply"})]})}},l={args:{...e,touch:!0}},h={render:()=>{const[v,g]=f.useState("noReply"),[b,y]=f.useState(!1);return s.jsx(w,{...e,invite:{...u,state:b?"dismissed":"pending"},rsvp:v,onAdd:()=>g("accepted"),onTentative:()=>g("tentative"),onDecline:()=>g("declined"),mute:{sender:"Priya Natarajan",onMute:()=>y(!0)},onReopen:()=>{g("noReply"),y(!1)}})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: base
}`,...r.parameters?.docs?.source},description:{story:"The clash stated before the answer, which is the whole point of the card.",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    clashes: []
  }
}`,...a.parameters?.docs?.source},description:{story:"The same invitation on an empty afternoon. Silence would read as unchecked.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    rsvp: "accepted",
    clashes: []
  }
}`,...n.parameters?.docs?.source},description:{story:"Answered. The card keeps saying the organiser was never told.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    rsvp: "tentative",
    clashes: []
  }
}`,...t.parameters?.docs?.source},description:{story:"Answered maybe. On the calendar as tentative, and the organiser was not told.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    rsvp: "declined",
    clashes: []
  }
}`,...o.parameters?.docs?.source},description:{story:"Declined, with the way back to offering other times still open.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    rsvp: "accepted",
    clashes: [],
    onReopen: undefined
  }
}`,...i.parameters?.docs?.source},description:{story:"Answered, then the organiser's cancellation was answered into the same event, so this one offers no Change.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    invite: {
      ...kickoffInvite,
      state: "dismissed"
    },
    clashes: []
  }
}`,...c.parameters?.docs?.source},description:{story:"Dismissed without an answer. Change brings the answers back.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    invite: superseded,
    onOpenNewer: () => undefined
  }
}`,...d.parameters?.docs?.source},description:{story:"A later message carried a higher SEQUENCE, so this one is not the question.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    invite: cancelled,
    rsvp: "accepted",
    onRemove: () => undefined
  }
}`,...p.parameters?.docs?.source},description:{story:"Cancelled, and still on the calendar until the reader takes it off.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    guests: <ul className="flex flex-col gap-0.5 text-xs text-fg-muted">
                <li>Priya Natarajan — organiser</li>
                <li>Marcus Webb — coming</li>
                <li>Dana Okafor — no reply</li>
            </ul>
  }
}`,...m.parameters?.docs?.source},description:{story:"A host with its own guest surface passes it in rather than growing a second.",...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    ...base,
    touch: true
  }
}`,...l.parameters?.docs?.source},description:{story:"Thumb-sized targets, wrapped so three answers fit a phone.",...l.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [rsvp, setRsvp] = useState<RsvpState>("noReply");
    const [dismissed, setDismissed] = useState(false);
    return <CalendarInviteCard {...base} invite={{
      ...kickoffInvite,
      state: dismissed ? "dismissed" : "pending"
    }} rsvp={rsvp} onAdd={() => setRsvp("accepted")} onTentative={() => setRsvp("tentative")} onDecline={() => setRsvp("declined")} mute={{
      sender: "Priya Natarajan",
      onMute: () => setDismissed(true)
    }} onReopen={() => {
      setRsvp("noReply");
      setDismissed(false);
    }} />;
  }
}`,...h.parameters?.docs?.source},description:{story:`The card answering for real, so the review is a click-through. Every answer,
dismissing included, offers Change, which asks again.`,...h.parameters?.docs?.description}}};const F=["WithAClash","NothingBooked","AlreadyOnTheCalendar","AnsweredMaybe","Declined","AnsweredThenCancelled","Dismissed","OvertakenByANewerRevision","Cancelled","WithTheHostsGuestList","Touch","Answering"];export{n as AlreadyOnTheCalendar,t as AnsweredMaybe,i as AnsweredThenCancelled,h as Answering,p as Cancelled,o as Declined,c as Dismissed,a as NothingBooked,d as OvertakenByANewerRevision,l as Touch,r as WithAClash,m as WithTheHostsGuestList,F as __namedExportsOrder,J as default};
