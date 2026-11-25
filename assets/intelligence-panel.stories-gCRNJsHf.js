import{j as d}from"./iframe-4Y_dM_UU.js";import{I as g}from"./intelligence-panel-CFmrWRXd.js";import{s as f,a as b,w as k}from"./spam-fixtures-z-0-SrO5.js";import{S as R}from"./spam-verdict-panel-Dhu90jbH.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-4vprz89G.js";import"./cn-IyxL_b2c.js";import"./avatar-VuE91yj1.js";import"./badge-BALHcx9W.js";import"./button-BNcng5Oi.js";import"./calendar-event-chip-BbOjVQUp.js";import"./calendar-color-CqvBY603.js";import"./repeat-CyVMIsMy.js";import"./createLucideIcon-DkKJcbI9.js";import"./mail-1N_4GVps.js";import"./globe-CVBGglCM.js";import"./calendar-failure-note-B5iSFSZg.js";import"./triangle-alert-Bnrh-J2F.js";import"./calendar-invite-card-GAeyuXSS.js";import"./attendee-row-DPYPrVZ5.js";import"./minus-DGSQI1I1.js";import"./x-Cy-ShthB.js";import"./clock-J1C0g1gG.js";import"./check-DSdQDF54.js";import"./calendar-clash-strip-Bat4ioKM.js";import"./calendar-parse-badge-BVXD59cC.js";import"./file-text-BmCePHPh.js";import"./map-pin-CE8Z3xzB.js";import"./trash-q_49bOYx.js";import"./bell-off-4OZczxgd.js";import"./calendar-slot-offers-bL1CeUKW.js";import"./calendar-suggestion-list-pAjvbmY2.js";import"./sparkles-D_Q6aOk4.js";import"./event-suggestion-card-D3cC6pKk.js";import"./blocked-reason-THUdDQwz.js";import"./plus-PRuHRyZn.js";import"./intelligence-section-DA7oiz81.js";import"./calendar-days-hBuBL6bE.js";import"./reply-BHaPCgZO.js";import"./enums-Cgr9j7ds.js";import"./segmented-control-BMMnmHxf.js";import"./star-DJsZr7L-.js";import"./spam-copy-BkJFtcVg.js";import"./spam-row-marker-frlPmoPM.js";import"./label-chip-BdNnltY-.js";import"./label-color-CbbIIEbk.js";const e={sender:{name:"Alex Rivera",email:"alex@example.com",trust:"wellknown",firstSeenLabel:"Jan 2025"},category:{value:"personal"},spamAction:"reportSpam"},ue={title:"Playground/Shipped/Mail/IntelligencePanel",component:g,parameters:{layout:"centered"}},a={args:{data:e}},r={args:{data:{...e,sender:{name:"Mailbox Admin",email:"missing_mailbox@missing_domain",trust:"unknown",firstSeenLabel:"today",addressUnverified:!0},category:{value:"uncategorized"}}}},o={args:{data:e,actions:{onReportSpam:()=>{}}}},n={args:{data:e,actions:{onReportSpam:()=>{}},spamCheck:d.jsx(R,{verdict:k,label:b,thresholds:f,placement:"MoveToSpam",linkComponent:({className:l,children:S})=>d.jsx("a",{href:"/settings/spam",className:l,children:S}),reportIssueHref:()=>"https://github.com/remit-mail/reader/issues/new",onNotSpam:()=>{}})}},t={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}}}},s={args:{data:e,actions:{onReportSpam:()=>{}},reportSpamPending:!0}},u={name:"Weekly Deals",email:"news@deals.example",trust:"unknown",firstSeenLabel:"today"},m={args:{data:{...e,sender:u,category:{value:"newsletter"},placement:{action:"MoveToInbox",confidence:"Unsure",fromPlacement:"junk",reasons:["no-confident-signal","junk-not-rescued"],dryRun:!1}},actions:{onReportSpam:()=>{}}}},p={args:{data:{...e,sender:u,category:{value:"automated"},placement:{action:"MoveToJunk",confidence:"Confident",fromPlacement:"junk",reasons:["classifier=spam"],dryRun:!1},spamAction:"notSpam"},actions:{onNotSpam:()=>{}}}},i={args:{data:e,actions:{onReportSpam:()=>{}}}},c={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}},notSpamPending:!0}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
