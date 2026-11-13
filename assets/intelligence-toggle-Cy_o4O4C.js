import{j as t}from"./iframe-fYsS-Mr7.js";import{c as s}from"./cn-IyxL_b2c.js";import{B as o}from"./button-S2h7_ODQ.js";import{I as r}from"./info-CITyUvnK.js";function l({open:e=!1,enabled:n=!0,onToggle:a,className:i}){return t.jsx(o,{variant:"ghost",size:"sm",icon:t.jsx(r,{className:"size-4"}),title:"Intelligence","aria-label":e?"Hide intelligence sidebar":"Show intelligence sidebar","aria-pressed":e,disabled:!n,onClick:a,className:s(e&&"bg-accent-2-soft text-accent-2",i)})}l.__docgenInfo={description:`The (i) intelligence-rail toggle in the reading-pane toolbar.

The toolbar's control set is fixed: the toggle occupies the same slot on
every view and in every selection state, and reports that it cannot act by
being disabled rather than by vanishing (#52). A control that appears and
disappears moves its neighbours and leaves the user with nothing to learn
from; a greyed-out one stays where they last saw it.

The title names the control rather than the reason it is off. There are three
reasons (nothing selected, a window too narrow for the rail, a view with no
rail), a disabled \`Button\` is \`pointer-events-none\` so no tooltip surfaces
anyway, and a reason string that covers one case is wrong in the other two.`,methods:[],displayName:"IntelligenceToggle",props:{open:{required:!1,tsType:{name:"boolean"},description:"Whether the intelligence rail is currently open.",defaultValue:{value:"false",computed:!1}},enabled:{required:!1,tsType:{name:"boolean"},description:`Whether the toggle can act right now — a rail exists for this view, the
width allows it, and a thread is open. When false the button still renders,
greyed out (#52).`,defaultValue:{value:"true",computed:!1}},onToggle:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};export{l as I};
