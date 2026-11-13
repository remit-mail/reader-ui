import{j as d}from"./iframe-fYsS-Mr7.js";import{I as g}from"./intelligence-panel-t5-LqEno.js";import{s as f,a as b,w as R}from"./spam-fixtures-iRgdabjj.js";import{S as h}from"./spam-verdict-panel-BA-61CUr.js";import"./preload-helper-PPVm8Dsz.js";import"./category-presentation-4vprz89G.js";import"./cn-IyxL_b2c.js";import"./avatar-aV0gIO8j.js";import"./badge-CZgi-7XL.js";import"./button-S2h7_ODQ.js";import"./calendar-event-chip-D78Phz7N.js";import"./calendar-color-CqvBY603.js";import"./repeat-DUzgTyc4.js";import"./createLucideIcon-B5J0h_XM.js";import"./mail-CSMuoKF3.js";import"./globe-DMBwvAOE.js";import"./calendar-failure-note-yrQatvg_.js";import"./triangle-alert-C5hLOYcH.js";import"./calendar-invite-card-C_V_bQer.js";import"./attendee-row-CC3KxCPl.js";import"./minus-DMpYC7y2.js";import"./x-sSwTlOFF.js";import"./clock-BU-oGQ2u.js";import"./check-ClpQiEYg.js";import"./calendar-clash-strip-15mhh4pl.js";import"./calendar-parse-badge-QZmVvp_G.js";import"./file-text-ByqS7Kt2.js";import"./map-pin-N9se7Rv0.js";import"./trash-CtpmnHuk.js";import"./bell-off-CiNIWXAg.js";import"./calendar-slot-offers-DHc_VmpG.js";import"./calendar-suggestion-list-1B1pDz5T.js";import"./sparkles-tBYydyJD.js";import"./event-suggestion-card-DoyfbFTH.js";import"./blocked-reason--dVpmaO7.js";import"./plus-BgwexbCS.js";import"./intelligence-section-DXYf8NgO.js";import"./calendar-days-Bsdw_fPO.js";import"./reply-D3av_T3Q.js";import"./enums-CyACTv6m.js";import"./segmented-control-BCWH9RHF.js";import"./star-j_TS7MKt.js";import"./spam-copy-CCBtykzq.js";import"./spam-row-marker-CHaCsuZK.js";import"./label-chip-h6m_g3T6.js";import"./label-color-CbbIIEbk.js";const e={sender:{name:"Alex Rivera",email:"alex@example.com",trust:"wellknown",firstSeenLabel:"Jan 2025"},category:{value:"personal"},spamAction:"reportSpam"},le={title:"Playground/Shipped/Mail/IntelligencePanel",component:g,parameters:{layout:"centered"}},n={args:{data:e}},r={args:{data:{...e,sender:{name:"Mailbox Admin",email:"missing_mailbox@missing_domain",trust:"unknown",firstSeenLabel:"today",addressUnverified:!0},category:{value:"uncategorized"}}}},o={args:{data:e,actions:{onReportSpam:()=>{}}}},a={args:{data:e,actions:{onReportSpam:()=>{}},spamCheck:d.jsx(h,{verdict:R,label:b,thresholds:f,placement:"MoveToSpam",linkComponent:({className:u,children:S})=>d.jsx("a",{href:"/settings/spam",className:u,children:S}),reportIssueHref:()=>"https://github.com/remit-mail/reader/issues/new",onNotSpam:()=>{}})}},t={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}}}},s={args:{data:e,actions:{onReportSpam:()=>{}},reportSpamPending:!0}},l={name:"Weekly Deals",email:"news@deals.example",trust:"unknown",firstSeenLabel:"today"},m={args:{data:{...e,sender:l,category:{value:"newsletter"},placement:{action:"MoveToInbox",confidence:"Unsure",fromPlacement:"junk",reasons:["no-confident-signal","newer-server-code"],dryRun:!1}},actions:{onReportSpam:()=>{}}}},p={args:{data:{...e,sender:l,category:{value:"automated"},placement:{action:"MoveToJunk",confidence:"Confident",fromPlacement:"junk",reasons:["classifier=spam"],dryRun:!1},spamAction:"notSpam"},actions:{onNotSpam:()=>{}}}},i={args:{data:e,actions:{onReportSpam:()=>{}}}},c={args:{data:{...e,spamAction:"undoSpamReport"},actions:{onNotSpam:()=>{}},notSpamPending:!0}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    data: base
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:"A warned message: the Spam check section sits under Sender.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
        reasons: ["no-confident-signal", "newer-server-code"],
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
}`,...c.parameters?.docs?.source}}};const ue=["Default","UnreadableSender","Reportable","WithSpamCheck","Reported","ReportSpamPending","MovedOutOfJunkUnsure","KeptInJunkByClassifier","LeftInInboxNoVerdict","NotSpamPending"];export{n as Default,p as KeptInJunkByClassifier,i as LeftInInboxNoVerdict,m as MovedOutOfJunkUnsure,c as NotSpamPending,s as ReportSpamPending,o as Reportable,t as Reported,r as UnreadableSender,a as WithSpamCheck,ue as __namedExportsOrder,le as default};
