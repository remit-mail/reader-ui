import{j as d}from"./iframe-DUn0T08W.js";import{I as g}from"./intelligence-panel-CwSrI5hb.js";import{s as f,a as b,w as k}from"./spam-fixtures-z-0-SrO5.js";import{S as R}from"./spam-verdict-panel-6sLhSsoP.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-4vprz89G.js";import"./cn-IyxL_b2c.js";import"./avatar-uqshRSnj.js";import"./badge-DVSnq8Ns.js";import"./button-BgYe3szE.js";import"./calendar-event-chip-B7qfckdP.js";import"./calendar-color-CqvBY603.js";import"./repeat-6HJbWKxZ.js";import"./createLucideIcon-BO9sjSGA.js";import"./mail-DoYzsxpw.js";import"./globe-CagDWj-T.js";import"./calendar-failure-note-BTEAfKqu.js";import"./triangle-alert-CDC1gVbd.js";import"./calendar-invite-card-C0dRk8yI.js";import"./attendee-row-CdTKGozd.js";import"./minus-CDlI3PPe.js";import"./x-D26GNrGg.js";import"./clock-CyTpi23Y.js";import"./check-D47ZSDJv.js";import"./calendar-clash-strip-B6-75ZaH.js";import"./calendar-parse-badge-14tKWN0J.js";import"./file-text-a4VOwwvH.js";import"./map-pin-DaFgrBXH.js";import"./trash-TQGHNCuP.js";import"./bell-off-C5CqTBDo.js";import"./calendar-slot-offers-CxX5Jv1g.js";import"./calendar-suggestion-list-CTFIzEi0.js";import"./sparkles-BtLTmjcv.js";import"./event-suggestion-card-B3IuJRq2.js";import"./blocked-reason-ChjFMccJ.js";import"./plus-BP0Jd8NF.js";import"./intelligence-section-CZbS0lwY.js";import"./calendar-days-EGloaown.js";import"./reply-CA5PRuil.js";import"./enums-CYhxgZ_x.js";import"./segmented-control-B04huina.js";import"./star-Cbz_ngPP.js";import"./spam-copy-BkJFtcVg.js";import"./spam-row-marker-BFgfHVCk.js";import"./label-chip-Dcm-1SvV.js";import"./label-color-CbbIIEbk.js";const e={sender:{name:"Alex Rivera",email:"alex@example.com",trust:"wellknown",firstSeenLabel:"Jan 2025"},category:{value:"personal"},spamAction:"reportSpam"},ue={title:"Playground/Shipped/Mail/IntelligencePanel",component:g,parameters:{layout:"centered"}},a={args:{data:e}},r={args:{data:{...e,sender:{name:"Mailbox Admin",email:"missing_mailbox@missing_domain",trust:"unknown",firstSeenLabel:"today",addressUnverified:!0},category:{value:"uncategorized"}}}},o={args:{data:e,actions:{onReportSpam:()=>{}}}},n={args:{data:e,actions:{onReportSpam:()=>{}},spamCheck:d.jsx(R,{verdict:k,label:b,thresholds:f,placement:"MoveToSpam",linkComponent:({className:l,children:S})=>d.jsx("a",{href:"/settings/spam",className:l,children:S}),reportIssueHref:()=>"https://github.com/remit-mail/reader/issues/new",onNotSpam:()=>{}})}},t={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}}}},s={args:{data:e,actions:{onReportSpam:()=>{}},reportSpamPending:!0}},u={name:"Weekly Deals",email:"news@deals.example",trust:"unknown",firstSeenLabel:"today"},m={args:{data:{...e,sender:u,category:{value:"newsletter"},placement:{action:"MoveToInbox",confidence:"Unsure",fromPlacement:"junk",reasons:["no-confident-signal","junk-not-rescued"],dryRun:!1}},actions:{onReportSpam:()=>{}}}},p={args:{data:{...e,sender:u,category:{value:"automated"},placement:{action:"MoveToJunk",confidence:"Confident",fromPlacement:"junk",reasons:["classifier=spam"],dryRun:!1},spamAction:"notSpam"},actions:{onNotSpam:()=>{}}}},i={args:{data:e,actions:{onReportSpam:()=>{}}}},c={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}},notSpamPending:!0}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    data: base
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
      }
    }
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    }
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    },
    spamCheck: <SpamVerdictPanel verdict={warnSpamVerdict} label={spamLabelFixture} thresholds={spamThresholdsFixture} placement="MoveToSpam" linkComponent={({
      className,
      children
    }) => <a href="/settings/spam" className={className}>
                        {children}
                    </a>} reportIssueHref={() => "https://github.com/remit-mail/reader/issues/new"} onNotSpam={() => {}} />
  }
}`,...n.parameters?.docs?.source},description:{story:"A warned message: the Spam check section sits under Sender.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      spamAction: "undoSpamReport"
    },
    actions: {
      onNotSpam: () => {}
    }
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    },
    reportSpamPending: true
  }
}`,...s.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: unknownSender,
      category: {
        value: "newsletter"
      },
      placement: {
        action: "MoveToInbox",
        confidence: "Unsure",
        fromPlacement: "junk",
        reasons: ["no-confident-signal", "junk-not-rescued"],
        dryRun: false
      }
    },
    actions: {
      onReportSpam: () => {}
    }
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      sender: unknownSender,
      category: {
        value: "automated"
      },
      placement: {
        action: "MoveToJunk",
        confidence: "Confident",
        fromPlacement: "junk",
        reasons: ["classifier=spam"],
        dryRun: false
      },
      spamAction: "notSpam"
    },
    actions: {
      onNotSpam: () => {}
    }
  }
}`,...p.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    data: base,
    actions: {
      onReportSpam: () => {}
    }
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      ...base,
      spamAction: "undoSpamReport"
    },
    actions: {
      onNotSpam: () => {}
    },
    notSpamPending: true
  }
}`,...c.parameters?.docs?.source}}};const le=["Default","UnreadableSender","Reportable","WithSpamCheck","Reported","ReportSpamPending","MovedOutOfJunkUnsure","KeptInJunkByClassifier","LeftInInboxNoVerdict","NotSpamPending"];export{a as Default,p as KeptInJunkByClassifier,i as LeftInInboxNoVerdict,m as MovedOutOfJunkUnsure,c as NotSpamPending,s as ReportSpamPending,o as Reportable,t as Reported,r as UnreadableSender,n as WithSpamCheck,le as __namedExportsOrder,ue as default};
