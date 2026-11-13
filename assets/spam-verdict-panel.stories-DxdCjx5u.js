import{j as d}from"./iframe-fYsS-Mr7.js";import{d as p,j as m,m as u,u as l,e as g,s as h,a as S,w as v}from"./spam-fixtures-iRgdabjj.js";import{S as k}from"./spam-verdict-panel-BA-61CUr.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./intelligence-section-DXYf8NgO.js";import"./spam-copy-CCBtykzq.js";import"./spam-row-marker-CHaCsuZK.js";import"./label-chip-h6m_g3T6.js";import"./label-color-CbbIIEbk.js";const y=()=>{},A={title:"Design System/Spam/SpamVerdictPanel",component:k,parameters:{layout:"centered"},decorators:[e=>d.jsx("div",{className:"w-80 overflow-hidden rounded-lg border border-line bg-surface",children:d.jsx(e,{})})],args:{verdict:v,label:S,thresholds:h,placement:"MoveToSpam",linkComponent:({className:e,children:i})=>d.jsx("a",{href:"/settings/spam",className:e,children:i}),reportIssueHref:e=>`https://github.com/remit-mail/reader/issues/new?title=${encodeURIComponent(`Unknown spam reason ${e}`)}`,onNotSpam:y}},r={},s={args:{verdict:m,label:p}},a={args:{verdict:u}},t={args:{verdict:{state:"ScreenedOut",screen:{rule:"NeverSpam"}}}},n={args:{verdict:{state:"ScreenedOut",screen:{rule:"ReportedSender"}}}},o={args:{verdict:l}},c={args:{verdict:g,placement:"WarnOnly"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source},description:{story:"Suspected spam, warned: score, bar, every reason and what it found.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: junkPhishingVerdict,
    label: phishingLabelFixture
  }
}`,...s.parameters?.docs?.source},description:{story:"Phishing Remit moved to Spam.",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: modelJudgedVerdict
  }
}`,...a.parameters?.docs?.source},description:{story:"The model judged it, and the rail quotes its reason as returned.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: {
      state: "ScreenedOut",
      screen: {
        rule: "NeverSpam"
      }
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"Stage 1 let the message through without a check.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: {
      state: "ScreenedOut",
      screen: {
        rule: "ReportedSender"
      }
    }
  }
}`,...n.parameters?.docs?.source},description:{story:"The owner reported this sender, so their mail goes to Spam unchecked.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: unknownReasonVerdict
  }
}`,...o.parameters?.docs?.source},description:{story:"A backend symbol with no sentence shows the symbol and a report link.",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: warnOnlyAboveJunkVerdict,
    placement: "WarnOnly"
  }
}`,...c.parameters?.docs?.source},description:{story:"Warn only kept a score past the Spam threshold in place.",...c.parameters?.docs?.description}}};const F=["WarnSpam","JunkPhishing","ModelJudged","ScreenedOut","ReportedSender","UnknownReason","WarnOnlyAboveJunk"];export{s as JunkPhishing,a as ModelJudged,n as ReportedSender,t as ScreenedOut,o as UnknownReason,c as WarnOnlyAboveJunk,r as WarnSpam,F as __namedExportsOrder,A as default};
