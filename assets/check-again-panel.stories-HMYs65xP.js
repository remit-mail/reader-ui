import{C as n}from"./check-again-panel-DThV_TZh.js";import{c as a}from"./spam-fixtures-iRgdabjj.js";import"./iframe-fYsS-Mr7.js";import"./preload-helper-PPVm8Dsz.js";import"./button-S2h7_ODQ.js";import"./cn-IyxL_b2c.js";import"./progress-bar-BIeBFcST.js";import"./spam-copy-CCBtykzq.js";const t=()=>{},g={title:"Design System/Spam/CheckAgainPanel",component:n,parameters:{layout:"centered"}},e={args:{state:"Running",checked:20,total:35,onStop:t}},r={args:{state:"Done",total:35,summary:{nowSpam:2,nowSuspected:0,noLongerSuspected:4},onDone:t}},o={args:{state:"PartialFailure",checked:31,total:35,failures:a,reportIssueHref:"https://github.com/remit-mail/reader/issues/new",onRetry:t,onClose:t}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    state: "Running",
    checked: 20,
    total: 35,
    onStop: noop
  }
}`,...e.parameters?.docs?.source},description:{story:"A run in flight, ten at a time.",...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: "Done",
    total: 35,
    summary: {
      nowSpam: 2,
      nowSuspected: 0,
      noLongerSuspected: 4
    },
    onDone: noop
  }
}`,...r.parameters?.docs?.source},description:{story:"Every batch landed.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: "PartialFailure",
    checked: 31,
    total: 35,
    failures: checkAgainFailuresFixture,
    reportIssueHref: "https://github.com/remit-mail/reader/issues/new",
    onRetry: noop,
    onClose: noop
  }
}`,...o.parameters?.docs?.source},description:{story:"Some messages failed; only the retryable ones go back.",...o.parameters?.docs?.description}}};const h=["Running","Done","PartialFailure"];export{r as Done,o as PartialFailure,e as Running,h as __namedExportsOrder,g as default};
