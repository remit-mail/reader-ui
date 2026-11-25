import{j as t}from"./iframe-4Y_dM_UU.js";import{B as i}from"./button-BNcng5Oi.js";import{M as d}from"./mobile-message-action-bar-CgWZzU2v.js";import{F as p}from"./folder-input-DFYsKLGy.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-IyxL_b2c.js";import"./popover-menu-J9JsSQS3.js";import"./index-B3CIJJ7_.js";import"./index-DhYErdGu.js";import"./overlay-scope-Cd_Y4Jaa.js";import"./keymap-dispatch-DTaqnLKC.js";import"./createLucideIcon-DkKJcbI9.js";import"./reply-BHaPCgZO.js";import"./reply-all-C9P5qXUm.js";import"./star-DJsZr7L-.js";import"./trash-q_49bOYx.js";import"./mail-1N_4GVps.js";import"./mail-open-DGh6cZuy.js";const m=t.jsx(i,{variant:"ghost",size:"sm",icon:t.jsx(p,{className:"size-5"}),"aria-label":"Move to folder",title:"Move to folder",className:"min-h-11 min-w-11 px-0"}),R={title:"Design System/Mail/MobileMessageActionBar",component:d,parameters:{layout:"centered"},decorators:[(n=>t.jsx("div",{className:"overflow-hidden rounded-lg border border-line",style:{width:390},children:t.jsx(n,{})}))],args:{hasThread:!0,moveSlot:m,onReply:()=>{},onReplyAll:()=>{},onForward:()=>{},onToggleStar:()=>{},onDelete:()=>{},onToggleRead:()=>{},onUnavailable:()=>{}}},o={},s={args:{isStarred:!0}},e={args:{onForward:void 0}},r={args:{hasThread:!1,unavailableHint:"Open a message first"}},a={args:{hasThread:!1,unavailableHint:"Open a message first",onForward:void 0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
