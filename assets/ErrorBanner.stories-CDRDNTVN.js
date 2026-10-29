import{E as l}from"./ErrorBanner-BDGblKOq.js";import"./iframe-Dz9ev7_1.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./info-BXj270ki.js";import"./createLucideIcon-RYwrBmYZ.js";import"./triangle-alert-BzExaAbk.js";import"./circle-alert-CcoNAO8C.js";import"./x-snW7h3us.js";const b={title:"Playground/Shipped/Mail/ErrorBanner",component:l,parameters:{layout:"padded",docs:{description:{component:`The soft, dismissible notification (#55). It sits over the toolbar and the
message list, so it is opaque and it names its own severity out loud rather
than leaving colour to carry the meaning.

Every error banner carries a prefilled report link, so reporting a failure
the user cannot act on is one click instead of a form they have to
assemble. The hrefs below stand in for the real report URL, which the app
builds from build-time constants Storybook has no \`define\` for.`}}},args:{id:"banner-1",onDismiss:()=>{}}},r="https://github.com/remit-mail/reader/issues/new?title=Spellcheck+stopped",t={name:"Error",args:{severity:"error",title:"Couldn't move message",detail:"Connection reset by peer",action:{label:"Report an issue",href:r}}},s={args:{severity:"error",title:"Couldn't move message",action:{label:"Report an issue",href:r}}},a={args:{severity:"error",title:"Couldn't report this message as spam",detail:"This account has no Junk folder. Create one named Junk or Spam in your mail provider, then report this message again.",action:{label:"Report an issue",href:r}}},o={args:{severity:"warning",title:"Draft saved locally",detail:"The server did not answer, so this draft has not been uploaded."}},i={args:{severity:"info",title:"Sync finished",detail:"1,204 messages are up to date."}},e={args:{severity:"warning",title:"Spellcheck stopped",detail:"Spellcheck for en is off: the checker could not start. Your browser is checking this message instead. Failed to fetch dynamically imported module.",action:{label:"Report this",href:r}}},n={args:{severity:"warning",title:"Couldn't delete this message yet",detail:"It is still being moved on the mail server. Try again in a moment.",action:{label:"Report an issue",href:r}}},c={args:{severity:"warning",title:"Couldn't delete 4 messages yet",detail:"An earlier move never finished, so where this message sits is unknown. Sync the folder, then delete it again.",action:{label:"Report an issue",href:r}}},d={name:"With Action Link (dark)",parameters:{theme:"dark"},args:e.args};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
    severity: "warning",
    title: "Draft saved locally",
    detail: "The server did not answer, so this draft has not been uploaded."
  }
}`,...o.parameters?.docs?.source},description:{story:"Something degraded rather than broke.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "info",
    title: "Sync finished",
    detail: "1,204 messages are up to date."
  }
}`,...i.parameters?.docs?.source},description:{story:"A statement of fact, not a problem.",...i.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Spellcheck stopped",
    detail: "Spellcheck for en is off: the checker could not start. Your browser is checking this message instead. Failed to fetch dynamically imported module.",
    action: {
      label: "Report this",
      href: REPORT_URL
    }
  }
}`,...e.parameters?.docs?.source},description:{story:`The spellchecker stopping (#707): the writer cannot fix this one, so the
banner says what stopped, what is happening instead, and offers the report
already filled in.`,...e.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    severity: "warning",
    title: "Couldn't delete this message yet",
    detail: "It is still being moved on the mail server. Try again in a moment.",
    action: {
      label: "Report an issue",
      href: REPORT_URL
    }
  }
}`,...n.parameters?.docs?.source},description:{story:`A delete refused because the message is still being moved on the mail server
(#845). Transient: the same press works once the move confirms, so the copy
says so rather than sending the user off to report a bug.`,...n.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
never clear this one, so the remedy is a resync instead.`,...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "With Action Link (dark)",
  parameters: {
    theme: "dark"
  },
  args: WithActionLink.args
}`,...d.parameters?.docs?.source},description:{story:"The action link on the dark theme.",...d.parameters?.docs?.description}}};const R=["Failed","NoDetail","NoJunkFolder","Warning","Info","WithActionLink","PlacementInFlight","PlacementUnverified","WithActionLinkDark"];export{t as Failed,i as Info,s as NoDetail,a as NoJunkFolder,n as PlacementInFlight,c as PlacementUnverified,o as Warning,e as WithActionLink,d as WithActionLinkDark,R as __namedExportsOrder,b as default};
