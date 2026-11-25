import{C as a}from"./check-again-panel-2it0dThR.js";import{c as s}from"./spam-fixtures-z-0-SrO5.js";import"./iframe-4Y_dM_UU.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BNcng5Oi.js";import"./cn-IyxL_b2c.js";import"./progress-bar-BQ_ueebZ.js";import"./spam-copy-BkJFtcVg.js";const t=()=>{},h={title:"Design System/Spam/CheckAgainPanel",component:a,parameters:{layout:"centered"}},e={args:{state:"Running",checked:20,total:35,onStop:t}},o={args:{state:"Done",total:35,summary:{nowSpam:2,nowSuspected:0,noLongerSuspected:4,moved:4},onDone:t}},n={args:{state:"Done",total:1,summary:{nowSpam:0,nowSuspected:0,noLongerSuspected:0,moved:1},onDone:t}},r={args:{state:"PartialFailure",checked:31,total:35,failures:s,reportIssueHref:"https://github.com/remit-mail/reader/issues/new",onRetry:t,onClose:t}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    state: "Running",
    checked: 20,
    total: 35,
    onStop: noop
  }
}`,...e.parameters?.docs?.source},description:{story:"A run in flight, ten at a time.",...e.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: "Done",
    total: 35,
    summary: {
      nowSpam: 2,
      nowSuspected: 0,
      noLongerSuspected: 4,
      moved: 4
    },
    onDone: noop
  }
}`,...o.parameters?.docs?.source},description:{story:"Every batch landed.",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    state: "Done",
    total: 1,
    summary: {
      nowSpam: 0,
      nowSuspected: 0,
      noLongerSuspected: 0,
      moved: 1
    },
    onDone: noop
  }
}`,...n.parameters?.docs?.source},description:{story:"Placement can move a message even when its verdict is unchanged.",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: "PartialFailure",
    checked: 31,
    total: 35,
    failures: checkAgainFailuresFixture,
    reportIssueHref: "https://github.com/remit-mail/reader/issues/new",
    onRetry: noop,
    onClose: noop
  }
}`,...r.parameters?.docs?.source},description:{story:"Some messages failed; only the retryable ones go back.",...r.parameters?.docs?.description}}};const S=["Running","Done","MovedWithoutVerdictChange","PartialFailure"];export{o as Done,n as MovedWithoutVerdictChange,r as PartialFailure,e as Running,S as __namedExportsOrder,h as default};
