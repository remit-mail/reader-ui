import{j as e,r as d}from"./iframe-Dz9ev7_1.js";import{i as t,o as s,t as G,n as L,a as q,s as V,c as J,f as Q,b as z,p as X}from"./intelligence-calendar-fixtures-S8EU3YbF.js";import{I as fe}from"./intelligence-panel-DR2KAgTy.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-BDbE0cN-.js";import"./cn-d2XQ1MEC.js";import"./avatar-BqhrHOCc.js";import"./badge-Dsqh0My3.js";import"./button-CLbVgqC1.js";import"./calendar-event-chip-Bu1FQGzL.js";import"./calendar-event-chip-content-KO-kByPh.js";import"./calendar-color-CqvBY603.js";import"./repeat-B8K_6wia.js";import"./createLucideIcon-RYwrBmYZ.js";import"./mail-lJ4T2vNk.js";import"./globe-CNSgJ-Ca.js";import"./calendar-invite-card-Bi78psgk.js";import"./attendee-row-BpO4eGMH.js";import"./minus-rkSVdKQS.js";import"./x-snW7h3us.js";import"./clock-QCzNkE3J.js";import"./check-D-jt1aUx.js";import"./calendar-clash-strip-ymGKT68d.js";import"./triangle-alert-BzExaAbk.js";import"./calendar-parse-badge-Vv98PZcJ.js";import"./file-text-DPRQ2ITA.js";import"./map-pin-DOlYB1cA.js";import"./trash-2-0YleYOuI.js";import"./bell-off-D5wXg9F3.js";import"./calendar-slot-offers-BgIOwhdm.js";import"./calendar-suggestion-deck-DQ3Yfjun.js";import"./sparkles-8ddE6svA.js";import"./event-suggestion-card-BODkqQQL.js";import"./blocked-reason-CuncjwVb.js";import"./plus-BjlLK1hC.js";import"./calendar-days-D4PAqIok.js";import"./reply-CnC3lsA8.js";import"./segmented-control-tDDqEOk4.js";import"./star-CgN1A-T5.js";import"./shield-check-D0ywmRdg.js";import"./shield-alert-D0TTzBU-.js";const{expect:be,userEvent:ye,within:xe}=__STORYBOOK_MODULE_TEST__,lr={title:"Playground/Shipped/Mail/IntelligencePanel calendar tab",parameters:{layout:"centered",docs:{description:{component:`Option B, re-shaped. The calendar is not a second page you go to; it is the
half of the info panel that answers what a message would cost. It is a tab
rather than a longer column because the panel already carries the sender, and
because the question only exists while a decision about time is open.

The strip lives on \`IntelligencePanel\` itself, so both hosts inherit it: the
rail that shows from 1280px up, and the drawer every narrower layout opens in
its place. Both are framed below, because a tab strip that works in a 304px
rail and breaks in a full-height sheet is not one component.

The rule under every state here: nothing reaches the calendar unless a person
presses the button, and pressing it tells the organiser nothing. This plan
sends no reply, so the card says so where the press happens.`}}}};function Z({sender:i,calendar:r,initialTab:l="calendar",hideCloseButton:p,touch:se,className:ae}){const[ne,ie]=d.useState(l),[oe,E]=d.useState(r.invite?.rsvp??"noReply"),[de,Y]=d.useState(!1),[ce,U]=d.useState(!1),[he,le]=d.useState(r.prose!==void 0),[_,pe]=d.useState([]),[me,M]=d.useState([]),[ue,ge]=d.useState(""),[$,P]=d.useState(""),ve=he?{...r.prose??G,picked:_}:void 0,we={...r,invite:r.invite&&!de?{...r.invite,invite:ce?{...r.invite.invite,state:"dismissed"}:r.invite.invite,rsvp:oe,sender:i.sender.name}:void 0,prose:ve,suggestions:r.suggestions.filter(o=>!me.includes(o.suggestion.id))};return e.jsxs("div",{className:"flex h-full min-w-0 flex-col",children:[e.jsx(fe,{className:ae,data:i,calendar:{data:we,selectedEventId:ue,actions:{onAddInvite:()=>E("accepted"),onTentativeInvite:r.invite?.invite.state==="cancelled"?void 0:()=>E("tentative"),onDeclineInvite:()=>E("declined"),onReopenInvite:r.invite?.invite.state==="cancelled"?()=>Y(!0):()=>{E("noReply"),U(!1)},onMuteInvite:()=>U(!0),onOfferOtherTimes:()=>le(!0),onRemoveInvite:()=>Y(!0),onOpenNewerInvite:r.invite?.invite.state==="superseded"?()=>P("opened the newer revision's conversation"):void 0,onToggleSlot:o=>{pe(c=>c.includes(o.startTime)?c.filter(B=>B!==o.startTime):[...c,o.startTime])},onReplyWithSlots:()=>P(`opened a reply holding ${(r.prose??G).dayLabel}: ${_.join(", ")}`),onAddSuggestion:(o,c)=>{M(B=>[...B,o]),P(c===""?`added ${o} to the calendar`:`added ${o} on ${c}`)},onDismissSuggestion:o=>M(c=>[...c,o]),onSelectEvent:ge}},tab:ne,onTabChange:ie,hideCloseButton:p,touch:se}),$!==""&&e.jsxs("p",{className:"shrink-0 border-t border-line bg-surface-sunken px-row-inset py-2 text-2xs text-fg-subtle",children:["Prototype: ",$]})]})}function Se({subject:i,children:r}){return e.jsxs("div",{className:"flex h-[860px] w-[1440px] overflow-hidden rounded-lg border border-line bg-canvas",children:[e.jsx("div",{className:"w-14 shrink-0 border-r border-line bg-surface-sunken"}),e.jsx("div",{className:"w-56 shrink-0 border-r border-line bg-surface-sunken"}),e.jsx("div",{className:"w-80 shrink-0 border-r border-line bg-surface"}),e.jsxs("div",{className:"flex min-w-0 flex-1 flex-col bg-surface",children:[e.jsx("header",{className:"flex h-pane-header shrink-0 items-center border-b border-line px-row-inset",children:e.jsx("h1",{className:"min-w-0 flex-1 truncate text-sm font-semibold text-fg",children:i})}),e.jsx("p",{className:"px-row-inset py-4 text-sm text-fg-muted",children:"The message. The panel beside it is the surface under review."})]}),r]})}function Te({subject:i,children:r}){return e.jsxs("div",{className:"relative flex h-[860px] w-[900px] overflow-hidden rounded-lg border border-line bg-canvas",children:[e.jsx("div",{className:"w-72 shrink-0 border-r border-line bg-surface"}),e.jsx("div",{className:"flex min-w-0 flex-1 flex-col bg-surface",children:e.jsx("header",{className:"flex h-pane-header shrink-0 items-center border-b border-line px-row-inset",children:e.jsx("h1",{className:"min-w-0 flex-1 truncate text-sm font-semibold text-fg",children:i})})}),e.jsx("div",{className:"absolute inset-0 bg-black/40"}),e.jsxs("aside",{className:"absolute inset-y-0 right-0 flex w-[420px] flex-col border-l border-line bg-surface shadow-2xl",children:[e.jsxs("header",{className:"flex h-pane-header shrink-0 items-center justify-between border-b border-line px-row-inset",children:[e.jsx("span",{className:"text-sm font-semibold text-fg",children:"Message details"}),e.jsx("span",{className:"text-2xs text-fg-subtle",children:"the drawer's own close"})]}),e.jsx("div",{className:"min-h-0 flex-1 overflow-y-auto",children:r})]})]})}const ee="https://github.com/remit-mail/reader/issues/new",a="Invitation: Billing migration kickoff — Thu 11 Jun, 14:00",re="Can we meet Thursday?",te="Your booking is confirmed — KL1693 Amsterdam to Lisbon",H="Re: Reading pane density — a vote for calmer";function n(i,r,l,p="calendar"){return{render:()=>e.jsx(Se,{subject:i,children:e.jsx(Z,{sender:r,calendar:l,initialTab:p,className:"h-full"})})}}function h(i,r,l,p="calendar"){return{render:()=>e.jsx(Te,{subject:i,children:e.jsx(Z,{sender:r,calendar:l,initialTab:p,hideCloseButton:!0,touch:!0,className:"h-full w-full border-l-0"})})}}const m=n(a,s,t),u=n(a,s,{...t,invite:t.invite&&{...t.invite,failure:"Couldn't add this to your calendar: the calendar it was going into is gone. Try again, or answer from your calendar app.",reportHref:ee}}),g=n(a,s,{...t,invite:t.invite&&{...t.invite,busy:!0}}),v=n(a,s,{...t,invite:t.invite&&{...t.invite,rsvp:"declined"}}),w=n(a,s,{...t,invite:t.invite&&{...t.invite,invite:{...t.invite.invite,state:"dismissed"},clashes:[]}}),f=n(a,s,{...t,invite:t.invite&&{...t.invite,rsvp:"tentative"}}),b=n(a,s,{...t,invite:t.invite&&{...t.invite,addBlocked:e.jsxs(e.Fragment,{children:["You have no calendar yet, so there is nowhere to add this."," ",e.jsx("a",{href:"#calendars",className:"font-medium text-accent hover:underline",children:"Create a calendar"})]})}}),y=n(H,s,{...L,failure:"Couldn't read the invitations in this message. Reopen it to try again.",reportHref:ee}),x=n(a,s,q),S={...n(a,s,V),play:async({canvasElement:i})=>{const r=xe(i);await ye.click(r.getByRole("button",{name:"Open the newer invitation"})),await be(r.getByText("Prototype: opened the newer revision's conversation")).toBeVisible()}},T=n(a,s,J),C=n(te,z,Q),I=n(re,s,X),k=n(H,s,L),F=n(a,s,t,"sender"),N=h(a,s,t),A=h(a,s,q),K=h(a,s,V),W=h(a,s,J),D=h(te,z,Q),O=h(re,s,X),j=h(H,s,L),R=h(a,s,t,"sender");m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:"rail(KICKOFF, organiserSender, inviteWithClash)",...m.parameters?.docs?.source},description:{story:`An invitation, and the thing every mail client leaves out. The clash is with
a dentist appointment on the personal account: two calendars, two accounts,
one afternoon, and it is stated above the button rather than discovered
after. The button reads "Add to calendar" because that is all pressing it
does — Priya learns nothing from it, and the card says so.`,...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    failure: "Couldn't add this to your calendar: the calendar it was going into is gone. Try again, or answer from your calendar app.",
    reportHref: REPORT
  }
})`,...u.parameters?.docs?.source},description:{story:`An answer the server turned down. The card keeps its buttons and says why in
the place the press happened, so a refusal never reads as a dead button.`,...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    busy: true
  }
})`,...g.parameters?.docs?.source},description:{story:`An answer on its way. The buttons wait for it rather than letting a second
press send a second request.`,...g.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    rsvp: "declined"
  }
})`,...v.parameters?.docs?.source},description:{story:`Declined, and said so. Nothing was written to a calendar and nothing was
sent to the organiser.`,...v.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    invite: {
      ...inviteWithClash.invite.invite,
      state: "dismissed"
    },
    clashes: []
  }
})`,...w.parameters?.docs?.source},description:{story:`Dismissed, or muted, without an answer. The card stays beside the message,
and Change brings the answers back.`,...w.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    rsvp: "tentative"
  }
})`,...f.parameters?.docs?.source},description:{story:`Answered maybe. The event is on the calendar as tentative, and the organiser
was not told.`,...f.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`rail(KICKOFF, organiserSender, {
  ...inviteWithClash,
  invite: inviteWithClash.invite && {
    ...inviteWithClash.invite,
    addBlocked: <>
                You have no calendar yet, so there is nowhere to add this.{" "}
                <a href="#calendars" className="font-medium text-accent hover:underline">
                    Create a calendar
                </a>
            </>
  }
})`,...b.parameters?.docs?.source},description:{story:`No calendar to write to yet. Adding and maybe wait for one, with the way to make it;
declining and muting write nothing to a calendar and stay live.`,...b.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`rail(PLAIN, organiserSender, {
  ...nothingAboutTime,
  failure: "Couldn't read the invitations in this message. Reopen it to try again.",
  reportHref: REPORT
})`,...y.parameters?.docs?.source},description:{story:`The invitations in this message could not be read. The tab says so, with the
way to report it, rather than claiming the message says nothing about time.`,...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:"rail(KICKOFF, organiserSender, inviteWithoutClash)",...x.parameters?.docs?.source},description:{story:`The same invitation an hour later. Nothing is booked over it, and the panel
says that too — silence there would read as "not checked", which is the same
as not knowing.`,...x.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...rail(KICKOFF, organiserSender, supersededInvite),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Open the newer invitation"
    }));
    await expect(canvas.getByText("Prototype: opened the newer revision's conversation")).toBeVisible();
  }
}`,...S.parameters?.docs?.source},description:{story:`A later message carried a higher SEQUENCE for the same UID. The stale one is
dimmed and its buttons are gone: answering a revision that has been replaced
puts the wrong hour on the calendar, so the card offers the newer one instead
of an answer, and pressing it opens the conversation that carries it.`,...S.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:"rail(KICKOFF, organiserSender, cancelledInvite)",...T.parameters?.docs?.source},description:{story:`METHOD:CANCEL on something already accepted. Reader does not take it off by
itself: nothing leaves the calendar without a person saying so, for the same
reason nothing reaches it that way. Until then the event is still there and
the card says why.`,...T.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:"rail(FLIGHT, airlineSender, flightConfirmation)",...C.parameters?.docs?.source},description:{story:`A flight confirmation, read out of a machine-readable booking block rather
than an attached invitation. The airline printed 20:25 for the arrival and
never said whose clock; Lisbon runs an hour behind. Add stays refused until
someone picks one, because booking the wrong hour is worse than asking.`,...C.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:"rail(THURSDAY, organiserSender, proseTimeThread)",...I.parameters?.docs?.source},description:{story:`"Can we do Thursday?" — three hours named in prose, each checked against the
day. Two are already booked and that is readable without leaving the message.
The half-hours under them go into the reply as plain text; ticking one books
nothing.`,...I.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:"rail(PLAIN, organiserSender, nothingAboutTime)",...k.parameters?.docs?.source},description:{story:`A message with no time in it. The tab is still there — it is part of the
panel, not something that appears and disappears — and it says plainly that
there is nothing to decide rather than showing an empty frame.`,...k.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:'rail(KICKOFF, organiserSender, inviteWithClash, "sender")',...F.parameters?.docs?.source},description:{story:`The Sender tab, unchanged. Every section that was in the panel before is
where it was; the strip above it is the only thing that is new.`,...F.parameters?.docs?.description}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:"drawer(KICKOFF, organiserSender, inviteWithClash)",...N.parameters?.docs?.source},description:{story:"The clash check in the drawer. Same panel, same tabs, larger hit targets.",...N.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:"drawer(KICKOFF, organiserSender, inviteWithoutClash)",...A.parameters?.docs?.source},description:{story:"Nothing booked, in the drawer.",...A.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:"drawer(KICKOFF, organiserSender, supersededInvite)",...K.parameters?.docs?.source},description:{story:"The superseded revision, in the drawer.",...K.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:"drawer(KICKOFF, organiserSender, cancelledInvite)",...W.parameters?.docs?.source},description:{story:"The cancellation still waiting on the reader, in the drawer.",...W.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:"drawer(FLIGHT, airlineSender, flightConfirmation)",...D.parameters?.docs?.source},description:{story:"The flight and its unsettled clock, in the drawer.",...D.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:"drawer(THURSDAY, organiserSender, proseTimeThread)",...O.parameters?.docs?.source},description:{story:"The hours named in prose, in the drawer.",...O.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:"drawer(PLAIN, organiserSender, nothingAboutTime)",...j.parameters?.docs?.source},description:{story:"Nothing about a time, in the drawer.",...j.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:'drawer(KICKOFF, organiserSender, inviteWithClash, "sender")',...R.parameters?.docs?.source},description:{story:"The Sender tab in the drawer, unchanged from what it was before the strip.",...R.parameters?.docs?.description}}};const pr=["InviteWithAClash","AnswerRefused","AnswerInFlight","Declined","Dismissed","AnsweredMaybe","NoCalendarYet","ReadFailure","InviteWithNothingBooked","SupersededInvitation","CancellationAwaitingYou","FlightConfirmation","ProseTimeThread","EmptyCalendarTab","SenderTabUnchanged","DrawerInviteWithAClash","DrawerInviteWithNothingBooked","DrawerSupersededInvitation","DrawerCancellationAwaitingYou","DrawerFlightConfirmation","DrawerProseTimeThread","DrawerEmptyCalendarTab","DrawerSenderTabUnchanged"];export{g as AnswerInFlight,u as AnswerRefused,f as AnsweredMaybe,T as CancellationAwaitingYou,v as Declined,w as Dismissed,W as DrawerCancellationAwaitingYou,j as DrawerEmptyCalendarTab,D as DrawerFlightConfirmation,N as DrawerInviteWithAClash,A as DrawerInviteWithNothingBooked,O as DrawerProseTimeThread,R as DrawerSenderTabUnchanged,K as DrawerSupersededInvitation,k as EmptyCalendarTab,C as FlightConfirmation,m as InviteWithAClash,x as InviteWithNothingBooked,b as NoCalendarYet,I as ProseTimeThread,y as ReadFailure,F as SenderTabUnchanged,S as SupersededInvitation,pr as __namedExportsOrder,lr as default};
