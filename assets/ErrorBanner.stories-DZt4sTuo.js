import{E as p}from"./ErrorBanner-DCIo5t7s.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./info-CITyUvnK.js";import"./createLucideIcon-B5J0h_XM.js";import"./triangle-alert-C5hLOYcH.js";import"./circle-alert-CB51jFZQ.js";import"./x-sSwTlOFF.js";const k={title:"Playground/Shipped/Mail/ErrorBanner",component:p,parameters:{layout:"padded",docs:{description:{component:`The soft, dismissible notification (#55). It sits over the toolbar and the
message list, so it is opaque and it names its own severity out loud rather
than leaving colour to carry the meaning.

Every error banner carries a prefilled report link, so reporting a failure
the user cannot act on is one click instead of a form they have to
assemble. The hrefs below stand in for the real report URL, which the app
builds from build-time constants Storybook has no \`define\` for.`}}},args:{id:"banner-1",onDismiss:()=>{}}},e="https://github.com/remit-mail/reader/issues/new?title=Spellcheck+stopped",t={name:"Error",args:{severity:"error",title:"Couldn't move message",detail:"Connection reset by peer",action:{label:"Report an issue",href:e}}},s={args:{severity:"error",title:"Couldn't move message",action:{label:"Report an issue",href:e}}},a={args:{severity:"error",title:"Couldn't report this message as spam",detail:"This account has no Junk folder. Create one named Junk or Spam in your mail provider, then report this message again.",action:{label:"Report an issue",href:e}}},o={args:{severity:"error",title:"Couldn't report this message as spam",detail:"The mail server did not answer.",action:{label:"Report an issue",href:e}}},i={args:{severity:"warning",title:"Draft saved locally",detail:"The server did not answer, so this draft has not been uploaded."}},n={args:{severity:"info",title:"Sync finished",detail:"1,204 messages are up to date."}},r={args:{severity:"warning",title:"Spellcheck stopped",detail:"Spellcheck for en is off: the checker could not start. Your browser is checking this message instead. Failed to fetch dynamically imported module.",action:{label:"Report this",href:e}}},d={args:{severity:"warning",title:"Couldn't delete this message yet",detail:"It is still being moved on the mail server. Try again in a moment.",action:{label:"Report an issue",href:e}}},c={args:{severity:"warning",title:"Couldn't delete 4 messages yet",detail:"An earlier move never finished, so where this message sits is unknown. Sync the folder, then delete it again.",action:{label:"Report an issue",href:e}}},l={name:"With Action Link (dark)",parameters:{theme:"dark"},args:r.args};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Error",
  args: {
    severity: "error",
    title: "Couldn't move message",
    detail: "Connection reset by peer",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"A mutation that failed, with the reason underneath and a way out.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "error",
    title: "Couldn't move message",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...s.parameters?.docs?.source},description:{story:"Nothing more to say than the title — the report link still stands.",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "error",
    title: "Couldn't report this message as spam",
    detail: "This account has no Junk folder. Create one named Junk or Spam in your mail provider, then report this message again.",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...a.parameters?.docs?.source},description:{story:`Report spam failing because the account has nowhere to file it. The reason
names the folder and the fix, so this one is actionable without the report
link — which is offered anyway, because the user should not have to decide.`,...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "error",
    title: "Couldn't report this message as spam",
    detail: "The mail server did not answer.",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`Report spam failing on a message under the spam warning banner, which stays
in place.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Draft saved locally",
    detail: "The server did not answer, so this draft has not been uploaded."
  }
}`,...i.parameters?.docs?.source},description:{story:"Something degraded rather than broke.",...i.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "info",
    title: "Sync finished",
    detail: "1,204 messages are up to date."
  }
}`,...n.parameters?.docs?.source},description:{story:"A statement of fact, not a problem.",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Spellcheck stopped",
    detail: "Spellcheck for en is off: the checker could not start. Your browser is checking this message instead. Failed to fetch dynamically imported module.",
    action: {
      label: "Report this",
      href: REPORT_URL
    }
  }
}`,...r.parameters?.docs?.source},description:{story:`The spellchecker stopping (#707): the writer cannot fix this one, so the
banner says what stopped, what is happening instead, and offers the report
already filled in.`,...r.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Couldn't delete this message yet",
    detail: "It is still being moved on the mail server. Try again in a moment.",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...d.parameters?.docs?.source},description:{story:`A delete refused because the message is still being moved on the mail server
(#845). Transient: the same press works once the move confirms, so the copy
says so rather than sending the user off to report a bug.`,...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Couldn't delete 4 messages yet",
    detail: "An earlier move never finished, so where this message sits is unknown. Sync the folder, then delete it again.",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...c.parameters?.docs?.source},description:{story:`The same refusal after the move gave up without confirming. Waiting will
never clear this one, so the remedy is a resync instead.`,...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "With Action Link (dark)",
  parameters: {
    theme: "dark"
  },
  args: WithActionLink.args
}`,...l.parameters?.docs?.source},description:{story:"The action link on the dark theme.",...l.parameters?.docs?.description}}};const w=["Failed","NoDetail","NoJunkFolder","ReportSpamFailed","Warning","Info","WithActionLink","PlacementInFlight","PlacementUnverified","WithActionLinkDark"];export{t as Failed,n as Info,s as NoDetail,a as NoJunkFolder,d as PlacementInFlight,c as PlacementUnverified,o as ReportSpamFailed,i as Warning,r as WithActionLink,l as WithActionLinkDark,w as __namedExportsOrder,k as default};
