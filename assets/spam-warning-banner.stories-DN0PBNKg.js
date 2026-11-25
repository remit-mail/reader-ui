import{j as e}from"./iframe-4Y_dM_UU.js";import{f as p,g as m,n as l,h as g,w as h}from"./spam-fixtures-z-0-SrO5.js";import{S as u}from"./spam-warning-banner-iuOL0tnV.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./banner-Dq9rhq1I.js";import"./button-BNcng5Oi.js";import"./x-Cy-ShthB.js";import"./createLucideIcon-DkKJcbI9.js";import"./spam-copy-BkJFtcVg.js";import"./circle-question-mark-EomEsxf1.js";import"./shield-alert--T5XA0yY.js";import"./triangle-alert-Bnrh-J2F.js";const S=c=>e.jsxs("div",{className:"max-w-3xl overflow-hidden rounded-lg border border-line bg-canvas",children:[e.jsxs("div",{className:"border-b border-line px-5 py-3",children:[e.jsx("p",{className:"text-base font-semibold text-fg",children:"Subject line"}),e.jsx("p",{className:"text-xs text-fg-muted",children:"Sender name <sender@example.com> to me · 09:14"})]}),e.jsx(c,{}),e.jsx("article",{className:"px-5 py-4 text-sm text-fg",children:"The body of the message starts here."})]}),r=()=>{},F={title:"Design System/Spam/SpamWarningBanner",component:u,parameters:{layout:"padded"},decorators:[S],args:{verdict:h,inSpamFolder:!1,onNotSpam:r,onReport:r,onMove:r,onWhy:r,onCheckAgain:r}},s={},a={args:{verdict:g}},o={args:{verdict:m}},t={args:{verdict:l}},n={args:{verdict:p}},i={args:{pending:"NotSpam"}},d={globals:{viewport:{value:"mobile"}},decorators:[c=>e.jsx("div",{style:{width:360},children:e.jsx(c,{})})]};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source},description:{story:"A suspected spam message stays in its folder under the warning tone.",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: warnPhishingVerdict
  }
}`,...a.parameters?.docs?.source},description:{story:"Suspected phishing takes the danger tone and announces as an alert.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: modelSkippedVerdict
  }
}`,...o.parameters?.docs?.source},description:{story:"The model call was skipped; the banner names why.",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: nowJunkVerdict
  }
}`,...t.parameters?.docs?.source},description:{story:"Check again reached the Spam threshold for a message outside Spam.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: failedVerdict
  }
}`,...n.parameters?.docs?.source},description:{story:"The spam service gave no verdict.",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    pending: "NotSpam"
  }
}`,...i.parameters?.docs?.source},description:{story:"Not spam is in flight: it names its work and both mutating buttons hold.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  globals: {
    viewport: {
      value: "mobile"
    }
  },
  decorators: [Story => <div style={{
    width: 360
  }}>
                <Story />
            </div>]
}`,...d.parameters?.docs?.source},description:{story:"The buttons wrap rather than scroll on a 360px screen.",...d.parameters?.docs?.description}}};const J=["WarnSpam","WarnPhishing","ModelSkipped","NowJunk","CheckFailed","Pending","Phone"];export{n as CheckFailed,o as ModelSkipped,t as NowJunk,i as Pending,d as Phone,a as WarnPhishing,s as WarnSpam,J as __namedExportsOrder,F as default};
