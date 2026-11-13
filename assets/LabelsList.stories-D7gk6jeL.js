import{j as c}from"./iframe-fYsS-Mr7.js";import{L as m}from"./LabelsList-DFPI_RCc.js";import"./preload-helper-PPVm8Dsz.js";import"./button-S2h7_ODQ.js";import"./cn-IyxL_b2c.js";import"./input-Ejju9bJ0.js";import"./label-chip-h6m_g3T6.js";import"./label-color-CbbIIEbk.js";import"./select-CcR02dMm.js";import"./chevron-down-Dg-Z7_Bk.js";import"./createLucideIcon-B5J0h_XM.js";import"./trash-CtpmnHuk.js";const S={title:"Playground/Shipped/Settings/Labels/LabelsList",component:m,parameters:{layout:"padded"},decorators:[a=>c.jsx("div",{className:"mx-auto max-w-md",children:c.jsx(a,{})})],args:{onRename:()=>{},onRecolor:()=>{},onDelete:()=>{}}},e=a=>({labelId:"lbl-1",accountConfigId:"acc-1",name:"Receipts",color:"Blue",createdAt:0,updatedAt:0,filterCount:0,folders:[],...a}),i=[e({labelId:"lbl-1",name:"Receipts",color:"Blue",filterCount:0}),e({labelId:"lbl-2",name:"Travel",color:"Green",filterCount:1}),e({labelId:"lbl-3",name:"Urgent",color:"Red",filterCount:3})],d=[...i,e({labelId:"lbl-4",name:"Newsletters",color:"Yellow",filterCount:2}),e({labelId:"lbl-5",name:"Work",color:"Purple",filterCount:0}),e({labelId:"lbl-6",name:"Family",color:"Teal",filterCount:0}),e({labelId:"lbl-7",name:"Finance",color:"Orange",filterCount:4}),e({labelId:"lbl-8",name:"Recruiting",color:"Gray",filterCount:1}),e({labelId:"lbl-9",name:"Quarterly compliance filings that need a second look",color:"Default",filterCount:1})],r={args:{labels:[]}},t={args:{labels:i}},s={name:"Few (dark)",parameters:{theme:"dark"},args:{labels:i}},l={args:{labels:d}},o={args:{labels:i},play:async({canvasElement:a})=>{a.querySelector('button[aria-label="Rename label Receipts"]')?.click()}},n={args:{labels:i,deletingLabelId:"lbl-2"}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    labels: []
  }
}`,...r.parameters?.docs?.source},description:{story:"No labels yet — the empty-state copy points at the create form below.",...r.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    labels: fewLabels
  }
}`,...t.parameters?.docs?.source},description:{story:"A few labels, each showing its filter-usage line.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Few (dark)",
  parameters: {
    theme: "dark"
  },
  args: {
    labels: fewLabels
  }
}`,...s.parameters?.docs?.source},description:{story:"The same few labels, on the dark theme.",...s.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    labels: manyLabels
  }
}`,...l.parameters?.docs?.source},description:{story:"Many labels, including one with a long name that truncates in its chip.",...l.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    labels: fewLabels
  },
  play: async ({
    canvasElement
  }) => {
    const renameButton = canvasElement.querySelector<HTMLButtonElement>('button[aria-label="Rename label Receipts"]');
    renameButton?.click();
  }
}`,...o.parameters?.docs?.source},description:{story:"Renaming inline: clicking a label's chip swaps it for a focused text input.\nDriven here rather than passed as a prop — `editingId` is internal state.",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    labels: fewLabels,
    deletingLabelId: "lbl-2"
  }
}`,...n.parameters?.docs?.source},description:{story:"A delete in flight — the row's delete button disables.",...n.parameters?.docs?.description}}};const x=["Empty","Few","FewDark","Many","Renaming","Deleting"];export{n as Deleting,r as Empty,t as Few,s as FewDark,l as Many,o as Renaming,x as __namedExportsOrder,S as default};
