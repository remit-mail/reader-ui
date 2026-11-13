import{j as t}from"./iframe-fYsS-Mr7.js";import{B as i}from"./button-S2h7_ODQ.js";import{M as d}from"./mobile-message-action-bar-CiYnn1kb.js";import{F as p}from"./folder-input-CAj8Id1L.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./popover-menu-ehwPF20G.js";import"./index-DbNRduy1.js";import"./index-BNekr84Q.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./createLucideIcon-B5J0h_XM.js";import"./reply-D3av_T3Q.js";import"./reply-all-CvY-YYIb.js";import"./star-j_TS7MKt.js";import"./trash-CtpmnHuk.js";import"./mail-CSMuoKF3.js";import"./mail-open-DdbEEvw_.js";const m=t.jsx(i,{variant:"ghost",size:"sm",icon:t.jsx(p,{className:"size-5"}),"aria-label":"Move to folder",title:"Move to folder",className:"min-h-11 min-w-11 px-0"}),R={title:"Design System/Mail/MobileMessageActionBar",component:d,parameters:{layout:"centered"},decorators:[(n=>t.jsx("div",{className:"overflow-hidden rounded-lg border border-line",style:{width:390},children:t.jsx(n,{})}))],args:{hasThread:!0,moveSlot:m,onReply:()=>{},onReplyAll:()=>{},onForward:()=>{},onToggleStar:()=>{},onDelete:()=>{},onToggleRead:()=>{},onUnavailable:()=>{}}},o={},s={args:{isStarred:!0}},e={args:{onForward:void 0}},r={args:{hasThread:!1,unavailableHint:"Open a message first"}},a={args:{hasThread:!1,unavailableHint:"Open a message first",onForward:void 0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    isStarred: true
  }
}`,...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    onForward: undefined
  }
}`,...e.parameters?.docs?.source},description:{story:`A host that cannot answer a verb omits its handler and the bar drops the
 button, rather than offering one that reacts to nothing.`,...e.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    hasThread: false,
    unavailableHint: "Open a message first"
  }
}`,...r.parameters?.docs?.source},description:{story:`No message open: the verbs no-op and the bar surfaces a one-line reason
 instead of disabling.`,...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    hasThread: false,
    unavailableHint: "Open a message first",
    onForward: undefined
  }
}`,...a.parameters?.docs?.source},description:{story:`The two rules together: the host owns reply but not forward, and no message
 is open. Reply stays up and explains itself on press; forward is not there
 to press. Whether a message is open never decides which verbs exist.`,...a.parameters?.docs?.description}}};const W=["Default","Starred","WithoutForward","NoMessageOpen","NoMessageOpenWithoutForward"];export{o as Default,r as NoMessageOpen,a as NoMessageOpenWithoutForward,s as Starred,e as WithoutForward,W as __namedExportsOrder,R as default};
