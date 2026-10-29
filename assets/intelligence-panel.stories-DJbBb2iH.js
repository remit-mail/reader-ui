import{I as p}from"./intelligence-panel-DR2KAgTy.js";import"./iframe-Dz9ev7_1.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-BDbE0cN-.js";import"./cn-d2XQ1MEC.js";import"./avatar-BqhrHOCc.js";import"./badge-Dsqh0My3.js";import"./button-CLbVgqC1.js";import"./calendar-event-chip-Bu1FQGzL.js";import"./calendar-event-chip-content-KO-kByPh.js";import"./calendar-color-CqvBY603.js";import"./repeat-B8K_6wia.js";import"./createLucideIcon-RYwrBmYZ.js";import"./mail-lJ4T2vNk.js";import"./globe-CNSgJ-Ca.js";import"./calendar-invite-card-Bi78psgk.js";import"./attendee-row-BpO4eGMH.js";import"./minus-rkSVdKQS.js";import"./x-snW7h3us.js";import"./clock-QCzNkE3J.js";import"./check-D-jt1aUx.js";import"./calendar-clash-strip-ymGKT68d.js";import"./triangle-alert-BzExaAbk.js";import"./calendar-parse-badge-Vv98PZcJ.js";import"./file-text-DPRQ2ITA.js";import"./map-pin-DOlYB1cA.js";import"./trash-2-0YleYOuI.js";import"./bell-off-D5wXg9F3.js";import"./calendar-slot-offers-BgIOwhdm.js";import"./calendar-suggestion-deck-DQ3Yfjun.js";import"./sparkles-8ddE6svA.js";import"./event-suggestion-card-BODkqQQL.js";import"./blocked-reason-CuncjwVb.js";import"./plus-BjlLK1hC.js";import"./calendar-days-D4PAqIok.js";import"./reply-CnC3lsA8.js";import"./segmented-control-tDDqEOk4.js";import"./star-CgN1A-T5.js";import"./shield-check-D0ywmRdg.js";import"./shield-alert-D0TTzBU-.js";const e={sender:{name:"Alex Rivera",email:"alex@example.com",trust:"wellknown",firstSeenLabel:"Jan 2025"},authenticity:{verdict:"aligned",fromDomain:"example.com",dkimDomain:"example.com",summary:"This message was signed by example.com."},category:{value:"personal"}},$={title:"Playground/Shipped/Mail/IntelligencePanel",component:p,parameters:{layout:"centered"}},o={args:{data:e}},i={args:{data:{...e,sender:{name:"Notifications",email:"no-reply@unknown-source.example",trust:"unknown",firstSeenLabel:"today"},authenticity:{verdict:"caution",fromDomain:"unknown-source.example",summary:"We can't verify the sender of this email, which could mean it's from an insecure source."}}}},m={args:{data:{...e,sender:{name:"InfoMedics",email:"jira@serviceupdatebank.atlassian.net",trust:"unknown",firstSeenLabel:"today"},category:{value:"automated"},authenticity:{verdict:"caution",fromDomain:"serviceupdatebank.atlassian.net",dkimDomain:"custmx.one.com",claimedBrand:"InfoMedics",summary:'The name it shows, "InfoMedics", has nothing to do with serviceupdatebank.atlassian.net. Its links go to betaal-vordering.example.'}}}},d={args:{data:{...e,sender:{name:"InfoMedics",email:"billing@1nfomedics.nl",trust:"unknown",firstSeenLabel:"today"},category:{value:"transactional"},authenticity:{verdict:"caution",fromDomain:"1nfomedics.nl",dkimDomain:"1nfomedics.nl",claimedBrand:"InfoMedics",summary:'The name it shows, "InfoMedics", only looks like 1nfomedics.nl.'}}}},c={args:{data:{...e,sender:{name:"Your Bank",email:"security@your-bank.example",trust:"unknown",firstSeenLabel:"today"},category:{value:"automated"},authenticity:{verdict:"mismatch",fromDomain:"your-bank.example",dkimDomain:"mailer.suspicious.example",claimedBrand:"Your Bank",summary:'The display name claims "Your Bank", but this message was actually sent from mailer.suspicious.example — not your-bank.example. Real senders use their own address.'}}}},l={args:{data:{...e,sender:{name:"Mailbox Admin",email:"missing_mailbox@missing_domain",trust:"unknown",firstSeenLabel:"today",addressUnverified:!0},category:{value:"uncategorized"},authenticity:{verdict:"mismatch",fromDomain:"",addressUnreadable:!0,summary:"We couldn't read this sender's address, so we can't confirm who really sent this message."}}}},a={args:{data:e,actions:{onReportSpam:()=>{}}}},t={args:{data:e,actions:{onNotSpam:()=>{}}}},r={args:{data:e,actions:{}}},s={args:{data:e,actions:{onReportSpam:()=>{}},reportSpamPending:!0}},n={args:{data:e,actions:{onNotSpam:()=>{}},notSpamPending:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    data: base
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: {
        name: "Notifications",
        email: "no-reply@unknown-source.example",
        trust: "unknown",
        firstSeenLabel: "today"
      },
      authenticity: {
        verdict: "caution",
        fromDomain: "unknown-source.example",
        summary: "We can't verify the sender of this email, which could mean it's from an insecure source."
      }
    }
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: {
        name: "InfoMedics",
        email: "jira@serviceupdatebank.atlassian.net",
        trust: "unknown",
        firstSeenLabel: "today"
      },
      category: {
        value: "automated"
      },
      authenticity: {
        verdict: "caution",
        fromDomain: "serviceupdatebank.atlassian.net",
        // Deliberately a different domain than fromDomain: the display-name
        // check compared "InfoMedics" against the sender's own domain, never
        // this one, so the summary must name serviceupdatebank.atlassian.net.
        dkimDomain: "custmx.one.com",
        claimedBrand: "InfoMedics",
        summary: 'The name it shows, "InfoMedics", has nothing to do with serviceupdatebank.atlassian.net. Its links go to betaal-vordering.example.'
      }
    }
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: {
        name: "InfoMedics",
        email: "billing@1nfomedics.nl",
        trust: "unknown",
        firstSeenLabel: "today"
      },
      category: {
        value: "transactional"
      },
      authenticity: {
        verdict: "caution",
        fromDomain: "1nfomedics.nl",
        dkimDomain: "1nfomedics.nl",
        claimedBrand: "InfoMedics",
        summary: 'The name it shows, "InfoMedics", only looks like 1nfomedics.nl.'
      }
    }
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: {
        name: "Your Bank",
        email: "security@your-bank.example",
        trust: "unknown",
        firstSeenLabel: "today"
      },
      category: {
        value: "automated"
      },
      authenticity: {
        verdict: "mismatch",
        fromDomain: "your-bank.example",
        dkimDomain: "mailer.suspicious.example",
        claimedBrand: "Your Bank",
        summary: 'The display name claims "Your Bank", but this message was actually sent from mailer.suspicious.example — not your-bank.example. Real senders use their own address.'
      }
    }
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: {
        name: "Mailbox Admin",
        email: "missing_mailbox@missing_domain",
        trust: "unknown",
        firstSeenLabel: "today",
        addressUnverified: true
      },
      category: {
        value: "uncategorized"
      },
      authenticity: {
        verdict: "mismatch",
        fromDomain: "",
        addressUnreadable: true,
        summary: "We couldn't read this sender's address, so we can't confirm who really sent this message."
      }
    }
  }
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    }
  }
}`,...a.parameters?.docs?.source},description:{story:`The spam quick actions are a contextual pair, decided by whether the message
carries a spam report — never by the mailbox it happens to sit in, since a
report on a message already in Junk (the provider's own filter put it there)
is a real, no-op-move case (issue #648). A reportable message offers
"Report spam".`,...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onNotSpam: () => {}
    }
  }
}`,...t.parameters?.docs?.source},description:{story:'Already reported: "Not spam" (the undo) is offered instead of "Report\nspam", and the panel names the message as reported. Driven by\n`actions.onNotSpam` being present, not by `flags.blocked` — a sender can be\nblocked manually, with no report on this particular message, and that must\nnot read as "you reported this" (issue #648 review).',...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {}
  }
}`,...r.parameters?.docs?.source},description:{story:`Neither action is offered. The panel hides the pair rather than disabling
it — unlike VIP/Mute, which always render and go visibly
unavailable with no handler (issue #51). The host's own wiring never
actually reaches this: \`resolveSpamAction\` always returns one of the two,
since every message either carries a spam report or doesn't. Kept as a
defensive state for a host that doesn't wire the pair at all.`,...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    },
    reportSpamPending: true
  }
}`,...s.parameters?.docs?.source},description:{story:`A "Report spam" press in flight. There's no optimistic update for this
action (a report against a message already in Junk is a real no-op-move,
issue #648), so without a pending label the button gives no visible
response at all until the request lands — the dead-button failure the
coding standards call the worst outcome. The button is disabled for the
duration: the server dedupes message ids only within a single request, so
a second press mid-flight would fire a second, concurrent request rather
than join the first (issue #648 review). Still visibly a button, never
dead — the "Reporting…" label carries that.`,...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onNotSpam: () => {}
    },
    notSpamPending: true
  }
}`,...n.parameters?.docs?.source},description:{story:'The undo direction\'s equivalent — "Undoing…" while `notSpam` is in flight.',...n.parameters?.docs?.description}}};const ee=["Aligned","CautionNoSignal","SignedButUnrecognised","SignedButLookalikeName","Impersonation","UnreadableSender","Reportable","Reported","SpamActionUnavailable","ReportSpamPending","NotSpamPending"];export{o as Aligned,i as CautionNoSignal,c as Impersonation,n as NotSpamPending,s as ReportSpamPending,a as Reportable,t as Reported,d as SignedButLookalikeName,m as SignedButUnrecognised,r as SpamActionUnavailable,l as UnreadableSender,ee as __namedExportsOrder,$ as default};
