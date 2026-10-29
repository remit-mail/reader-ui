import{j as e}from"./iframe-Dz9ev7_1.js";import{F as a}from"./folder-row-BVjFYu7r.js";import"./preload-helper-PPVm8Dsz.js";import"./cn-d2XQ1MEC.js";import"./chevron-right-BgpxkwQ0.js";import"./createLucideIcon-RYwrBmYZ.js";import"./check-D-jt1aUx.js";import"./folder-BFMlMtyd.js";import"./circle-alert-CcoNAO8C.js";const v={title:"Design System/Folders/FolderRow",component:a,parameters:{layout:"centered"}};function r({children:i}){return e.jsx("div",{className:"w-[320px] overflow-hidden rounded-lg border border-line bg-surface font-sans text-fg",children:i})}const o={name:"Closed",render:()=>e.jsx(r,{children:e.jsx(a,{label:"Travel",depth:0,expanded:!1,ariaLabel:"Move to Travel",tabIndex:0})})},n={name:"The last change was refused",render:()=>e.jsx(r,{children:e.jsx(a,{label:"Locked",depth:0,expanded:!1,ariaLabel:"Locked",failure:"The mail server refused the last change: Permission denied",tabIndex:0})})},d={name:"Open, with its children indented under it",render:()=>e.jsxs(r,{children:[e.jsx(a,{label:"Travel",depth:0,expanded:!0,ariaLabel:"Move to Travel",separated:!0}),e.jsx(a,{label:"Hotels",depth:1,expanded:!1,ariaLabel:"Move to Hotels",separated:!0}),e.jsx(a,{label:"Flights",depth:1,expanded:!1,ariaLabel:"Move to Flights"})]})},l={name:"The destination",render:()=>e.jsx(r,{children:e.jsx(a,{label:"Hotels",depth:1,expanded:!1,selected:!0,ariaLabel:"Move to Hotels"})})},t={name:"The folder you are in",render:()=>e.jsx(r,{children:e.jsx(a,{label:"Inbox",depth:0,expanded:!1,current:!0,currentTag:"current",ariaLabel:"Inbox (current folder)"})})},s={name:"A branch held open by a match below it",render:()=>e.jsxs(r,{children:[e.jsx(a,{label:"Travel",depth:0,expanded:!0,context:!0,ariaLabel:"Travel (containing folder)",separated:!0}),e.jsx(a,{label:"Hotels",depth:1,expanded:!1,ariaLabel:"Move to Hotels"})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Closed",
  render: () => <List>
            <FolderRow label="Travel" depth={0} expanded={false} ariaLabel="Move to Travel" tabIndex={0} />
        </List>
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "The last change was refused",
  render: () => <List>
            <FolderRow label="Locked" depth={0} expanded={false} ariaLabel="Locked" failure="The mail server refused the last change: Permission denied" tabIndex={0} />
        </List>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Open, with its children indented under it",
  render: () => <List>
            <FolderRow label="Travel" depth={0} expanded ariaLabel="Move to Travel" separated />
            <FolderRow label="Hotels" depth={1} expanded={false} ariaLabel="Move to Hotels" separated />
            <FolderRow label="Flights" depth={1} expanded={false} ariaLabel="Move to Flights" />
        </List>
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "The destination",
  render: () => <List>
            <FolderRow label="Hotels" depth={1} expanded={false} selected ariaLabel="Move to Hotels" />
        </List>
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "The folder you are in",
  render: () => <List>
            <FolderRow label="Inbox" depth={0} expanded={false} current currentTag="current" ariaLabel="Inbox (current folder)" />
        </List>
}`,...t.parameters?.docs?.source},description:{story:"Where the messages live now: a marker, never a disabled control.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "A branch held open by a match below it",
  render: () => <List>
            <FolderRow label="Travel" depth={0} expanded context ariaLabel="Travel (containing folder)" separated />
            <FolderRow label="Hotels" depth={1} expanded={false} ariaLabel="Move to Hotels" />
        </List>
}`,...s.parameters?.docs?.source},description:{story:"A branch on screen only to hold the match under it: it reads, it never operates.",...s.parameters?.docs?.description}}};const g=["Closed","Failed","Open","Selected","Current","Context"];export{o as Closed,s as Context,t as Current,n as Failed,d as Open,l as Selected,g as __namedExportsOrder,v as default};
