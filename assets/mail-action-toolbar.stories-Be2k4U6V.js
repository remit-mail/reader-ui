import{j as t}from"./iframe-Dz9ev7_1.js";import{M as i}from"./mail-action-toolbar-DxRAdRgZ.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./button-CLbVgqC1.js";import"./reply-CnC3lsA8.js";import"./createLucideIcon-RYwrBmYZ.js";import"./reply-all-DKaWS7mu.js";import"./trash-2-0YleYOuI.js";import"./folder-input-D2DV_-7p.js";import"./star-CgN1A-T5.js";const b={title:"Design System/Mail/MailActionToolbar",component:i,parameters:{layout:"centered"},decorators:[(n=>t.jsx("div",{className:"overflow-hidden rounded-lg border border-line",style:{width:720},children:t.jsx(n,{})}))],args:{hasThread:!0,onReply:()=>{},onReplyAll:()=>{},onForward:()=>{},onDelete:()=>{},onMove:()=>{},onToggleStar:()=>{},onUnavailable:()=>{}}},e={args:{isStarred:!1}},r={args:{isStarred:!0}},s={args:{isStarred:void 0}},a={args:{showTriage:!1}},o={args:{hasThread:!1,unavailableHint:"Open a message first"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    isStarred: false
  }
}`,...e.parameters?.docs?.source},description:{story:"The conversation has answered and the open message is not starred.",...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    isStarred: true
  }
}`,...r.parameters?.docs?.source},description:{story:`The open message is starred: the star is lit and reads as pressed. It
 follows the conversation, not the list row that opened it (#602).`,...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isStarred: undefined
  }
}`,...s.parameters?.docs?.source},description:{story:'The conversation has not answered yet, so the star state is unknown. The\n button omits `aria-pressed` rather than announcing "not pressed" for a\n message that may well be starred.',...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    showTriage: false
  }
}`,...a.parameters?.docs?.source},description:{story:`The mobile pane's management bar already owns triage, so the toolbar drops
 the cluster instead of offering a second set of the same accessible names.`,...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    hasThread: false,
    unavailableHint: "Open a message first"
  }
}`,...o.parameters?.docs?.source},description:{story:`No message open: the verbs no-op and the bar surfaces a one-line reason
 instead of disabling.`,...o.parameters?.docs?.description}}};const T=["Default","Starred","StarUnknown","WithoutTriage","NoMessageOpen"];export{e as Default,o as NoMessageOpen,s as StarUnknown,r as Starred,a as WithoutTriage,T as __namedExportsOrder,b as default};
