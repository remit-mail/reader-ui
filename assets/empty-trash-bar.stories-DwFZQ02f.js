import{j as e}from"./iframe-fYsS-Mr7.js";import{E as r}from"./EmptyTrashBar-K4NBagD1.js";import"./preload-helper-PPVm8Dsz.js";import"./banner-2MU9qEbR.js";import"./cn-IyxL_b2c.js";import"./button-S2h7_ODQ.js";import"./x-sSwTlOFF.js";import"./createLucideIcon-B5J0h_XM.js";import"./confirm-dialog-CiVQifnw.js";import"./overlay-scope-DZJ3IC5F.js";import"./keymap-dispatch-DTaqnLKC.js";import"./use-modal-focus-DEMTiskN.js";import"./dialog-backdrop-_RGzPBbS.js";import"./format-CIELvwEW.js";import"./enums-CyACTv6m.js";import"./schemas-KRodOHJj.js";import"./trash-CtpmnHuk.js";const C={title:"Playground/Shipped/Mail/Empty trash",component:r,parameters:{layout:"fullscreen",docs:{description:{component:`Emptying Trash from the mailbox pane, and the three refusals the server can
answer with (#847).

The strip sits where the Spam rescue banner sits — above the list, in flow —
and the button always acts. Nothing here is pre-refused from what the client
believes the Trash appointment is: the press reaches the server and the 409
is the authority, so a folder nobody has tried to empty carries no warning.
A refusal is a standing fact about the account rather than an event, so it
lands under the button and stays there until the user repairs it.`}}}},p=()=>{},h=()=>e.jsx("ul",{className:"divide-y divide-line",children:[["Re: invoice 4421","Bookkeeping"],["Your parcel could not be delivered","PostNL"],["Weekly digest","Hacker Newsletter"]].map(([c,l])=>e.jsxs("li",{className:"px-row-inset py-3",children:[e.jsx("p",{className:"text-sm text-fg",children:c}),e.jsx("p",{className:"text-2xs text-fg-subtle",children:l})]},c))}),s={messageCount:128,isEmptying:!1,trashFolderLabel:"Deleted Items",onEmpty:p,onRepair:p,children:e.jsx(h,{})},a=({children:c})=>e.jsx("div",{className:"h-[520px] w-full max-w-2xl overflow-hidden border border-line bg-canvas",children:c}),t={render:()=>e.jsx(a,{children:e.jsx(r,{...s})})},n={render:()=>e.jsx(a,{children:e.jsx(r,{...s,isEmptying:!0})})},o={render:()=>e.jsx(a,{children:e.jsx(r,{...s,deletedCount:128})})},i={name:"Refused (unconfirmed)",render:()=>e.jsx(a,{children:e.jsx(r,{...s,refusalReason:"unconfirmed"})})},d={name:"Refused (stale)",render:()=>e.jsx(a,{children:e.jsx(r,{...s,refusalReason:"stale",staleFolderLabel:"Archive/Bin"})})},m={name:"Refused (none)",render:()=>e.jsx(a,{children:e.jsx(r,{...s,refusalReason:"none"})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Frame>
            <EmptyTrashBar {...base} />
        </Frame>
}`,...t.parameters?.docs?.source},description:{story:"The folder holds mail, so the verb is offered — quietly, and to the right.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Frame>
            <EmptyTrashBar {...base} isEmptying />
        </Frame>
}`,...n.parameters?.docs?.source},description:{story:"The press is in flight: the button says so and refuses a second one.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Frame>
            <EmptyTrashBar {...base} deletedCount={128} />
        </Frame>
}`,...o.parameters?.docs?.source},description:{story:`What the run reported, straight from the service. A second press re-marks
the same rows and honestly reports the same N — never 0 over an expunge.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: "Refused (unconfirmed)",
  render: () => <Frame>
            <EmptyTrashBar {...base} refusalReason="unconfirmed" />
        </Frame>
}`,...i.parameters?.docs?.source},description:{story:"reader matched the folder by name and nobody confirmed it. The words are\n`deleteConfirmationCopy`'s, so the dialog and this strip say the same thing.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Refused (stale)",
  render: () => <Frame>
            <EmptyTrashBar {...base} refusalReason="stale" staleFolderLabel="Archive/Bin" />
        </Frame>
}`,...d.parameters?.docs?.source},description:{story:"The folder the user chose is gone from the mail server, and is named.",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Refused (none)",
  render: () => <Frame>
            <EmptyTrashBar {...base} refusalReason="none" />
        </Frame>
}`,...m.parameters?.docs?.source},description:{story:"Nothing on this account is set as Trash, so there is nothing to empty.",...m.parameters?.docs?.description}}};const L=["Idle","Emptying","Emptied","RefusedUnconfirmed","RefusedStale","RefusedNone"];export{o as Emptied,n as Emptying,t as Idle,m as RefusedNone,d as RefusedStale,i as RefusedUnconfirmed,L as __namedExportsOrder,C as default};
